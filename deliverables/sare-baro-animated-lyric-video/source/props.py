"""Flat vector collage props (inline SVG, 400x400 viewBox): bold fills, black ink outlines, meant to sit on torn-paper cards."""
K = 'stroke="#0A0A0A" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"'


def clock(h=0, m=30, size=400, face="#FFF6E0", rim="#E60023", cls="clk"):
    ticks = "".join(f'<line x1="200" y1="62" x2="200" y2="{88 if k % 3 == 0 else 78}" transform="rotate({k * 30} 200 200)" {K} stroke-width="{10 if k % 3 == 0 else 6}"/>' for k in range(12))
    return (f'<svg class="{cls}" viewBox="0 0 400 400" width="{size}" height="{size}"><circle cx="200" cy="200" r="170" fill="{rim}" {K}/><circle cx="200" cy="200" r="140" fill="{face}" {K}/>{ticks}'
            f'<line class="hh" x1="200" y1="200" x2="200" y2="125" {K} stroke-width="16" transform="rotate({h * 30 + m / 2} 200 200)"/>'
            f'<line class="mh" x1="200" y1="200" x2="200" y2="85" {K} stroke-width="10" transform="rotate({m * 6} 200 200)"/><circle cx="200" cy="200" r="14" fill="#0A0A0A"/></svg>')


