#!/usr/bin/env python3
"""Validate an article visual plan without calling any image service."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ALLOWED_DECISIONS = {"场景图", "示意图", "不配图"}
REQUIRED_FIELDS = ("决策", "插入位置", "唯一任务", "决策理由")
GENERATED_FIELDS = ("生成提示", "验收条件", "局部重做条件")
PRIVATE_PATTERNS = (
    re.compile(r"[A-Za-z]:[\\/]", re.IGNORECASE),
    re.compile(r"(?i)(app[_ -]?secret|access[_ -]?token|cookie)\s*[:=]"),
    re.compile(r"周全秘书新版"),
)
PLAN_HEADING = re.compile(r"^##\s+(P\d{2})\s*$", re.MULTILINE)
FIELD_LINE = re.compile(r"^-\s*([^：:\n]+)[：:]\s*(.*?)\s*$", re.MULTILINE)


class PlanError(ValueError):
    """Raised when a visual plan does not satisfy the public schema."""


def parse_sections(text: str) -> list[tuple[str, str]]:
    matches = list(PLAN_HEADING.finditer(text))
    if not matches:
        raise PlanError("图片计划至少需要一个 P01 形式的计划项。")
    sections: list[tuple[str, str]] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        sections.append((match.group(1), text[match.end():end]))
    ids = [item[0] for item in sections]
    if len(ids) != len(set(ids)):
        raise PlanError("计划项编号不得重复。")
    return sections


def fields_for(body: str) -> dict[str, str]:
    return {key.strip(): value.strip() for key, value in FIELD_LINE.findall(body)}


def validate(article_text: str, plan_text: str) -> list[str]:
    for pattern in PRIVATE_PATTERNS:
        if pattern.search(plan_text):
            raise PlanError("计划中出现绝对路径、凭据字段或私人工作区名称。")

    decisions: list[str] = []
    for plan_id, body in parse_sections(plan_text):
        fields = fields_for(body)
        missing = [field for field in REQUIRED_FIELDS if not fields.get(field)]
        if missing:
            raise PlanError(f"{plan_id} 缺少字段：{'、'.join(missing)}。")
        decision = fields["决策"]
        if decision not in ALLOWED_DECISIONS:
            raise PlanError(f"{plan_id} 决策必须是场景图、示意图或不配图。")
        if fields["插入位置"] not in article_text:
            raise PlanError(f"{plan_id} 插入位置不在冻结正文中。")
        if decision != "不配图":
            missing_generated = [field for field in GENERATED_FIELDS if not fields.get(field)]
            if missing_generated:
                raise PlanError(f"{plan_id} 缺少生成或验收字段：{'、'.join(missing_generated)}。")
        if decision == "示意图":
            sketch = re.search(r"-\s*ASCII草图[：:]\s*\n+```text\s*\n(.+?)\n```", body, re.DOTALL)
            if sketch is None or not sketch.group(1).strip():
                raise PlanError(f"{plan_id} 示意图必须包含非空 ASCII 草图。")
        decisions.append(decision)
    return decisions


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--article", required=True, type=Path)
    parser.add_argument("--plan", required=True, type=Path)
    args = parser.parse_args()
    article = args.article.read_text(encoding="utf-8")
    plan = args.plan.read_text(encoding="utf-8")
    decisions = validate(article, plan)
    print(f"validated={len(decisions)} decisions={','.join(decisions)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
