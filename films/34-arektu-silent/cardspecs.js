// Intertitles: Bangla on top (Noto Serif Bengali), English below in the period italic. level 1 narration, 2 tender.
const BN = 'Noto Serif Bengali';
const card = (level, bn, en, o = {}) => ({ level, lines: [{ text: bn, font: BN, weight: 700, size: o.bn ?? 92 }, { text: en, italic: true, size: o.en ?? 46 }], gap: 1.42 });
export const CARDS = {
  TITLE: { level: 1, lines: [{ text: 'আরেকটু থাকো', font: BN, weight: 700, size: 124 }, { text: 'Stay a Little Longer', font: 'Playfair Display SC', weight: 900, size: 64 }, { text: 'a photoplay in one reel', italic: true, size: 36, spacing: 2 }], gap: 1.4 },
  CARD1: card(1, 'শেষ রাতের শো', 'The last show of the season.'),
  CARD2: card(1, 'কাল সকালের ট্রেন', 'The morning train.'),
  CARD3: card(2, 'আরেকটু থাকো', 'Stay a little longer.', { bn: 104 }),
  CARD4: card(2, 'তোমার পথ তোমারই', 'Your road is yours.'),
  CARD5: card(2, 'আবার দেখা হবে', 'Until the next show.', { bn: 100 }),
  CREDITS: { level: 2, dy: -6, lines: [
    { text: 'আরেকটু থাকো', font: BN, weight: 700, size: 84 },
    { text: 'Stay a Little Longer', italic: true, size: 38 },
    { text: 'কণ্ঠ ও কথা — Rapar Rubel (Rubel Miah)', font: BN, weight: 400, size: 40 },
    { text: 'সম্পাদনা — Paloan', font: BN, weight: 400, size: 40 },
    { text: 'Fonts: Playfair Display, Old Standard TT, Noto Serif Bengali (OFL)', italic: true, size: 22 },
  ], gap: 1.55 },
};