P = {
 "sun": f'<svg viewBox="0 0 400 400"><g class="rays">' + "".join(f'<path d="M200 20 L222 80 L178 80Z" fill="#FFD700" {K} transform="rotate({k * 30} 200 200)"/>' for k in range(12)) +
        f'</g><circle cx="200" cy="200" r="105" fill="#FFB800" {K}/><path d="M160 190q10-12 20 0M220 190q10-12 20 0M165 235q35 25 70 0" fill="none" {K}/></svg>',
 "moon": f'<svg viewBox="0 0 400 400"><path d="M250 60a150 150 0 1 0 90 250A130 130 0 0 1 250 60z" fill="#FFF3B0" {K}/><path d="M150 120l90-60 40 70z" fill="#E60023" {K}/><circle cx="285" cy="128" r="16" fill="#fff" {K}/>'
         f'<path d="M140 220q15 10 30 0M190 260q20 12 40 0" fill="none" {K}/><text class="zz" x="300" y="210" font-size="60" font-weight="800" fill="#00E5FF" stroke="#0A0A0A" stroke-width="4" font-family="Inter">Z</text><text class="zz" x="335" y="160" font-size="44" font-weight="800" fill="#00E5FF" stroke="#0A0A0A" stroke-width="4" font-family="Inter">z</text></svg>',
 "eye": f'<svg viewBox="0 0 400 400"><path d="M30 200q170-150 340 0q-170 150-340 0z" fill="#fff" {K}/><circle cx="200" cy="200" r="70" fill="#00B8D4" {K}/><circle cx="200" cy="200" r="32" fill="#0A0A0A"/><circle cx="220" cy="180" r="12" fill="#fff"/>'
        f'<path class="lid" d="M30 200q170-150 340 0q-170 -10 -340 0z" fill="#E60023" {K}/></svg>',
 "qm": f'<svg viewBox="0 0 400 400"><text x="60" y="300" font-size="300" font-weight="800" fill="#FFD700" stroke="#0A0A0A" stroke-width="10" font-family="Inter">?</text><text x="230" y="230" font-size="200" font-weight="800" fill="#00E5FF" stroke="#0A0A0A" stroke-width="8" font-family="Inter" transform="rotate(14 300 160)">?</text></svg>',
 "door": f'<svg viewBox="0 0 400 400"><rect x="90" y="30" width="200" height="340" fill="#7A3E1D" {K}/><rect x="115" y="60" width="150" height="120" fill="#9C5A2E" {K}/><rect x="115" y="200" width="150" height="140" fill="#9C5A2E" {K}/><circle cx="260" cy="215" r="12" fill="#FFD700" {K}/>'
         f'<g class="bell"><rect x="305" y="170" width="70" height="90" rx="14" fill="#eee" {K}/><circle cx="340" cy="215" r="22" fill="#E60023" {K}/></g></svg>',
 "room": f'<svg viewBox="0 0 400 400"><path d="M40 330V110l160-70 160 70v220z" fill="#1E1E2E" {K}/><rect x="80" y="150" width="90" height="80" fill="#00E5FF" {K}/><path d="M125 150v80M80 190h90" {K} stroke-width="5"/><rect x="230" y="210" width="90" height="120" fill="#333" {K}/><text x="140" y="300" font-size="90" font-weight="800" fill="#FFD700" font-family="Inter" stroke="#0A0A0A" stroke-width="5">0</text></svg>',
 "spiral": '<svg viewBox="0 0 400 400"><g class="spin">' + "".join(f'<circle cx="200" cy="200" r="{r}" fill="none" stroke="{c}" stroke-width="16" stroke-dasharray="{r * 2.2:.0f} {r * 1.0:.0f}"/>' for r, c in [(150, "#FF2E93"), (110, "#00E5FF"), (70, "#FFD700"), (30, "#FF2E93")]) + '</g></svg>',
 "fridge": f'<svg viewBox="0 0 400 400"><rect x="100" y="20" width="200" height="360" rx="20" fill="#E8F7FF" {K}/><path d="M100 140h200" {K}/><rect x="270" y="60" width="12" height="50" fill="#0A0A0A"/><rect x="270" y="170" width="12" height="70" fill="#0A0A0A"/>'
           f'<g class="ice" transform="translate(150 190)"><path d="M30 120 L0 40 L60 40Z" fill="#F4A460" {K}/><circle cx="30" cy="30" r="34" fill="#FF7EB6" {K}/><circle cx="18" cy="14" r="6" fill="#fff"/></g></svg>',
 "bellb": f'<svg viewBox="0 0 400 400"><g class="swing"><path d="M200 40c-70 0-100 60-100 130v80l-40 50h280l-40-50v-80c0-70-30-130-100-130z" fill="#FFD700" {K}/><circle cx="200" cy="330" r="28" fill="#E60023" {K}/></g>'
          f'<path d="M60 120q-30 40 0 80M340 120q30 40 0 80M30 100q-45 60 0 120M370 100q45 60 0 120" fill="none" stroke="#00E5FF" stroke-width="10" stroke-linecap="round"/></svg>',
 "fly": f'<svg viewBox="0 0 400 400"><path class="trail" d="M30 300 C120 80 240 380 370 90" fill="none" stroke="#FFD700" stroke-width="6" stroke-dasharray="14 14"/><g class="bug" transform="translate(300 120)"><ellipse cx="0" cy="0" rx="34" ry="24" fill="#222" {K}/>'
        f'<ellipse class="wing" cx="-12" cy="-28" rx="22" ry="30" fill="#BDF4FF" {K} opacity=".85"/><ellipse class="wing" cx="16" cy="-28" rx="22" ry="30" fill="#BDF4FF" {K} opacity=".85"/><circle cx="26" cy="-4" r="9" fill="#E60023"/></g></svg>',
 "guard": f'<svg viewBox="0 0 400 400"><circle cx="200" cy="140" r="70" fill="#C68642" {K}/><path d="M120 110h160l-20-50H140z" fill="#1F3A93" {K}/><rect x="120" y="100" width="160" height="22" fill="#0A0A0A"/><path d="M175 150q25 18 50 0" fill="none" {K}/><path d="M165 178q35 14 70 0" fill="none" {K} stroke-width="10"/>'
          f'<path d="M80 380c0-90 50-150 120-150s120 60 120 150z" fill="#F2E6CF" {K}/></svg>',
 "tap": f'<svg viewBox="0 0 400 400"><rect x="30" y="80" width="200" height="50" fill="#9AA5B1" {K}/><rect x="190" y="60" width="60" height="140" rx="12" fill="#B8C2CC" {K}/><rect x="150" y="40" width="140" height="30" rx="10" fill="#E60023" {K}/>'
        + "".join(f'<path class="drop" d="M220 {230 + k * 50}c-14 18-14 30 0 30s14-12 0-30z" fill="#00E5FF" {K} stroke-width="5"/>' for k in range(3)) + '</svg>',
 "shirt": f'<svg viewBox="0 0 400 400"><g class="fl1"><path d="M60 60l50-20q40 30 80 0l50 20 40 70-50 25-10-25v140H90V130l-10 25-50-25z" fill="#00E5FF" {K} transform="rotate(-12 150 150)"/></g>'
          f'<g class="fl2"><path d="M220 280h110q30 0 40 30v30H220z" fill="#E60023" {K} transform="rotate(16 290 310)"/><path d="M220 270v40" {K}/></g></svg>',
 "pillow": f'<svg viewBox="0 0 400 400"><g class="peek"><rect x="90" y="150" width="220" height="140" rx="10" fill="#333" {K}/><rect x="105" y="165" width="190" height="110" fill="#00E5FF" {K}/></g>'
           f'<path d="M30 230q170-90 340 0q-20 70 0 120q-170 50-340 0q20-60 0-120z" fill="#FFE8F0" {K}/><path d="M80 300q50-20 100 0M200 290q60-20 110 5" fill="none" stroke="#FF7EB6" stroke-width="8"/></svg>',
 "mag": f'<svg viewBox="0 0 400 400"><circle cx="170" cy="170" r="110" fill="rgba(0,229,255,.25)" {K} stroke-width="14"/><path d="M250 250l110 110" {K} stroke-width="34"/><path d="M110 140q30-40 70-40" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/></svg>',
 "mess": f'<svg viewBox="0 0 400 400">' + "".join(f'<rect class="m{k}" x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" {K} transform="rotate({r} {x + w / 2} {y + h / 2})"/>' for k, (x, y, w, h, c, r) in enumerate(
           [(40, 60, 110, 80, "#FFD700", -18), (220, 40, 120, 90, "#00E5FF", 22), (60, 230, 130, 70, "#E60023", 12), (230, 220, 110, 120, "#FF7EB6", -26), (150, 140, 90, 70, "#fff", 40)])) + '</svg>',
 "office": f'<svg viewBox="0 0 400 400"><rect x="100" y="30" width="200" height="350" fill="#1F2A44" {K}/>' + "".join(f'<rect x="{125 + c * 55}" y="{55 + r * 50}" width="35" height="30" fill="{"#FFD700" if (r + c) % 3 else "#00E5FF"}" stroke="#0A0A0A" stroke-width="4"/>' for r in range(6) for c in range(3)) + '</svg>',
 "mouse": f'<svg viewBox="0 0 400 400"><path d="M20 330h360" stroke="#FFD700" stroke-width="10" stroke-dasharray="40 24"/><g class="run"><ellipse cx="200" cy="260" rx="90" ry="55" fill="#9E9E9E" {K}/><circle cx="285" cy="220" r="34" fill="#BDBDBD" {K}/><circle cx="275" cy="190" r="22" fill="#FFB6C1" {K}/>'
          f'<circle cx="300" cy="215" r="6" fill="#0A0A0A"/><path d="M110 260q-60 -10 -80 40" fill="none" {K}/><path d="M160 305l-15 25M240 305l15 25" {K}/></g></svg>',
 "flame": f'<svg viewBox="0 0 400 400"><path d="M110 380v-120q0-30 30-30h120q30 0 30 30v120z" fill="#C68642" {K}/><g class="fire"><path d="M200 230c-80-40-60-130 0-200c10 60 80 80 60 160c30-20 30-60 20-80c50 60 30 120-80 120z" fill="#FF5A00" {K}/>'
          f'<path d="M200 220c-40-30-30-80 0-110c10 40 40 50 30 90z" fill="#FFD700"/></g></svg>',
 "hurt": f'<svg viewBox="0 0 400 400"><path d="M110 380v-120q0-30 30-30h120q30 0 30 30v120z" fill="#C68642" {K}/><path d="M140 230v-120M180 230v-150M220 230v-150M260 230v-110" {K} stroke-width="26"/><path class="bolt" d="M300 60l-50 90h40l-40 90" fill="none" stroke="#FFD700" stroke-width="14" stroke-linejoin="round"/></svg>',
 "watch": f'<svg viewBox="0 0 400 400"><rect x="150" y="0" width="100" height="400" fill="#333" {K}/>' + clock(12, 30, 300).replace('<svg class="clk" viewBox="0 0 400 400" width="300" height="300">', '<g transform="translate(50 50) scale(.75)">').replace("</svg>", "</g>") + '</svg>',
 "glitch": f'<svg viewBox="0 0 400 400"><text x="40" y="270" font-size="240" font-weight="800" fill="#E60023" font-family="Inter" stroke="#0A0A0A" stroke-width="8">!?</text></svg>',
 "sleepy": f'<svg viewBox="0 0 400 400"><path d="M30 200q170-150 340 0q-170 150-340 0z" fill="#fff" {K}/><circle cx="200" cy="215" r="60" fill="#00B8D4" {K}/><path d="M30 200q170-150 340 0q-170 20-340 0z" fill="#7B61FF" {K}/>'
           f'<text class="zz" x="300" y="110" font-size="70" font-weight="800" fill="#FFD700" stroke="#0A0A0A" stroke-width="4" font-family="Inter">Z</text></svg>',
}
