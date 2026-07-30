#!/usr/bin/env python3
"""Offline smoke core for filtering, deduplication, scoped writes, and Git audit."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import tomllib
from pathlib import Path, PurePosixPath
from typing import Any


def git_status(workspace: Path) -> list[str]:
    result = subprocess.run(
        ["git", "-C", str(workspace), "status", "--short"],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if result.returncode != 0:
        return ["not-a-git-repository"]
    return [line for line in result.stdout.splitlines() if line]


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json_atomic(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def append_audit(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")


def safe_relative_path(value: str, allowed_prefixes: list[str]) -> PurePosixPath | None:
    candidate = PurePosixPath(value)
    if candidate.is_absolute() or ".." in candidate.parts or not candidate.parts:
        return None
    normalized = candidate.as_posix()
    if not any(normalized.startswith(prefix) for prefix in allowed_prefixes):
        return None
    return candidate


def event_audit(event_id: str, decision: str, reason: str, **extra: Any) -> dict[str, Any]:
    return {
        "event_id": event_id,
        "decision": decision,
        "reason": reason,
        **extra,
    }


def run(
    config_path: Path,
    events_path: Path,
    workspace: Path,
    state_path: Path,
    audit_path: Path,
) -> list[dict[str, Any]]:
    config = tomllib.loads(config_path.read_text(encoding="utf-8"))
    bridge = config["bridge"]
    events = json.loads(events_path.read_text(encoding="utf-8"))
    workspace = workspace.resolve()
    workspace.mkdir(parents=True, exist_ok=True)

    state = read_json(state_path, {"processed_event_ids": []})
    processed = set(state.get("processed_event_ids", []))
    results: list[dict[str, Any]] = []

    for event in events:
        event_id = str(event.get("event_id", "missing"))
        if event_id in processed:
            record = event_audit(event_id, "duplicate", "already-processed")
            append_audit(audit_path, record)
            results.append(record)
            continue

        processed.add(event_id)
        text = str(event.get("text", ""))
        if event.get("chat_type") not in bridge["allowed_chat_types"]:
            record = event_audit(event_id, "rejected", "chat-type")
        elif event.get("sender_id") not in bridge["allowed_senders"]:
            record = event_audit(event_id, "rejected", "sender")
        elif len(text) > int(bridge["max_text_length"]):
            record = event_audit(event_id, "rejected", "message-length")
        elif not text.startswith(bridge["command_prefix"]):
            record = event_audit(event_id, "rejected", "command-prefix")
        else:
            command = text[len(bridge["command_prefix"]):].strip()
            if command == "status":
                status = git_status(workspace)
                record = event_audit(
                    event_id,
                    "completed",
                    "status",
                    git_status=status,
                )
            elif command.startswith("write "):
                if bridge["permission_mode"] != "workspace_write":
                    record = event_audit(event_id, "rejected", "read-only")
                elif not bool(bridge["require_explicit_write"]):
                    record = event_audit(event_id, "rejected", "write-intent-disabled")
                elif " :: " not in command:
                    record = event_audit(event_id, "rejected", "write-syntax")
                else:
                    raw_path, content = command[6:].split(" :: ", 1)
                    relative = safe_relative_path(
                        raw_path.strip(),
                        list(bridge["allowed_write_prefixes"]),
                    )
                    if relative is None:
                        record = event_audit(event_id, "rejected", "workspace-path")
                    else:
                        target = (workspace / Path(*relative.parts)).resolve()
                        if not target.is_relative_to(workspace):
                            record = event_audit(event_id, "rejected", "workspace-path")
                        else:
                            before = git_status(workspace)
                            target.parent.mkdir(parents=True, exist_ok=True)
                            target.write_text(content + "\n", encoding="utf-8", newline="\n")
                            digest = hashlib.sha256(target.read_bytes()).hexdigest()
                            after = git_status(workspace)
                            record = event_audit(
                                event_id,
                                "completed",
                                "workspace-write",
                                relative_path=relative.as_posix(),
                                sha256=digest,
                                git_before=before,
                                git_after=after,
                            )
            else:
                record = event_audit(event_id, "rejected", "unsupported-command")

        append_audit(audit_path, record)
        results.append(record)

    write_json_atomic(state_path, {"processed_event_ids": sorted(processed)})
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--events", required=True, type=Path)
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--state", required=True, type=Path)
    parser.add_argument("--audit", required=True, type=Path)
    args = parser.parse_args()

    try:
        results = run(
            args.config,
            args.events,
            args.workspace,
            args.state,
            args.audit,
        )
    except (OSError, KeyError, ValueError, json.JSONDecodeError, tomllib.TOMLDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    counts: dict[str, int] = {}
    for item in results:
        counts[item["decision"]] = counts.get(item["decision"], 0) + 1
    print(json.dumps({"events": len(results), "decisions": counts}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
