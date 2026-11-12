"""Render one shot's frames (resumable: existing frames are skipped).

    blender -b -P client-builds/lake-nyos/render.py -- SHOT [first last] [--preview] [--out DIR]

SHOT is 1..12; frames are 0..119 within the shot. --preview renders tiny stills
(270x480, 8 samples) for checking composition.
"""
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import nyos  # noqa: E402
import shots  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
preview = "--preview" in argv
out_root = os.path.join(HERE, "../../projects/lake-nyos/frames")
if "--out" in argv:
    out_root = argv[argv.index("--out") + 1]
nums = [a for a in argv if a.lstrip("-").isdigit() and not a.startswith("--")]
shot = int(nums[0])
first = int(nums[1]) if len(nums) > 1 else 0
last = int(nums[2]) if len(nums) > 2 else 119

res = (270, 480) if preview else nyos.RES
nyos.reset(res=res, samples=8 if preview else 10)
update = shots.SHOTS[shot - 1]()
sc = nyos.bpy.context.scene
d = os.path.join(out_root, f"s{shot:02d}")
os.makedirs(d, exist_ok=True)
step = int(argv[argv.index("--step") + 1]) if "--step" in argv else 1
for f in range(first, last + 1, step):
    path = os.path.join(d, f"f{f:04d}.png")
    if os.path.exists(path) and not preview:
        continue
    t = f / nyos.FPS
    update(t)
    sc.frame_set(f)
    sc.render.filepath = path
    t0 = time.time()
    nyos.bpy.ops.render.render(write_still=True)
    print(f"FRAME s{shot:02d} f{f:04d} {time.time() - t0:.1f}s", flush=True)
