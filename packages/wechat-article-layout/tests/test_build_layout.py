import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

PACKAGE = Path(__file__).resolve().parents[1]
SCRIPT = PACKAGE / "skill" / "wechat-article-layout" / "scripts" / "build_layout.py"
SPEC = importlib.util.spec_from_file_location("build_layout", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class BuildLayoutTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.article = self.root / "article.md"
        self.images = self.root / "images"
        self.images.mkdir()
        self.image = self.images / "figure.svg"
        self.image.write_text("<svg xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"10\" height=\"10\"/></svg>", encoding="utf-8")
        self.article.write_text("# 仿真稿\n\n正文。\n\n![图](images/figure.svg)\n", encoding="utf-8")
        self.handoff = self.root / "handoff.json"
        self.write_handoff()

    def tearDown(self):
        self.temp.cleanup()

    def write_handoff(self, **changes):
        data = {
            "article_id": "SYNTHETIC-001",
            "frozen": True,
            "expected_images": ["figure.svg"],
            "mobile_acceptance": "pending",
        }
        data.update(changes)
        self.handoff.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

    def test_builds_four_outputs_and_hash_receipt(self):
        output = self.root / "output"
        receipt = MODULE.build(self.article, self.images, self.handoff, output)
        self.assertEqual(receipt["status"], "local_build_ready")
        self.assertEqual(receipt["wechat_page_status"], "not_verified")
        self.assertEqual({path.name for path in output.iterdir()}, {
            "preview.html", "copyable.html", "validation-report.json", "build-receipt.json"
        })
        self.assertIn("data:image/svg+xml;base64,", (output / "copyable.html").read_text(encoding="utf-8"))

    def test_repeated_build_is_deterministic(self):
        first = self.root / "first"
        second = self.root / "second"
        MODULE.build(self.article, self.images, self.handoff, first)
        MODULE.build(self.article, self.images, self.handoff, second)
        for name in ("preview.html", "copyable.html", "validation-report.json", "build-receipt.json"):
            self.assertEqual((first / name).read_bytes(), (second / name).read_bytes())

    def test_missing_image_fails(self):
        self.image.unlink()
        with self.assertRaisesRegex(ValueError, "图片不存在"):
            MODULE.build(self.article, self.images, self.handoff, self.root / "output")

    def test_manifest_mismatch_fails(self):
        self.write_handoff(expected_images=[])
        with self.assertRaisesRegex(ValueError, "不一致"):
            MODULE.build(self.article, self.images, self.handoff, self.root / "output")

    def test_unfrozen_article_fails(self):
        self.write_handoff(frozen=False)
        with self.assertRaisesRegex(ValueError, "frozen=true"):
            MODULE.build(self.article, self.images, self.handoff, self.root / "output")

    def test_remote_image_and_raw_html_fail(self):
        self.article.write_text("# 稿件\n\n![图](https://example.test/a.png)\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "相对路径"):
            MODULE.build(self.article, self.images, self.handoff, self.root / "output")
        self.article.write_text("# 稿件\n\n<section>raw</section>\n", encoding="utf-8")
        self.write_handoff(expected_images=[])
        with self.assertRaisesRegex(ValueError, "原始 HTML"):
            MODULE.build(self.article, self.images, self.handoff, self.root / "output")

    def test_mobile_acceptance_is_preserved_not_inferred(self):
        output = self.root / "output"
        receipt = MODULE.build(self.article, self.images, self.handoff, output)
        self.assertEqual(receipt["mobile_acceptance"], "pending")
        report = json.loads((output / "validation-report.json").read_text(encoding="utf-8"))
        self.assertTrue(report["human_check_required"])


if __name__ == "__main__":
    unittest.main()
