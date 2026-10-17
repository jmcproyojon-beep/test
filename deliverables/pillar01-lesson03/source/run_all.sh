#!/bin/bash
L=/home/user/test/projects/pillar01-lesson03/assets/lipsync/run.log
cd /home/user/sadtalker/src/SadTalker
for s in s01 s12; do
  echo "== $s start $(date -u +%T)" >> $L
  /home/user/sadtalker/venv/bin/python inference.py --driven_audio /home/user/test/projects/pillar01-lesson03/assets/lipsync/$s.wav --source_image /home/user/test/projects/pillar01-lesson03/assets/images/presenter_source.jpg --result_dir /home/user/test/projects/pillar01-lesson03/assets/lipsync/out_$s --still --preprocess full --size 256 --cpu >> $L 2>&1
  echo "== $s end $(date -u +%T) rc=$?" >> $L
done
echo "== ALL DONE" >> $L
