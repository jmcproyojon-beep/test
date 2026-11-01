import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Display faces for the Y2K look, loaded from local files (SIL OFL, staged by
// client-builds/signal-nai/prep_assets.py). Bengali and Latin subsets share
// one family through unicode-range, so a mixed line like "Signal নাই" sets
// in one face. Chrome's HarfBuzz shapes the Bengali conjuncts.
const BN = "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1";
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

export const DISPLAY = "SigDisplay";   // Anek Bangla — heavy, condensed-ish headline face
export const PLAY = "SigPlay";         // Baloo Da 2 — round, for chat bubbles and calls
export const PIXEL = "SigPixel, SigDisplay";   // Press Start 2P (Latin) for the 8-bit drop
export const POSTER = "SigPoster, SigDisplay"; // Anton (Latin) for SIGNAL in caps
export const MONO = "SigMono, SigDisplay";     // Space Mono for UI chrome

const f = (family: string, file: string, weight: string, unicodeRange?: string) =>
  loadFont({ family, url: staticFile(`signal/${file}.woff2`), weight, unicodeRange });

export const fontsReady = Promise.all([
  f("SigDisplay", "anek-bangla-bengali-800-normal", "800", BN),
  f("SigDisplay", "anek-bangla-latin-800-normal", "800", LAT),
  f("SigDisplay", "anek-bangla-bengali-600-normal", "600", BN),
  f("SigDisplay", "anek-bangla-latin-600-normal", "600", LAT),
  f("SigPlay", "baloo-da-2-bengali-700-normal", "700", BN),
  f("SigPlay", "baloo-da-2-latin-700-normal", "700", LAT),
  f("SigPixel", "press-start-2p-latin-400-normal", "400"),
  f("SigPoster", "anton-latin-400-normal", "400"),
  f("SigMono", "space-mono-latin-400-normal", "400"),
  f("SigMono", "space-mono-latin-700-normal", "700"),
]);
