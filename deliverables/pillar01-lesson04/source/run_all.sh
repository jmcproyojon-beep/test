#!/bin/bash
P=/home/user/test/projects/pillar01-lesson04
L=$P/assets/lipsync/run.log
echo "== waiting for takes $(date -u +%T)" >> $L
until python3 -c "import json,sys;m=json.load(open('$P/artifacts/tts_manifest.json'));sys.exit(0 if all(k in m and m[k]['ok'] for k in ['s01_c0','s12_c0']) else 1)" 2>/dev/null; do sleep 20; done
mkdir -p $P/assets/audio/proc
cd /home/user/sadtalker/src/SadTalker
for s in s01 s12; do
  ffmpeg -v error -y -i $P/assets/audio/chunks/${s}_c0.wav -af "atempo=0.95,loudnorm=I=-18:TP=-3:LRA=11" -ar 48000 $P/assets/lipsync/${s}_proc.wav
  ffmpeg -v error -y -i $P/assets/lipsync/${s}_proc.wav -ar 16000 -ac 1 $P/assets/lipsync/${s}.wav
  md5sum $P/assets/audio/chunks/${s}_c0.wav >> $L
  echo "== $s start $(date -u +%T)" >> $L
  /home/user/sadtalker/venv/bin/python inference.py --driven_audio $P/assets/lipsync/$s.wav --source_image $P/assets/images/presenter_source.jpg --result_dir $P/assets/lipsync/out_$s --still --preprocess full --size 256 --cpu >> $L 2>&1
  echo "== $s end $(date -u +%T) rc=$?" >> $L
done
echo "== ALL DONE" >> $L
