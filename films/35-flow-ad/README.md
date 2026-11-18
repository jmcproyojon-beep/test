# Flow Communications — «ব্র্যান্ডে জ্যাম? Flow করান।» (60 s vertical ad)
Motion-graphics ad in the client's sample grammar (black stage, glowing stacked cards, glossy chibi characters, dashboards,
glowing logo end card), in the Flow logo palette (crimson + gold). mg-styles-15 harness (`window.renderAt`), 1080×1920, 30 fps.
- `clean_vo.py <generated.wav>` → `assets/vo.wav`: cuts the speaker labels the TTS read aloud (ক্যানভাসার, Flow টিম, ন্যারেটর,
  বিরতি → a real pause, রহিম ভাই, ভাগ্নে ফিসফিস). `work_asr.json`: word timings (faster-whisper) used to place every hit.
- `audio.py`: VO + explainer bed (drop on the logo) + SFX, ducked, −14 LUFS. Render: link as `mg-styles-15/demos/35-flow-ad`,
  `MG_CPU=1 scripts/mg-render.sh demos/35-flow-ad --workers 4`.
- The client's voice-over (`assets/vo.wav`) is not committed.
