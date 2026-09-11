#!/usr/bin/env python3
"""Render the guide lines for every persona: media/voice/<guide>/<line-id>.mp3 (+ .json word timings), edge-tts.
Lines pinned to a speaker (`who`) are rendered in that voice only; everything else in every guide's voice.
Lines that carry {name} are rendered from their `plain` form (the personalised version is spoken live by the
Worker's /tts when a backend is configured). Unchanged text is skipped by hash.
Run from the experience folder: python tools/build-voice.py"""
import asyncio, hashlib, json, os, re
import edge_tts
T = json.load(open('content/tour.json'))
GUIDES = T.get('guides') or {'ava': T['guide']}
RATE = '+0%'
# Spoken forms: brand names the voice would otherwise spell out. Captions keep the written form.
SPOKEN = [(re.compile(r'3HUE', re.I), 'three hue'), (re.compile(r'AiVRIC', re.I), 'Avaric'), (re.compile(r'\bvCISO\b'), 'virtual CISO'), (re.compile(r'\bSOC 2\b'), 'sock two'), (re.compile(r'\bSOC\b'), 'sock'), (re.compile(r'\bM365\b'), 'M three sixty-five')]
def spoken(t):
    for p, r in SPOKEN: t = p.sub(r, t)
    return t

jobs = []   # (guide id, line id, text)
for n in T['nodes'].values():
    for l in n['lines']:
        text = l.get('plain') or l['text']
        for g in ([l['who']] if l.get('who') else GUIDES):
            jobs.append((g, l['id'], text))
# Console: demo-mode FAQ answers + greeting/no-answer lines, in every guide's voice.
FAQ_PATH = 'content/faq.json'
faq = json.load(open(FAQ_PATH))
for i, f in enumerate(faq):
    f['audio'] = f'faq-{i:02d}'          # clip id; the console resolves media/voice/<guide>/<id>.mp3
    for g in GUIDES: jobs.append((g, f'faq-{i:02d}', f['a'].replace('{guide}', GUIDES[g]['name'])))
NOKB = "I don't have that in the tour materials yet. The fastest way to get an exact answer is 3HUE's Client Success team: 855-374-7129, success@3hue.net, or info.3hue.net/start-now. Would you like me to send that to your inbox, or is there something else about the programs I can help with?"
for g, G in GUIDES.items():
    jobs.append((g, 'console-greeting', f"Hi — I'm {G['name']}. Ask me anything about this room, the programs, pricing, or your next step. You can type, or start voice and just talk."))
    jobs.append((g, 'console-nokb', NOKB))
json.dump(faq, open(FAQ_PATH, 'w'), indent=1)
for g in GUIDES: os.makedirs(f'media/voice/{g}', exist_ok=True)

async def render(g, lid, text):
    voice = GUIDES[g]['voice']
    mp3 = f"media/voice/{g}/{lid}.mp3"; js = f"media/voice/{g}/{lid}.json"
    say = spoken(text)
    h = hashlib.sha1((voice + RATE + 'wb2' + say).encode()).hexdigest()[:12]
    if os.path.exists(js):
        try:
            if json.load(open(js)).get('hash') == h and os.path.getsize(mp3) > 0: return 'skip'
        except Exception: pass
    words = []
    c = edge_tts.Communicate(say, voice, rate=RATE, boundary='WordBoundary')
    with open(mp3, 'wb') as f:
        async for chunk in c.stream():
            if chunk['type'] == 'audio': f.write(chunk['data'])
            elif chunk['type'] == 'WordBoundary': words.append([round(chunk['offset'] / 1e7, 3), round(chunk['duration'] / 1e7, 3), chunk['text']])
    json.dump({'hash': h, 'words': words}, open(js, 'w'))
    return 'ok'
async def main():
    sem = asyncio.Semaphore(4); res = {'ok': 0, 'skip': 0, 'err': 0}
    async def one(j):
        async with sem:
            for attempt in range(3):
                try: r = await render(*j); res[r] += 1; return
                except Exception as e: err = e; await asyncio.sleep(2)
            res['err'] += 1; print('FAILED', j[:2], err)
    await asyncio.gather(*(one(j) for j in jobs)); print(res, f'({len(jobs)} clips)')
asyncio.run(main())
