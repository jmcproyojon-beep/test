# 39 · তুই নেই — lyric-story music video (9:16, 3:19)

A vertical stickman story that follows the lyrics of the user's song «তুই নেই», in the look of the client's four
reference clips: white paper, pencil-sketched rooms and streets, stick figures with big round heads, white eyes and
eyebrows that act, bold words at the top, and one red heart (red is kept for her).

**Lyrics.** No lyric sheet was supplied, so the vocal was isolated with demucs and transcribed with whisper; the lines
in `score.js` (`LYRICS`) are the ones heard clearly. Uncertain lines are left off the screen. Send the exact lyrics and
the captions can be corrected in one place.

**Story by line.** Night room, phone, a photo of the two of them (intro, title) · «যদি থাকতি পাশে» her outline sits
beside him · «আকাশে উঠতো এক ফালি চাঁদ» the moon rises in the window · he searches the room · «ঘুরে ফিরি সারাদিন /
সারাক্ষণ গুনগুন করে» the night street, humming · «খুন হয়ে যাই আমি নিজের আদালতে» he is both judge and accused ·
«জানতে চাসনি কোনোদিন» she walks off while he holds out the red heart · «তাই আজ বেদুইন হয়ে যাই» a wanderer in the
dunes · «নীল লাল বাতি জ্বলা সিগন্যালে» the signal blinks red/blue on the beat · the crowd rushes past · rain on the
bench · the long road · «এক মৃত চাঁদের আলো» · «তারাগুলো লাগতো ভালো» the two of them under the stars · the sunny
day · «আজ আর নেই কোনো টান / বসে লেখা গান» a sheet of paper added to the pile on every beat · «ফুল দিয়ে যাবে কে
তোমাকে» the flower on the empty chair · «তবু এলোমেলো স্মৃতিগুলো» photos swirl · «আমি আজ কেন নিরুপায়» · the guitar
break on the rooftop, a memory bubble every two bars · chorus again · «তুই নেই» ×3: the empty bed, the cracked
photo, the window · red end card.

## Rebuild
```sh
ln -s ../38-tui-nei-stickman/song.wav song.wav   # the user's master (not in git)
node song.js && CRF=19 node engine/render.js video && node engine/render.js mux
```
