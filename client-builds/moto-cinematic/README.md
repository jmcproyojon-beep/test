# Motorcycle cinematic reel

A 28.5 s, 9:16 product film for the client's motorcycle. It follows the style of the two reference clips:
- **Engine CGI teardown:** a dark studio, red lasers, macro parts and an ignition glow.
- **Exploded-to-assembled car:** loose parts coming together into the finished vehicle.

It is built 2.5D in Remotion from the client's product photo and cutaway diagram.

## Shots
| Time | Shot |
| --- | --- |
| 0–3.2 s | Parts laid out on a dark grid, with a laser sweep |
| 3.2–7 s | Combustion close-up, with four ignition flashes |
| 7–10.4 s | Meshing SVG gears, crossed by lasers |
| 10.4–13.6 s | Brake disc braking to a stop, with sparks |
| 13.6–16.4 s | Tyre-layer scan |
| 16.4–20.5 s | Parts fly in, then a red wireframe of the bike draws on |
| 20.5–25.5 s | Laser scan turns the wireframe into the real bike: light sweep, headlight flare, floor reflection, engine rev |
| 25.5–28.5 s | "PULSAR N160" title |

## Steps
1. **Cut-outs:** made with `cut_parts.py` and `cut_bike.py` (run inside `public/moto/`) (flood-fill white removal and a Sobel wireframe) from the two uploads. They go to `remotion-composer/public/moto/` as `bike.png`, `bike_wire.png`, `eng_inset.png`, `brake.png` and `tyre.png`.
2. **Sound:** `python3.13 -I mix.py` writes `audio/mix.wav`.
3. **Video:** from `remotion-composer`, run `npx remotion render src/moto/index.tsx MotoCinematic ../client-builds/moto-cinematic/moto-muted.mp4 --muted`. Then mux it with `audio/mix.wav`.
