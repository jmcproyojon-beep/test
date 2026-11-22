import raw from "./lyrics.json";
import { clamp, lerp } from "./lib";

// Lip sync from the aligned lyric words (client-builds/tui-nei/align_lyrics.py -> lyrics.json).
// Each sung word is split into Bangla syllables; each syllable's vowel picks a mouth (open, wide):
//   া open · ি/ী/ই spread · ে/এ half-spread · ু/উ rounded · ো/ও round-open · inherent অ relaxed open.
// Bilabials (প ফ ব ভ ম) close the lips at a syllable's start; a held last syllable gets more time;
// gaps between words relax to a breath. "তুই" = তু (round) then ই (spread).

export type Wd = { w: string; s: number; e: number; line: number };
type Data = { total: number; lines: { i: number; text: string; s: number; e: number; sec: string }[]; words: Wd[] };
export const LY = raw as unknown as Data;

const V: Record<string, [number, number]> = {
  "া": [0.92, 0.15], "আ": [0.92, 0.15],
  "ি": [0.34, 0.95], "ী": [0.34, 0.95], "ই": [0.34, 0.95], "ঈ": [0.34, 0.95],
  "ে": [0.55, 0.62], "এ": [0.55, 0.62], "ৈ": [0.6, 0.5], "ঐ": [0.6, 0.5],
  "ু": [0.32, -0.95], "ূ": [0.32, -0.95], "উ": [0.32, -0.95], "ঊ": [0.32, -0.95],
  "ো": [0.58, -0.7], "ও": [0.58, -0.7], "ৌ": [0.6, -0.6], "ঔ": [0.6, -0.6],
  "ৃ": [0.36, 0.5], "ঋ": [0.36, 0.5], "অ": [0.62, -0.25],
};
const INHERENT: [number, number] = [0.62, -0.25];
const isCons = (c: string) => /[ক-হড়-য়ৎ]/.test(c);
const isIndepVowel = (c: string) => /[অ-ঔ]/.test(c);
const isSign = (c: string) => /[া-ৌৗ]/.test(c);
const BILABIAL = /[পফবভম]/;

type Syl = { onsetClose: boolean; v: [number, number]; codaClose: boolean };
const sylCache = new Map<string, Syl[]>();
export const syllables = (word: string): Syl[] => {
  const hit = sylCache.get(word);
  if (hit) return hit;
  const ch = Array.from(word.replace(/[^ঀ-৿]/g, ""));
  const out: { text: string; vowel?: string }[] = [];
  for (let i = 0; i < ch.length; i++) {
    const c = ch[i];
    if (isIndepVowel(c)) { out.push({ text: c, vowel: c }); continue; }
    if (isCons(c)) {
      const prev = ch[i - 1];
      if (prev === "্" && out.length) out[out.length - 1].text += c;   // conjunct: same syllable
      else out.push({ text: c });
      continue;
    }
    if (isSign(c) && out.length) { out[out.length - 1].vowel = c; continue; }
    if (out.length) out[out.length - 1].text += c;
  }
  // a final consonant with no vowel sign is a coda of the previous syllable ("মন" = mon)
  const res: Syl[] = [];
  out.forEach((s, i) => {
    const last = i === out.length - 1;
    if (last && !s.vowel && i > 0 && !isIndepVowel(s.text[0])) { res[res.length - 1].codaClose = BILABIAL.test(s.text); return; }
    res.push({ onsetClose: BILABIAL.test(s.text[0] ?? ""), v: s.vowel ? V[s.vowel] ?? INHERENT : INHERENT, codaClose: false });
  });
  if (!res.length) res.push({ onsetClose: false, v: INHERENT, codaClose: false });
  sylCache.set(word, res);
  return res;
};

/** mouth target at time t (global seconds) for a sung word */
const at = (t: number): { open: number; wide: number } => {
  const W = LY.words;
  let lo = 0, hi = W.length - 1, k = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (W[m].s <= t) { k = m; lo = m + 1; } else hi = m - 1; }
  if (k < 0) return { open: 0, wide: 0 };
  const w = W[k];
  const end = Math.max(w.e, w.s + 0.12);
  if (t > end) {
    const next = W[k + 1];
    const gap = next ? next.s - end : 9;
    const since = t - end;
    return gap > 0.35 ? { open: 0.12 * Math.exp(-since * 3), wide: 0 } : { open: 0.2, wide: 0 };   // breath vs. legato
  }
  const sy = syllables(w.w);
  const weights = sy.map((_, i) => (i === sy.length - 1 ? 1.6 : 1));
  const tot = weights.reduce((a, b) => a + b, 0);
  let u = (t - w.s) / (end - w.s) * tot, i = 0;
  while (i < sy.length - 1 && u > weights[i]) { u -= weights[i]; i++; }
  const p = clamp(u / weights[i]);
  const s = sy[i];
  let open = s.v[0];
  if (s.onsetClose && p < 0.22) open = lerp(0, open, p / 0.22);
  else if (p < 0.15) open *= lerp(0.55, 1, p / 0.15);
  if (s.codaClose && p > 0.82) open = lerp(open, 0, (p - 0.82) / 0.18);
  return { open, wide: s.v[1] };
};

/** smoothed mouth for frame time t: a few taps average out the steps (about a 70 ms attack) */
export const mouth = (t: number, gain = 1) => {
  let o = 0, wd = 0, n = 0;
  for (const d of [-0.05, -0.025, 0, 0.02]) { const m = at(t + d); o += m.open; wd += m.wide; n++; }
  return { open: clamp((o / n) * gain), wide: clamp(wd / n, -1, 1) };
};

/** is a vocal sounding now (for breathing / idle) */
export const singing = (t: number) => LY.words.some((w) => t >= w.s - 0.05 && t <= w.e + 0.05);
