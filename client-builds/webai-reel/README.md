# "কোডিং ছাড়াই ওয়েবসাইট" reel: avatar edit in the reference style

This is a 41 s, 9:16 edit built from the client's 5 lip-synced avatar clips (Rubel Miah). It follows the style of the uploaded reference reel:
- A dark, moody grade with a lime-green glow.
- A lime 1-2-3-4 step tracker and big step numbers beside the presenter.
- Jump-cut zooms.
- Cutaways to a phone mock-up that acts out each step.
- Bold Bangla captions that highlight the spoken word.
- A follow call to action at the end.

    bash prep.sh <uploads folder>            # trim/upscale/grade clips -> remotion-composer/public/webai
    python3.13 -I mix.py                     # voice + beat + UI sounds -> audio/mix.wav
    cd ../../remotion-composer && npx remotion render src/index.tsx WebAIReel ../client-builds/webai-reel/video-muted.mp4 --muted --codec h264 --crf 16
    ffmpeg -i video-muted.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart webai-reel.mp4

## Clip order (speech only)
1. Intro.
2. Steps 1 and 2.
3. Step 3 and "AI writes the code".
4. Step 4 and publish.
5. "ব্যস" and follow.

The SRT text gives the caption spelling. Word times come from a faster-whisper transcript of each clip.

## Audio
The audio is the avatars' own voice, so the lips stay in sync. The separate Generated_Audio WAV is the same script in a different take. Its timing doesn't match the lip movement, so it isn't used.

## Code
`remotion-composer/src/webai/`:
- `data.ts`: timeline, captions and steps.
- `WebAIReel.tsx`: presenter, overlays and captions.
- `phone.tsx`: the phone screens: open app, typing, Canvas toggle, code, preview, edit, publish.
