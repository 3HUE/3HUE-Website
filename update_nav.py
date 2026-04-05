from pathlib import Path
import re


SITE_ROOT = Path(__file__).resolve().parent
SOURCE_FILE = SITE_ROOT / "index.html"
EXCLUDED_DIRS = {".git", "node_modules", "_archive", "3hue-new"}
LOCAL_ATTR_PATTERN = re.compile(
    r'(href|src|data-preview-image)="(?!https?:|//|#|mailto:|tel:)([^"]+)"'
)


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
    header_start = source.index('<header class="site-header">')
    main_start = source.index("<main", header_start)
    root_block = source[header_start:main_start]

    updated_files: list[Path] = []
    for path in SITE_ROOT.rglob("*.html"):
        if not is_supported_page(path):
            continue

        content = path.read_text(encoding="utf-8")
        if '<header class="site-header">' not in content or 'dropdown-solutions' not in content:
            continue

        start = content.index('<header class="site-header">')
        main_idx = content.index("<main", start)
        prefix = "" if path.parent == SITE_ROOT else "../"
        localized_block = make_local_block(root_block, prefix)
        new_content = content[:start] + localized_block + content[main_idx:]

        if new_content != content:
            path.write_text(new_content, encoding="utf-8", newline="\n")
            updated_files.append(path.relative_to(SITE_ROOT))

    print(f"Updated {len(updated_files)} file(s).")
    for path in sorted(updated_files):
        print(path.as_posix())


if __name__ == "__main__":
    main()
