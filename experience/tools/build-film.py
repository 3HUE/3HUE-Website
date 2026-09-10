#!/usr/bin/env python3
"""Build the opening film from the scene renders: four slow camera moves, cross-dissolved, 1280x720 @30fps.
Run from the experience folder: python tools/build-film.py"""
import subprocess, os
R = 'media/scene/rooms/'
shots = [  # (file, seconds, zoom start, zoom end, focus x, focus y)
    (R + 'vision.jpg',    3.6, 1.00, 1.18, 0.50, 0.55),   # lobby push-in
    (R + 'sea.jpg',       3.0, 1.15, 1.00, 0.50, 0.45),   # engineering bridge pull-out
    (R + 'boardroom.jpg', 3.0, 1.00, 1.16, 0.50, 0.50),   # boardroom push-in
    ('media/scene/master.jpg', 4.6, 1.30, 1.00, 0.50, 0.50),  # whole building, pull back to the full plate
]
fps, W, H, xf = 30, 1280, 720, 0.8
parts, inputs = [], []
for i, (f, sec, z0, z1, fx, fy) in enumerate(shots):
    n = int(sec * fps); inputs += ['-loop', '1', '-t', str(sec + 0.5), '-i', f]
    z = f"{z0}+({z1}-{z0})*on/{n}"
    parts.append(f"[{i}:v]scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,"
                 f"zoompan=z='{z}':x='iw*{fx}-(iw/zoom)*{fx}':y='ih*{fy}-(ih/zoom)*{fy}':d={n}:s={W}x{H}:fps={fps},setsar=1,format=yuv420p[v{i}]")
chain, prev, off = '', 'v0', 0
for i in range(1, len(shots)):
    off += shots[i - 1][1] - xf
    chain += f"[{prev}][v{i}]xfade=transition=fade:duration={xf}:offset={off:.2f}[x{i}];"; prev = f'x{i}'
total = sum(s[1] for s in shots) - xf * (len(shots) - 1)
chain += f"[{prev}]fade=t=in:st=0:d=0.8,fade=t=out:st={total - 0.9:.2f}:d=0.9,eq=saturation=1.05:contrast=1.03[out]"
os.makedirs('media/film', exist_ok=True)
subprocess.run(['ffmpeg', '-y'] + inputs + ['-filter_complex', ';'.join(parts) + ';' + chain, '-map', '[out]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-movflags', '+faststart', '-t', f'{total:.2f}', 'media/film/inside-3hue.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-ss', '0.9', '-i', 'media/film/inside-3hue.mp4', '-frames:v', '1', '-q:v', '3', 'media/film/poster.jpg'], check=True)
print('film', total, 's')
