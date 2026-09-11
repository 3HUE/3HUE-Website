"""Bake subtle motion into the room backdrops so the wall displays read as live screens.

For each backdrop in tools/screens.json the display regions (axis-aligned rects or 4-point quads, normalized
image coordinates) get, in their own rectified space: a gentle brightness breath, a slow downward scan
shimmer, a soft refresh glint once per loop, a few 'widget tick' pulses and a blinking status LED. Glows
(the atrium fabric, hallway orbs) pulse. Everything is warped back through the display's perspective, so the
render's geometry is untouched — only the pixels on the screens move. Output: a seamless 4 s H.264 loop per
backdrop in media/scene/anim/<name>.mp4 and .webm (the original JPG stays as the poster / fallback).

    python tools/build-anim.py            # all backdrops
    python tools/build-anim.py vision     # one
"""
import json, math, os, subprocess, sys, tempfile, random
import numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = json.load(open(os.path.join(ROOT, 'tools', 'screens.json')))
OUT = os.path.join(ROOT, 'media', 'scene', 'anim'); os.makedirs(OUT, exist_ok=True)
FPS, SECONDS = 24, 4
N = FPS * SECONDS
TONE = {'blue': (255, 182, 31), 'gold': (58, 214, 255), 'green': (157, 229, 46)}   # BGR

def quad_of(sc):
    if 'q' in sc: return np.float32(sc['q'])
    x, y, w, h = sc['r']; return np.float32([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])

def screen_layers(img, quads, seed):
    """Precompute per-screen: rectified size, homography, mask. Returns list of dicts."""
    H, W = img.shape[:2]; out = []
    rng = random.Random(seed)
    for q in quads:
        P = q * np.float32([W, H])
        rw = int(max(np.linalg.norm(P[1] - P[0]), np.linalg.norm(P[2] - P[3]))); rh = int(max(np.linalg.norm(P[3] - P[0]), np.linalg.norm(P[2] - P[1])))
        rw, rh = max(rw, 8), max(rh, 8)
        M = cv2.getPerspectiveTransform(np.float32([[0, 0], [rw, 0], [rw, rh], [0, rh]]), P)
        mask = np.zeros((H, W), np.float32); cv2.fillConvexPoly(mask, P.astype(np.int32), 1.0)
        mask = cv2.GaussianBlur(mask, (0, 0), 1.2)
        ticks = [(rng.uniform(0.08, 0.75), rng.uniform(0.15, 0.8), rng.uniform(0.08, 0.2), rng.uniform(0.06, 0.14), rng.random()) for _ in range(3)]
        out.append(dict(rw=rw, rh=rh, M=M, mask=mask[..., None], ph=rng.random(), ticks=ticks, big=rw > W * 0.12))
    return out

