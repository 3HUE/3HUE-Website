#!/usr/bin/env python3
"""Point each room at media/scene/rooms/<room-id>.jpg when that file exists; otherwise keep zooming into the master.
Run from the experience root after dropping renders in. Idempotent."""
import json, os
p = 'content/experience.json'; m = json.load(open(p, encoding='utf-8'))
for r in m['rooms']:
    f = f"media/scene/rooms/{r['id']}.jpg"
    has = os.path.exists(f)
    r['render'] = f if has else None
    if has and 'focus' not in r: r['focus'] = {'x': 0.5, 'y': 0.5}
    print(f"{r['id']:10s} {'render ' + f if has else 'zoom into master'}")
json.dump(m, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
