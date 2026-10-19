# narration + ducked music + sfx -> -14 LUFS, TP <= -1.5
P=/home/user/test/projects/pillar01-lesson05; A=$P/assets/audio
ffmpeg -v error -y -i $A/narration.wav -i $P/assets/music/music_bed.wav -i $A/sfx.wav -filter_complex \
"[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=8:release=160,asplit=2[v][sc];[1:a]volume=0.16[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=40:release=450[md];[2:a]volume=0.55[fx];[v][md][fx]amix=inputs=3:normalize=0,alimiter=limit=0.75[o]" \
-map "[o]" -ar 48000 $A/premix.wav
J=$(ffmpeg -hide_banner -i $A/premix.wav -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i $A/premix.wav -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" $A/final_mix.wav
