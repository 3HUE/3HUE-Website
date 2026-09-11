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
