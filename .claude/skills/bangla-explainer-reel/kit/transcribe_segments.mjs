import { pipeline, env } from "@huggingface/transformers";
import fs from "fs";
env.allowRemoteModels = false; env.localModelPath = process.argv[2];
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-small", { dtype: "q8" });
const n = +process.argv[3];
for (let i = 0; i < n; i++) {
  const f = `p${String(i).padStart(2,"0")}.f32`;
  const b = fs.readFileSync(f); let a = new Float32Array(b.buffer, b.byteOffset, b.length/4);
  const pad = new Float32Array(a.length + 16000); pad.set(a, 8000);
  const o = await asr(pad, { language: "bengali", task: "transcribe", max_new_tokens: 40 });
  console.log(i, JSON.stringify(o.text));
}
