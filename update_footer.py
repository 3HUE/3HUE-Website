from pathlib import Path
import re


SITE_ROOT = Path(__file__).resolve().parent
SOURCE_FILE = SITE_ROOT / "contact.html"
EXCLUDED_DIRS = {".git", "node_modules", "_archive", "3hue-new"}
LOCAL_ATTR_PATTERN = re.compile(
    r'(href|src|data-preview-image)="(?!https?:|//|#|mailto:|tel:)([^"]+)"'
)

LINK_UPDATES = [
    (
        'href="frameworks/index.html">Standards Alignment</a',
        'href="frameworks/index.html">Meta-Compliance Readiness</a',
    ),
    (
        'href="/web3-dmf/index.html">Digital Maturity Paradigm</a',
        'href="isg/platform-operating-model.html">ISG Managed GRC Operating Model</a',
    ),
]


def is_supported_page(path: Path) -> bool:
    if any(part in EXCLUDED_DIRS for part in path.parts):
        return False
    return path.suffix == ".html"


def make_local_block(block: str, prefix: str) -> str:
    if not prefix:
        return block

    def repl(match: re.Match[str]) -> str:
        attr, value = match.groups()
        return f'{attr}="{prefix}{value}"'

    return LOCAL_ATTR_PATTERN.sub(repl, block)


def main() -> None:
    source = SOURCE_FILE.read_text(encoding="utf-8")
    footer_start = source.index('<footer class="site-footer">')
    footer_end = source.index("</footer>", footer_start) + len("</footer>")
    root_block = source[footer_start:footer_end]

    for old, new in LINK_UPDATES:
        if old not in root_block:
            raise ValueError(f"Expected footer text not found: {old!r}")
        root_block = root_block.replace(old, new)

    updated_files: list[Path] = []
    for path in SITE_ROOT.rglob("*.html"):
        if not is_supported_page(path):
            continue

        content = path.read_text(encoding="utf-8")
        if '<footer class="site-footer">' not in content:
            continue

        start = content.index('<footer class="site-footer">')
        end = content.index("</footer>", start) + len("</footer>")
        prefix = "" if path.parent == SITE_ROOT else "../"
        localized_block = make_local_block(root_block, prefix)
        new_content = content[:start] + localized_block + content[end:]

        if new_content != content:
            path.write_text(new_content, encoding="utf-8", newline="\n")
            updated_files.append(path.relative_to(SITE_ROOT))

    print(f"Updated {len(updated_files)} file(s).")
    for path in sorted(updated_files):
        print(path.as_posix())


if __name__ == "__main__":
    main()
