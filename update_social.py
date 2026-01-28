from pathlib import Path
replacements = {
    'https://example.com/instagram': 'https://www.instagram.com/3huevcio/',
    'https://example.com/x': 'https://x.com/3HUEvCIO',
    'https://example.com/facebook': 'https://www.facebook.com/3HUEvCIO/',
    'https://example.com/youtube': 'https://www.youtube.com/channel/UC_zncktTxJLz6hPjonEyxyw',
}
for path in Path('.').rglob('*.html'):
    text = path.read_text()
    changed = False
    for old, new in replacements.items():
        if old in text:
            text = text.replace(old, new)
            changed = True
    if changed:
        path.write_text(text)
