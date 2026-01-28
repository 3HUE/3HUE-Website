from pathlib import Path
path = Path('web3-dmf/vault-detail-tutorial.js')
text = path.read_text()
old = "body: 'Review what each playbook covers and the evidence you'll need.'"
new = 'body: "Review what each playbook covers and the evidence you\'ll need."'
if old not in text:
    raise SystemExit('pattern not found')
path.write_text(text.replace(old, new, 1))
