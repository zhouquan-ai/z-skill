import copy
import importlib.util
import json
import unittest
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = (
    PACKAGE_ROOT
    / "skill"
    / "resume-library-management"
    / "scripts"
    / "validate_library.py"
)
SPEC = importlib.util.spec_from_file_location("validate_library", SCRIPT_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class ResumeLibraryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.library = json.loads(
            (PACKAGE_ROOT / "examples" / "synthetic-library.json").read_text(encoding="utf-8")
        )

    def test_complete_synthetic_library_validates(self):
        self.assertEqual(MODULE.validate(self.library), [])
        self.assertEqual(len(self.library["job_profiles"]), 2)
        self.assertEqual(len(self.library["outputs"]), 2)

    def test_rejects_unknown_source_reference(self):
        broken = copy.deepcopy(self.library)
        broken["facts"][0]["source_ids"] = ["SRC-MISSING"]
        self.assertTrue(
            any("unknown source SRC-MISSING" in error for error in MODULE.validate(broken))
        )

    def test_rejects_case_without_contribution_boundary(self):
        broken = copy.deepcopy(self.library)
        broken["cases"][0]["contribution_boundary"] = ""
        self.assertTrue(
            any("missing contribution_boundary" in error for error in MODULE.validate(broken))
        )

    def test_rejects_private_path_and_contact_patterns(self):
        broken = copy.deepcopy(self.library)
        broken["sources"][0]["locator"] = "C:" + "\\Private\\resume.pdf"
        broken["person"]["contact"] = "candidate@example.com"
        errors = MODULE.validate(broken)
        self.assertTrue(any("absolute path" in error for error in errors))
        self.assertTrue(any("email address" in error for error in errors))

    def test_expected_outputs_keep_fact_references_and_review_status(self):
        for name in ("resume-enterprise-legal.md", "resume-dispute-resolution.md"):
            text = (PACKAGE_ROOT / "examples" / "expected" / name).read_text(encoding="utf-8")
            self.assertIn("审阅状态：待人工审阅", text)
            self.assertIn("FACT-", text)
            self.assertIn("仿真", text)


if __name__ == "__main__":
    unittest.main()
