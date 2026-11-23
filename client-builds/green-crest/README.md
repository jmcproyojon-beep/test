# The Green Crest: Proyojon Abashon property film (63 s, 16:9)

For the website, YouTube, social and clients. Built only from the client's material: the render, three site photos, five WhatsApp site videos (two are identical), the Proyojon Abashon logo, and the facts given:
- 1850 sft · 4 bed · 4 bath · 3 balcony
- 2 years installment · customization possible
- Bashundhara R/A, Block M
- Call 01323280004

## Sequence
| Time | Section |
|---|---|
| 0:00 | Logo reveal ("আগামীর নিশ্চিত ঠিকানা") |
| 0:04.5 | THE GREEN CREST, tilting up the render, location |
| 0:12.5 | Apartment features with counters (1,850 sft, 4/4/3) |
| 0:24.5 | Location card (Bashundhara R/A, Block M; the street grid is abstract, not a map) |
| 0:31 | SITE UPDATE · NOVEMBER 2026: four stabilised site clips with captions |
| 0:49 | 2-year installment and customization |
| 0:55.5 | Call to action: logo, THE GREEN CREST, 01323280004 |

No voiceover. The music is an original synthesized piano and pad bed at -16 LUFS.

## Build
1. Prepare the clips, photos and logo:
   ```bash
   python3.13 -I prep.py <uploads dir> <images dir>
   ```
   This stabilises the clips with vidstab, applies the grade, upscales to 1920, and writes everything to `remotion-composer/public/gc/`.
2. Make the music:
   ```bash
   python3.13 -I music.py
   ```
3. Render, from `remotion-composer`:
   ```bash
   npx remotion render src/greencrest/index.tsx GreenCrest out.mp4
   ```
