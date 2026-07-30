#!/usr/bin/env python3
"""Validate a shareable resume library example using Python standard library."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


EVIDENCE_GRADES = {"A", "B", "C", "D", "E"}
VERIFICATION_STATUSES = {
    "已核验",
    "用户确认",
    "多源一致",
    "单源待核",
    "存在冲突",
    "已废止",
}
REVIEW_STATUSES = {"待人工审阅", "人工审阅完成", "用户明确不采用"}
PRIVATE_PATTERNS = {
    "absolute path": re.compile(r"(?:[A-Za-z]:\\|/(?:Users|home)/)"),
    "mainland mobile number": re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)"),
    "email address": re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    "secret-like value": re.compile(r"\b(?:sk-|token[:=_-]|app_secret[:=_-])\S{8,}", re.I),
}


def require_fields(record: dict[str, Any], fields: tuple[str, ...], context: str) -> list[str]:
    errors = []
    for field in fields:
        if field not in record or record[field] in (None, "", []):
            errors.append(f"{context}: missing {field}")
    return errors


def walk_strings(value: Any, path: str = "$"):
    if isinstance(value, dict):
        for key, item in value.items():
            yield from walk_strings(item, f"{path}.{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            yield from walk_strings(item, f"{path}[{index}]")
    elif isinstance(value, str):
        yield path, value


def validate(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    errors.extend(require_fields(data, ("schema_version", "synthetic", "person"), "root"))
    for name in ("sources", "facts", "cases", "modules", "job_profiles", "outputs"):
        if not isinstance(data.get(name), list) or not data[name]:
            errors.append(f"root: {name} must be a non-empty list")

    if data.get("synthetic") is not True:
        errors.append("root: public example must set synthetic=true")

    sources = {item.get("source_id"): item for item in data.get("sources", [])}
    facts = {item.get("fact_id"): item for item in data.get("facts", [])}
    modules = {item.get("module_id"): item for item in data.get("modules", [])}
    profiles = {item.get("profile_id"): item for item in data.get("job_profiles", [])}

    if None in sources or len(sources) != len(data.get("sources", [])):
        errors.append("sources: source_id values must be present and unique")
    if None in facts or len(facts) != len(data.get("facts", [])):
        errors.append("facts: fact_id values must be present and unique")
    if None in modules or len(modules) != len(data.get("modules", [])):
        errors.append("modules: module_id values must be present and unique")
    if None in profiles or len(profiles) != len(data.get("job_profiles", [])):
        errors.append("job_profiles: profile_id values must be present and unique")

    for source_id, source in sources.items():
        errors.extend(require_fields(
            source,
            ("source_id", "title", "kind", "evidence_grade", "verification_status", "locator"),
            f"source {source_id}",
        ))
        if source.get("evidence_grade") not in EVIDENCE_GRADES:
            errors.append(f"source {source_id}: invalid evidence_grade")
        if source.get("verification_status") not in VERIFICATION_STATUSES:
            errors.append(f"source {source_id}: invalid verification_status")

    for fact_id, fact in facts.items():
        errors.extend(require_fields(
            fact,
            ("fact_id", "fact_type", "summary", "source_ids", "verification_status", "last_reviewed"),
            f"fact {fact_id}",
        ))
        if fact.get("verification_status") not in VERIFICATION_STATUSES:
            errors.append(f"fact {fact_id}: invalid verification_status")
        for source_id in fact.get("source_ids", []):
            if source_id not in sources:
                errors.append(f"fact {fact_id}: unknown source {source_id}")

    for case in data.get("cases", []):
        case_id = case.get("case_id")
        errors.extend(require_fields(
            case,
            (
                "case_id",
                "experience_fact_id",
                "objective_facts",
                "personal_actions",
                "contribution_boundary",
                "source_ids",
                "verification_status",
            ),
            f"case {case_id}",
        ))
        if case.get("experience_fact_id") not in facts:
            errors.append(f"case {case_id}: unknown experience_fact_id")
        for source_id in case.get("source_ids", []):
            if source_id not in sources:
                errors.append(f"case {case_id}: unknown source {source_id}")

    for module_id, module in modules.items():
        errors.extend(require_fields(
            module,
            (
                "module_id",
                "name",
                "fact_ids",
                "short_statement",
                "standard_statement",
                "contribution_boundary",
                "suitable_roles",
                "output_readiness",
            ),
            f"module {module_id}",
        ))
        for fact_id in module.get("fact_ids", []):
            if fact_id not in facts:
                errors.append(f"module {module_id}: unknown fact {fact_id}")

    for profile_id, profile in profiles.items():
        errors.extend(require_fields(
            profile,
            ("profile_id", "target_role", "profile_type", "core_tasks", "must_have", "risk_boundaries"),
            f"profile {profile_id}",
        ))

    output_ids: set[str] = set()
    for output in data.get("outputs", []):
        output_id = output.get("output_id")
        errors.extend(require_fields(
            output,
            (
                "output_id",
                "job_profile_id",
                "selected_module_ids",
                "fact_snapshot_date",
                "review_status",
                "draft_file",
            ),
            f"output {output_id}",
        ))
        if output_id in output_ids:
            errors.append(f"output {output_id}: duplicate output_id")
        output_ids.add(output_id)
        if output.get("job_profile_id") not in profiles:
            errors.append(f"output {output_id}: unknown job_profile_id")
        if output.get("review_status") not in REVIEW_STATUSES:
            errors.append(f"output {output_id}: invalid review_status")
        for module_id in output.get("selected_module_ids", []):
            if module_id not in modules:
                errors.append(f"output {output_id}: unknown module {module_id}")

    for path, text in walk_strings(data):
        for label, pattern in PRIVATE_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"{path}: contains {label}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True, type=Path)
    args = parser.parse_args()

    try:
        data = json.loads(args.library.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    errors = validate(data)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(
        "OK: "
        f"{len(data['sources'])} sources, "
        f"{len(data['facts'])} facts, "
        f"{len(data['cases'])} cases, "
        f"{len(data['modules'])} modules, "
        f"{len(data['job_profiles'])} job profiles, "
        f"{len(data['outputs'])} outputs"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
