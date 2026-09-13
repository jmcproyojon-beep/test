# OpenMontage — setup notes for this checkout

This repository is a checkout of [OpenMontage](https://github.com/calesthio/OpenMontage)
at upstream commit `08e2151` ("docs: add Objects in Overdrive video showcase"),
installed and verified in a Linux container. Everything below is what the
install actually did, plus the two environment-specific bits that differ from a
plain `make setup` on a laptop.

## Install

```bash
sudo apt install ffmpeg          # system prerequisite (Node 22 + Python 3.11 were already present)
make setup                       # venv (Python 3.10 via uv), pip deps, Remotion npm deps, Piper TTS, HyperFrames cache, .env
make install-dev                 # pytest and friends
npx --yes hyperframes browser ensure   # Chrome Headless Shell used for local rendering
```

Everyday use starts with the venv active:

```bash
source .venv/bin/activate
```

That matters for more than convenience: `piper_tts` (and therefore `tts_selector`)
probes for a `piper` binary on `PATH`, and `pip install piper-tts` puts it in
`.venv/bin`. Without the venv active the registry reports those two tools as
unavailable.

## Verified

| Check | Result |
|-------|--------|
| `make test` | 1828 passed, 12 skipped, 3 xfailed |
| `make preflight` | 9 composition/analysis providers configured |
| tool registry | 40 of 121 tools available with zero API keys (venv active) |
| `make hyperframes-doctor` | runtime available — Node 22, FFmpeg 6.1.1, hyperframes 0.8.37 |
| `python render_demo.py world-in-numbers` | 1920x1080 h264/aac, 23s, 4.4 MB |
| `python render_demo.py code-to-screen` | 3.7 MB render |
| `python -m backlot serve` | board serves on `/`, `/api/projects` lists the demo project |

Renders land in `projects/demos/renders/` (gitignored, like all of `projects/`).

## Environment-specific changes

**1. `remotion-composer/remotion.config.ts` (new file).** Remotion downloads its
own Chrome Headless Shell from `remotion.media` on first render, which is not
reachable from this container. The config points Remotion at a Chrome that is
already on disk: `REMOTION_BROWSER_EXECUTABLE` if set, otherwise the Chrome
Headless Shell that `npx hyperframes browser ensure` installs under
`~/.cache/hyperframes/chrome/`. If neither exists, Remotion falls back to its
normal download, so the file is a no-op on a machine with unrestricted network.

**2. Proxy CA in the browser trust store.** This container's egress proxy
re-terminates TLS, and Chrome would not load Google Fonts inside a render
(`ERR_CERT_AUTHORITY_INVALID`). Fixed by importing the proxy CAs into the NSS
store Chrome reads:

```bash
sudo apt install libnss3-tools
certutil -d sql:$HOME/.pki/nssdb -N --empty-password
for f in /usr/local/share/ca-certificates/*.crt; do
  certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "$(basename "$f" .crt)" -i "$f"
done
```

This is only needed behind a TLS-intercepting proxy. It is container state, not
repository state — a rebuilt container needs it again.

## Known gaps in this container

- **Piper voice models.** `piper_tts` is installed and discovered, but its first
  run downloads a voice (`en_US-lessac-medium`) from `huggingface.co`, which this
  session's egress policy blocks (403 at the proxy). Narration therefore cannot
  run here until that host is allowed; on an unrestricted machine
  `python -m piper.download_voices en_US-lessac-medium` fetches it once.
- **No API keys.** `.env` was created from `.env.example` with every key blank,
  so the 80 cloud-provider tools (fal.ai, Kling, ElevenLabs, Google, OpenAI, …)
  report as unavailable. Add keys to `.env` to light them up — see the provider
  table in `README.md` and `docs/PROVIDERS.md`.
- **No GPU**, so `make install-gpu` and the local video-generation models were
  not installed.
- **Optional HyperFrames extras** not installed: whisper-cpp (transcription),
  Kokoro (local TTS), MusicGen (local music), and Docker is present but not
  running.

## Where to start

`AGENT_GUIDE.md` is the contract an AI assistant reads first; `PROJECT_CONTEXT.md`
covers architecture, `pipeline_defs/` the pipelines, and `skills/INDEX.md` the
skill map.
