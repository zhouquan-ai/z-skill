#!/usr/bin/env python3
"""Build a deterministic, offline WeChat article handoff from frozen inputs."""

from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import mimetypes
import re
import shutil
from pathlib import Path, PurePosixPath

IMAGE_PATTERN = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
LINK_PATTERN = re.compile(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)")
RAW_HTML_PATTERN = re.compile(r"<[A-Za-z][^>]*>")
FENCE_PATTERN = re.compile(r"^\s*```", re.MULTILINE)
TABLE_PATTERN = re.compile(r"^\s*\|.*\|\s*$", re.MULTILINE)
ALLOWED_ACCEPTANCE = {"pending", "passed", "failed"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_record(path: Path, display_name: str) -> dict[str, object]:
    return {"name": display_name, "bytes": path.stat().st_size, "sha256": sha256(path)}


def safe_image_reference(value: str) -> str:
    normalized = value.replace("\\", "/")
    parsed = PurePosixPath(normalized)
    if (
        parsed.is_absolute()
        or len(parsed.parts) != 2
        or parsed.parts[0] != "images"
        or parsed.parts[1] in {"", ".", ".."}
        or "://" in normalized
        or normalized.startswith("data:")
    ):
        raise ValueError(f"图片必须使用 images/<文件名> 相对路径：{value}")
    return parsed.parts[1]


def load_inputs(article: Path, images: Path, handoff: Path) -> tuple[str, dict, list[str]]:
    if article.suffix.lower() != ".md" or not article.is_file():
        raise ValueError("article 必须是存在的 .md 文件")
    if not images.is_dir():
        raise ValueError("images 必须是存在的目录")
    if not handoff.is_file():
        raise ValueError("handoff 必须是存在的 JSON 文件")

    markdown = article.read_text(encoding="utf-8")
    checklist = json.loads(handoff.read_text(encoding="utf-8"))
    required = {"article_id", "frozen", "expected_images", "mobile_acceptance"}
    missing = sorted(required - checklist.keys())
    if missing:
        raise ValueError(f"交接清单缺少字段：{', '.join(missing)}")
    if not isinstance(checklist["article_id"], str) or not checklist["article_id"].strip():
        raise ValueError("article_id 必须是非空字符串")
    if checklist["frozen"] is not True:
        raise ValueError("只接受 frozen=true 的冻结稿")
    if checklist["mobile_acceptance"] not in ALLOWED_ACCEPTANCE:
        raise ValueError("mobile_acceptance 只能是 pending、passed 或 failed")
    if not isinstance(checklist["expected_images"], list):
        raise ValueError("expected_images 必须是文件名数组")
    if RAW_HTML_PATTERN.search(markdown):
        raise ValueError("不支持原始 HTML")
    if FENCE_PATTERN.search(markdown):
        raise ValueError("不支持围栏代码")
    if TABLE_PATTERN.search(markdown):
        raise ValueError("不支持 Markdown 表格")

    referenced = [safe_image_reference(match.group(2).strip()) for match in IMAGE_PATTERN.finditer(markdown)]
    expected = checklist["expected_images"]
    if any(not isinstance(name, str) or Path(name).name != name for name in expected):
        raise ValueError("expected_images 只能包含图片文件名")
    if referenced != expected:
        raise ValueError(f"正文图片与交接清单不一致：正文={referenced}，清单={expected}")
    for name in referenced:
        target = images / name
        if not target.is_file():
            raise ValueError(f"图片不存在：{name}")
    return markdown, checklist, referenced


def inline_markup(text: str) -> str:
    escaped = html.escape(text, quote=True)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    escaped = LINK_PATTERN.sub(
        lambda match: (
            f'<a href="{html.escape(match.group(2), quote=True)}" '
            f'target="_blank" rel="noreferrer">{match.group(1)}</a>'
        ),
        escaped,
    )
    return escaped


def image_data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def markdown_to_html(markdown: str, images: Path) -> str:
    output: list[str] = []
    paragraph: list[str] = []
    list_type: str | None = None

    def close_paragraph() -> None:
        if paragraph:
            output.append(f"<p>{'<br>'.join(inline_markup(line) for line in paragraph)}</p>")
            paragraph.clear()

    def close_list() -> None:
        nonlocal list_type
        if list_type:
            output.append(f"</{list_type}>")
            list_type = None

    for raw in markdown.splitlines():
        line = raw.strip()
        if not line:
            close_paragraph()
            close_list()
            continue
        image_match = IMAGE_PATTERN.fullmatch(line)
        if image_match:
            close_paragraph()
            close_list()
            name = safe_image_reference(image_match.group(2).strip())
            src = image_data_uri(images / name)
            alt = html.escape(image_match.group(1), quote=True)
            output.append(f'<figure><img src="{src}" alt="{alt}"><figcaption>{alt}</figcaption></figure>')
            continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            close_paragraph()
            close_list()
            level = len(heading.group(1))
            output.append(f"<h{level}>{inline_markup(heading.group(2))}</h{level}>")
            continue
        if line.startswith("> "):
            close_paragraph()
            close_list()
            output.append(f"<blockquote>{inline_markup(line[2:])}</blockquote>")
            continue
        unordered = re.match(r"^[-*]\s+(.+)$", line)
        ordered = re.match(r"^\d+\.\s+(.+)$", line)
        if unordered or ordered:
            close_paragraph()
            desired = "ul" if unordered else "ol"
            if list_type != desired:
                close_list()
                list_type = desired
                output.append(f"<{list_type}>")
            value = (unordered or ordered).group(1)
            output.append(f"<li>{inline_markup(value)}</li>")
            continue
        close_list()
        paragraph.append(line)

    close_paragraph()
    close_list()
    return "\n".join(output)


STYLE = """
body{margin:0;background:#f4f6fb;color:#1b2540;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}
main{box-sizing:border-box;width:min(760px,100%);margin:0 auto;padding:48px 34px 72px;background:#fff;min-height:100vh}
h1{font-size:32px;line-height:1.35;margin:0 0 34px;color:#10214f}h2{font-size:24px;line-height:1.45;margin:42px 0 18px;color:#17357c}
h3{font-size:20px;line-height:1.5;margin:32px 0 14px}p,li,blockquote{font-size:17px;line-height:1.9;letter-spacing:.02em}
p{margin:0 0 20px}ul,ol{padding-left:1.5em;margin:0 0 24px}li{margin:7px 0}
blockquote{margin:24px 0;padding:16px 20px;border-left:4px solid #3157d5;background:#f3f6ff;color:#35466f}
figure{margin:30px 0}img{display:block;max-width:100%;height:auto;margin:0 auto}figcaption{text-align:center;color:#68728a;font-size:14px;margin-top:10px}
a{color:#3157d5}code{padding:2px 6px;border-radius:5px;background:#eef2fb;font-size:.9em}strong{color:#17357c}
@media(max-width:600px){main{padding:30px 20px 54px}h1{font-size:27px}h2{font-size:22px}p,li,blockquote{font-size:16px;line-height:1.85}}
""".strip()


def page(body: str, title: str) -> str:
    return (
        "<!doctype html>\n<html lang=\"zh-CN\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        f"<title>{html.escape(title)}</title><style>{STYLE}</style></head>"
        f"<body><main>{body}</main></body></html>\n"
    )


def build(article: Path, images: Path, handoff: Path, output: Path, validate_only: bool = False) -> dict:
    markdown, checklist, referenced = load_inputs(article, images, handoff)
    input_records = [
        file_record(article, article.name),
        file_record(handoff, handoff.name),
        *[file_record(images / name, f"images/{name}") for name in referenced],
    ]
    report = {
        "schema_version": 1,
        "valid": True,
        "article_id": checklist["article_id"],
        "frozen": True,
        "image_count": len(referenced),
        "mobile_acceptance": checklist["mobile_acceptance"],
        "automated_checks": [
            "frozen_markdown",
            "supported_structure",
            "relative_images",
            "image_manifest_match",
            "input_hashes",
        ],
        "human_check_required": checklist["mobile_acceptance"] != "passed",
    }
    if validate_only:
        return report

    if output.exists():
        if output.is_dir():
            shutil.rmtree(output)
        else:
            output.unlink()
    output.mkdir(parents=True)
    body = markdown_to_html(markdown, images)
    title_match = re.search(r"^#\s+(.+)$", markdown, re.MULTILINE)
    title = title_match.group(1) if title_match else checklist["article_id"]
    (output / "preview.html").write_text(page(body, title), encoding="utf-8", newline="\n")
    (output / "copyable.html").write_text(
        f"<!-- 复制下面的 article 内容；仍需真实编辑器与手机人工验收。 -->\n<article>{body}</article>\n",
        encoding="utf-8",
        newline="\n",
    )
    (output / "validation-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    output_records = [
        file_record(output / name, name)
        for name in ("preview.html", "copyable.html", "validation-report.json")
    ]
    receipt = {
        "schema_version": 1,
        "article_id": checklist["article_id"],
        "status": "local_build_ready",
        "mobile_acceptance": checklist["mobile_acceptance"],
        "wechat_page_status": "not_verified",
        "inputs": input_records,
        "outputs": output_records,
        "declaration": "本地构建完成不等于公众号保存、排期或发布完成。",
    }
    (output / "build-receipt.json").write_text(
        json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    return receipt


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--article", required=True, type=Path)
    parser.add_argument("--images", required=True, type=Path)
    parser.add_argument("--handoff", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    try:
        result = build(args.article, args.images, args.handoff, args.output, args.validate_only)
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError) as error:
        print(json.dumps({"valid": False, "error": str(error)}, ensure_ascii=False))
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
