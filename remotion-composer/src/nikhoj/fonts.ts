import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Bengali is shaped by Chrome's HarfBuzz, so conjuncts and pre-base vowel
// signs come out right — unlike ffmpeg drawtext/libass in this environment.
// The fonts are loaded from local files so the render never depends on a
// font happening to be installed on the machine.
export const SERIF = "NikhojSerif";
export const SANS = "NikhojSans";

export const fontsReady = Promise.all([
  loadFont({ family: SERIF, url: staticFile("nikhoj/NotoSerifBengali-Regular.ttf"), weight: "400" }),
  loadFont({ family: SERIF, url: staticFile("nikhoj/NotoSerifBengali-Bold.ttf"), weight: "700" }),
  loadFont({ family: SANS, url: staticFile("nikhoj/NotoSansBengali-Regular.ttf"), weight: "400" }),
  loadFont({ family: SANS, url: staticFile("nikhoj/NotoSansBengali-Bold.ttf"), weight: "700" }),
]);
