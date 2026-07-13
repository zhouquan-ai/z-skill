import argparse
import sys

from markdownify import markdownify


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert HTML from stdin to Markdown on stdout.")
    parser.parse_args()
    html = sys.stdin.read()
    converted = markdownify(
        html,
        heading_style="ATX",
        bullets="-",
        strip=["script", "style", "noscript"],
    ).strip()
    sys.stdout.write(converted)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
