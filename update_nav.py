from pathlib import Path

ref = Path('frameworks/usr-framework.html').read_text()
start = ref.index('<header class="site-header">')
main_idx = ref.index('<main', start)
header_block = ref[start:main_idx]
header_root = header_block.replace('../', '')
files = [
    ('index.html', header_root),
    ('services/isg-managed-programs.html', header_block),
    ('services/continuous-risk-management.html', header_block),
    ('services/itg-managed-services.html', header_block),
]
for path, block in files:
    content = Path(path).read_text()
    s = content.index('<header class="site-header">')
    m = content.index('<main', s)
    new = content[:s] + block + content[m:]
    Path(path).write_text(new)