def effect_frame(L, t):
    """Additive (float, BGR, may be negative) layer in rectified space for loop phase t in [0,1)."""
    rw, rh, ph = L['rw'], L['rh'], L['ph']
    add = np.zeros((rh, rw, 3), np.float32)
    yy = np.linspace(0, 1, rh, dtype=np.float32)[:, None]; xx = np.linspace(0, 1, rw, dtype=np.float32)[None, :]
    # breathing brightness (±2.5%) — applied later as multiplicative via 'gain'
    gain = 1 + 0.025 * math.sin(2 * math.pi * (t + ph))
    # scan shimmer: soft band drifting down once per loop
    sv = (t + ph * 0.37) % 1.0; band = np.exp(-((yy - sv) ** 2) / (2 * 0.035 ** 2))
    add += band[..., None] * np.float32([24, 19, 13])
    # refresh glint: diagonal sweep once per loop, quick
    u = ((t + ph * 0.61) % 1.0)
    if u < 0.28:
        p = u / 0.28; center = -0.3 + 1.6 * p; d = (xx * 0.8 + yy * 0.2) - center
        glint = np.exp(-(d ** 2) / (2 * 0.06 ** 2)) * math.sin(p * math.pi)
        add += glint[..., None] * np.float32([44, 38, 32])
    # widget ticks: small tiles that brighten briefly (values updating)
    for (tx, ty, tw, th, tp) in L['ticks']:
        v = (t + tp) % 1.0; k = math.exp(-((v - 0.5) ** 2) / (2 * 0.06 ** 2)) * 0.9
        if k > 0.02:
            x0, y0, x1, y1 = int(tx * rw), int(ty * rh), int((tx + tw) * rw), int((ty + th) * rh)
            add[y0:y1, x0:x1] += np.float32([22, 20, 16]) * k
    # status LED (top-right), blinking, on larger displays only
    if L['big']:
        b = 0.5 + 0.5 * math.sin(2 * math.pi * (2 * t + ph)); r = max(2, rw // 180)
        cv2.circle(add, (int(rw * 0.965), int(rh * 0.06)), r, tuple(float(c) * b * 0.9 for c in TONE['green']), -1, cv2.LINE_AA)
        # slow progress line along the bottom
        pr = (t + ph * 0.3) % 1.0
        cv2.rectangle(add, (int(rw * 0.04), int(rh * 0.962)), (int(rw * (0.04 + 0.92 * pr)), int(rh * 0.962) + max(1, rh // 220)), (120, 80, 20), -1)
    return add, gain

def build(name, spec):
    src = os.path.join(ROOT, 'media', 'scene', name if name.endswith('.jpg') else f'rooms/{name}.jpg')
    if not os.path.exists(src): src = os.path.join(ROOT, name)
    img = cv2.imread(src).astype(np.float32); H, W = img.shape[:2]
    quads = [quad_of(s) for s in spec.get('screens', [])]
    if spec.get('slide'):   # the hand-fitted primary quad replaces any rect whose centre falls inside it
        sq = np.float32(spec['slide']['q'])
        quads = [q for q in quads if cv2.pointPolygonTest(sq, tuple(map(float, q.mean(0))), False) < 0] + [sq]
    layers = screen_layers(img, quads, seed=hash(name) & 0xffff)
    glows = spec.get('glows', [])
    tmp = tempfile.mkdtemp(); base = os.path.splitext(os.path.basename(src))[0]
    for i in range(N):
        t = i / N; frame = img.copy()
        for L in layers:
            add, gain = effect_frame(L, t)
            warped = cv2.warpPerspective(add, L['M'], (W, H), flags=cv2.INTER_LINEAR)
            frame = frame * (1 + (gain - 1) * L['mask']) + warped * L['mask']
        for g in glows:
            cx, cy, r = g['c'][0] * W, g['c'][1] * H, g['r'] * W * 1.5
            a = 0.10 + 0.08 * math.sin(2 * math.pi * (t * 2 + 0.2))
            yy, xx = np.ogrid[:H, :W]; d2 = ((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r)
            glow = np.exp(-d2 * 2.2) * a; col = np.float32(TONE.get(g.get('tone', 'blue'), TONE['blue']))
            frame += glow[..., None] * col
        cv2.imwrite(os.path.join(tmp, f'{i:04d}.png'), np.clip(frame, 0, 255).astype(np.uint8))
    out = os.path.join(OUT, base + '.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(tmp, '%04d.png'),
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'slow', '-movflags', '+faststart',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', out], check=True)
    # WebM (VP9) twin for browsers without H.264 (some Chromium builds, Linux Firefox)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(tmp, '%04d.png'),
                    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32', '-row-mt', '1', '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', out[:-4] + '.webm'], check=True)
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    print(f'{base}.mp4  {os.path.getsize(out) / 1e6:.2f} MB  ({len(layers)} screens, {len(glows)} glows)')

if __name__ == '__main__':
    only = sys.argv[1:]
    for key, spec in SPEC.items():
        base = os.path.splitext(os.path.basename(key))[0]
        if only and base not in only: continue
        build(key.replace('media/scene/', ''), spec)
