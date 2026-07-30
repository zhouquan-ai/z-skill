import importlib.util
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = (
    PACKAGE_ROOT
    / "skill"
    / "feishu-local-ai-bridge"
    / "scripts"
    / "smoke_bridge.py"
)
SPEC = importlib.util.spec_from_file_location("smoke_bridge", SCRIPT_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class BridgeSmokeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.workspace = self.root / "workspace"
        shutil.copytree(PACKAGE_ROOT / "examples" / "smoke-repo", self.workspace)
        subprocess.run(
            ["git", "-C", str(self.workspace), "init", "-q"],
            check=True,
            capture_output=True,
        )
        self.state = self.root / "state" / "dedup.json"
        self.audit = self.root / "audit" / "events.jsonl"

    def tearDown(self):
        self.temporary.cleanup()

    def run_example(self):
        return MODULE.run(
            PACKAGE_ROOT / "examples" / "config.smoke.toml",
            PACKAGE_ROOT / "examples" / "events.smoke.json",
            self.workspace,
            self.state,
            self.audit,
        )

    def test_filters_deduplicates_and_scopes_write(self):
        results = self.run_example()
        decisions = [item["decision"] for item in results]
        self.assertEqual(decisions.count("completed"), 2)
        self.assertEqual(decisions.count("duplicate"), 1)
        self.assertEqual(decisions.count("rejected"), 3)
        self.assertTrue((self.workspace / "smoke-output" / "result.md").exists())
        self.assertFalse((self.root / "outside.md").exists())

    def test_write_records_relative_path_hash_and_git_state(self):
        results = self.run_example()
        write = next(item for item in results if item["reason"] == "workspace-write")
        target = self.workspace / write["relative_path"]
        self.assertEqual(
            write["sha256"],
            MODULE.hashlib.sha256(target.read_bytes()).hexdigest(),
        )
        self.assertNotEqual(write["git_before"], write["git_after"])
        self.assertNotIn(str(self.workspace), json.dumps(write, ensure_ascii=False))

    def test_second_delivery_is_fully_deduplicated(self):
        self.run_example()
        second = self.run_example()
        self.assertTrue(all(item["decision"] == "duplicate" for item in second))

    def test_audit_omits_sender_message_and_absolute_path(self):
        self.run_example()
        audit_text = self.audit.read_text(encoding="utf-8")
        self.assertNotIn("user-example-001", audit_text)
        self.assertNotIn("offline smoke accepted", audit_text)
        self.assertNotIn(str(self.workspace), audit_text)

    def test_read_only_mode_rejects_write(self):
        config = self.root / "read-only.toml"
        config.write_text(
            "\n".join(
                [
                    "[bridge]",
                    'permission_mode = "read_only"',
                    'allowed_chat_types = ["p2p"]',
                    'allowed_senders = ["user-example-001"]',
                    'command_prefix = "/ai "',
                    "max_text_length = 500",
                    "require_explicit_write = true",
                    'allowed_write_prefixes = ["smoke-output/"]',
                    "",
                ]
            ),
            encoding="utf-8",
        )
        events = self.root / "write-event.json"
        events.write_text(
            json.dumps(
                [
                    {
                        "event_id": "evt-read-only",
                        "chat_type": "p2p",
                        "sender_id": "user-example-001",
                        "text": "/ai write smoke-output/result.md :: blocked",
                    }
                ]
            ),
            encoding="utf-8",
        )
        results = MODULE.run(config, events, self.workspace, self.state, self.audit)
        self.assertEqual(results[0]["reason"], "read-only")
        self.assertFalse((self.workspace / "smoke-output" / "result.md").exists())


if __name__ == "__main__":
    unittest.main()
