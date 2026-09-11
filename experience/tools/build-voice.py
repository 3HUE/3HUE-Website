#!/usr/bin/env python3
"""Render every guide line to media/voice/<line-id>.mp3 with word timings in <line-id>.json (edge-tts neural voice).
Skips lines whose text hash is unchanged. Run from the experience folder: python tools/build-voice.py"""
import asyncio, hashlib, json, os, sys
import edge_tts
T = json.load(open('content/tour.json')); VOICE = T['guide'].get('voice', 'en-US-AvaNeural')
RATE = '+0%'
# Spoken forms: brand names the voice would otherwise spell out. Captions keep the written form.
import re
SPOKEN = [(re.compile(r'3HUE', re.I), 'three hue'), (re.compile(r'AiVRIC', re.I), 'Avaric'), (re.compile(r'\bvCISO\b'), 'virtual CISO'), (re.compile(r'\bSOC 2\b'), 'sock two'), (re.compile(r'\bSOC\b'), 'sock'), (re.compile(r'\bM365\b'), 'M three sixty-five')]
def spoken(t):
    for p, r in SPOKEN: t = p.sub(r, t)
    return t
lines = [l for n in T['nodes'].values() for l in n['lines']]
# Console: demo-mode FAQ answers + greeting are spoken in the same voice as the tour.
FAQ_PATH = 'content/faq.json'
faq = json.load(open(FAQ_PATH))
for i, f in enumerate(faq):
    f['audio'] = f'media/voice/faq-{i:02d}.mp3'
    lines.append({'id': f'faq-{i:02d}', 'text': f['a']})
GREETING = "Hi — I'm AiVRIC. Ask me anything about this room, the programs, pricing, or your next step. You can type, or start voice and just talk."
lines.append({'id': 'console-greeting', 'text': GREETING})
NOKB = "I don't have that in the tour materials yet. The fastest way to get an exact answer is 3HUE's Client Success team: 855-374-7129, success@3hue.net, or info.3hue.net/start-now. Would you like me to send that to your inbox, or is there something else about the programs I can help with?"
lines.append({'id': 'console-nokb', 'text': NOKB})
json.dump(faq, open(FAQ_PATH, 'w'), indent=1)
os.makedirs('media/voice', exist_ok=True)
async def render(l):
    mp3 = f"media/voice/{l['id']}.mp3"; js = f"media/voice/{l['id']}.json"
    say = spoken(l['text'])
    h = hashlib.sha1((VOICE + RATE + 'wb2' + say).encode()).hexdigest()[:12]
    if os.path.exists(js):
        try:
            if json.load(open(js)).get('hash') == h and os.path.getsize(mp3) > 0: return 'skip'
        except Exception: pass
    words = []
    c = edge_tts.Communicate(say, VOICE, rate=RATE, boundary='WordBoundary')
    with open(mp3, 'wb') as f:
        async for chunk in c.stream():
            if chunk['type'] == 'audio': f.write(chunk['data'])
            elif chunk['type'] == 'WordBoundary': words.append([round(chunk['offset'] / 1e7, 3), round(chunk['duration'] / 1e7, 3), chunk['text']])
    json.dump({'hash': h, 'words': words}, open(js, 'w'))
    return 'ok'
async def main():
    sem = asyncio.Semaphore(4); res = {'ok': 0, 'skip': 0, 'err': 0}
    async def one(l):
        async with sem:
            for attempt in range(3):
                try: r = await render(l); res[r] += 1; return
                except Exception as e: err = e; await asyncio.sleep(2)
            res['err'] += 1; print('FAILED', l['id'], err)
    await asyncio.gather(*(one(l) for l in lines)); print(res)
asyncio.run(main())
