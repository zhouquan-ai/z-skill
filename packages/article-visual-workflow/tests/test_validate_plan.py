from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = PACKAGE_ROOT / "skill" / "article-visual-workflow" / "scripts" / "validate_plan.py"
SPEC = importlib.util.spec_from_file_location("validate_plan", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class VisualPlanTests(unittest.TestCase):
    def test_two_synthetic_plans_validate(self) -> None:
        cases = (
            ("synthetic-article-argument.md", "planning-argument.md", {"场景图", "示意图", "不配图"}),
            ("synthetic-article-procedure.md", "planning-procedure.md", {"场景图", "示意图"}),
        )
        for article_name, plan_name, expected in cases:
            with self.subTest(article=article_name):
                article = (PACKAGE_ROOT / "examples" / article_name).read_text(encoding="utf-8")
                plan = (PACKAGE_ROOT / "examples" / "expected" / plan_name).read_text(encoding="utf-8")
                self.assertEqual(set(MODULE.validate(article, plan)), expected)

    def test_rejects_missing_article_anchor(self) -> None:
        article = (PACKAGE_ROOT / "examples" / "synthetic-article-argument.md").read_text(encoding="utf-8")
        plan = (PACKAGE_ROOT / "examples" / "expected" / "planning-argument.md").read_text(encoding="utf-8")
        with self.assertRaisesRegex(MODULE.PlanError, "插入位置不在冻结正文"):
            MODULE.validate(article, plan.replace("旧做法把上传、核对和批准混在同一个聊天窗口里", "正文中不存在的句子", 1))

    def test_rejects_private_path(self) -> None:
        article = (PACKAGE_ROOT / "examples" / "synthetic-article-argument.md").read_text(encoding="utf-8")
        plan = (PACKAGE_ROOT / "examples" / "expected" / "planning-argument.md").read_text(encoding="utf-8")
        with self.assertRaisesRegex(MODULE.PlanError, "绝对路径"):
            private_path = "C:" + "\\private\\image.png"
            MODULE.validate(article, plan + f"\n- 参考：{private_path}\n")


if __name__ == "__main__":
    unittest.main()
