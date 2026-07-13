import argparse
import json
import sys

import trafilatura
from trafilatura.settings import use_config


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract a public web page with Trafilatura.")
    parser.add_argument("url")
    parser.add_argument("--stdin-html", action="store_true")
    args = parser.parse_args()

    try:
        config = use_config()
        config.set("DEFAULT", "DOWNLOAD_TIMEOUT", "15")
        config.set("DEFAULT", "EXTRACTION_TIMEOUT", "15")
        config.set("DEFAULT", "SLEEP_TIME", "0")
        html = sys.stdin.read() if args.stdin_html else trafilatura.fetch_url(args.url, config=config)
        if not html:
            raise RuntimeError("网页下载结果为空。")

        document = trafilatura.bare_extraction(
            html,
            url=args.url,
            with_metadata=True,
            include_comments=False,
            include_formatting=True,
            include_links=True,
            config=config,
        )
        markdown = trafilatura.extract(
            html,
            url=args.url,
            output_format="markdown",
            with_metadata=False,
            include_comments=False,
            include_formatting=True,
            include_links=True,
            config=config,
        )
        if document is None or not markdown:
            raise RuntimeError("未识别到可用正文。")

        metadata = document.as_dict()
        payload = {
            "title": metadata.get("title") or "",
            "author": metadata.get("author") or "",
            "date": metadata.get("date") or "",
            "markdown": markdown.strip(),
        }
        json.dump(payload, sys.stdout, ensure_ascii=False)
        return 0
    except Exception as exc:  # noqa: BLE001 - CLI must return a concise route error
        json.dump({"error": str(exc)}, sys.stdout, ensure_ascii=False)
        return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
