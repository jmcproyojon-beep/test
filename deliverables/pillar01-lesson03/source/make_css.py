s=open("../l2/style_l2.css").read()
maps=[
(":root { --navy:#060b1f; --navy2:#0b1436; --cyan:#22e3ff; --purple:#8b5cf6; --pink:#d946ef; --amber:#fbbf24; --green:#34d399; --red:#fb7185;",
 ":root { --navy:#0e0b09; --navy2:#1a1410; --cyan:#ffa24c; --purple:#2dd4bf; --pink:#f472b6; --amber:#fde047; --green:#4ade80; --red:#f87171;"),
("--ink:#eaf4ff; --mute:#9fb3d9; --glass:rgba(20,32,74,.6); --stroke:rgba(120,200,255,.26);",
 "--ink:#fff4e8; --mute:#c8b6a2; --glass:rgba(44,33,26,.66); --stroke:rgba(255,190,130,.24);"),
("rgba(34,227,255","rgba(255,162,76"),("rgba(139,92,246","rgba(45,212,191"),("rgba(217,70,239","rgba(244,114,182"),
("rgba(251,191,36","rgba(253,224,71"),("rgba(52,211,153","rgba(74,222,128"),("rgba(251,113,133","rgba(248,113,113"),
("#13205a","#3a2617"),("#0ea5e9","#14b8a6"),("#c4b5fd","#5eead4"),("#f0abfc","#f9a8d4"),("#0d1a44","#241a12"),
("#0d1530","#1c1510"),("#141e3f","#2a1f17"),("rgba(120,200,255","rgba(255,190,130"),("rgba(4,8,24","rgba(14,10,7"),("rgba(6,11,31","rgba(14,11,9"),
("rgba(159,179,217","rgba(200,182,162"),("#93c5fd","#fdba74"),("rgba(234,244,255","rgba(255,244,232"),("rgba(147,197,253","rgba(253,186,116"),
]
for a,b in maps:
    if a not in s:
        print('skip',a); continue
    s=s.replace(a,b)
s+='''
/* ===== Lesson 03 warm-studio additions ===== */
.grid { opacity: .10; }
.o1 { background: #f97316; } .o3 { background: #2dd4bf; opacity: .18; }
.photo img { object-position: 50% 30%; }
.photo video { width: 100%; height: 100%; object-fit: cover; display: block; }
.lipbadge { position: absolute; right: 18px; top: 18px; padding: 6px 12px; border-radius: 10px; background: rgba(14,11,9,.75); border: 1px solid rgba(255,162,76,.6); font: 700 18px/1 var(--bn); color: var(--cyan); }
/* s02 families */
.fam { position: absolute; left: 80px; top: 236px; width: 1760px; height: 520px; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; gap: 22px; }
.fam .tile { flex-direction: row; align-items: center; gap: 22px; padding: 24px 30px; }
.fam .tt { font-size: 38px; } .fam .ts { font-size: 23px; margin-top: 6px; }
.ribbon { position: absolute; left: 80px; top: 780px; width: 1760px; height: 86px; display: flex; align-items: center; gap: 18px; padding: 0 28px; border-radius: 20px; background: rgba(253,224,71,.10); border: 2px solid rgba(253,224,71,.6); font: 700 27px/1.25 var(--bn); }
#s02fl { left: 80px; top: 676px; width: 1760px; height: 80px; display: flex; align-items: center; justify-content: center; gap: 16px; border-radius: 18px; background: rgba(45,212,191,.10); border: 2px solid rgba(45,212,191,.5); font: 600 25px/1.2 var(--bn); }
/* two-card scenes */
.half { position: absolute; top: 236px; width: 860px; height: 530px; }
.half.l { left: 80px; } .half.r { left: 980px; }
.half .h { font-size: 38px; display: flex; align-items: center; gap: 16px; }
.uses { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
.uses .chip { font-size: 24px; padding: 10px 16px; }
.names { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.names span { font: 800 24px/1 var(--en); padding: 10px 14px; border-radius: 12px; background: rgba(45,212,191,.12); border: 2px solid rgba(45,212,191,.55); color: #5eead4; }
.rsrow { display: flex; align-items: center; gap: 16px; margin-top: 14px; padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.12); }
.rsrow b { font: 800 26px/1 var(--en); color: #5eead4; min-width: 200px; }
.rsrow span { font: 600 23px/1.3 var(--bn); }
.foot { position: absolute; left: 80px; top: 786px; width: 1760px; height: 80px; display: flex; align-items: center; gap: 16px; padding: 0 28px; border-radius: 18px; font: 700 27px/1.25 var(--bn); }
.foot.am { background: rgba(253,224,71,.10); border: 2px solid rgba(253,224,71,.6); color: var(--ink); }
.foot.rd { background: rgba(248,113,113,.12); border: 2px solid rgba(248,113,113,.65); color: var(--ink); }
.foot.gr { background: rgba(74,222,128,.10); border: 2px solid rgba(74,222,128,.55); color: var(--ink); }
.pbar { margin-top: 16px; height: 54px; border-radius: 27px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,190,130,.35); display: flex; align-items: center; padding: 0 22px; font: 600 23px/1 var(--bn); }
.pbar .w { opacity: 0; }
.thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
.thumbs i { display: block; height: 120px; border-radius: 14px; }
.film { margin-top: 16px; height: 130px; border-radius: 14px; overflow: hidden; position: relative; background: #000; border: 2px solid rgba(255,255,255,.15); }
.film .strip { position: absolute; left: 0; top: 14px; width: 2200px; height: 102px; display: flex; gap: 10px; }
.film .strip i { display: block; width: 170px; height: 102px; border-radius: 8px; }
.film .play { position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; background: rgba(255,162,76,.92); clip-path: none; }
.film .play::after { content: ""; position: absolute; left: 25px; top: 18px; border-left: 22px solid #0e0b09; border-top: 14px solid transparent; border-bottom: 14px solid transparent; }
.illus2 { position: absolute; right: 30px; top: 26px; font: 700 18px/1 var(--bn); color: var(--amber); border: 1px solid rgba(253,224,71,.7); background: rgba(253,224,71,.12); padding: 6px 10px; border-radius: 10px; }
.wave { display: flex; align-items: center; gap: 5px; height: 90px; margin-top: 14px; }
.wave i { display: block; width: 10px; border-radius: 5px; background: linear-gradient(180deg, var(--cyan), var(--purple)); }
.arow { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.arow .chip { font-size: 22px; padding: 8px 12px; }
.code { margin-top: 16px; border-radius: 16px; background: #120d0a; border: 1px solid rgba(255,255,255,.14); padding: 16px 20px; font: 600 23px/1.6 "Inter", monospace; color: #e7d9c8; }
.code .k { color: #5eead4; } .code .s { color: #fdba74; } .code .ghost { color: rgba(255,244,232,.38); }
.code .tabk { display: inline-block; margin-left: 10px; padding: 2px 10px; border-radius: 6px; border: 1px solid rgba(255,162,76,.7); color: var(--cyan); font-size: 18px; }
/* assistant profile */
.prof { position: absolute; left: 80px; top: 236px; width: 760px; height: 630px; }
.glyph { width: 120px; height: 120px; border-radius: 30px; display: flex; align-items: center; justify-content: center; font: 800 54px/1 var(--en); color: #0e0b09; }
.pname { font: 800 60px/1 var(--en); margin-top: 22px; }
.pmeta { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
.pmeta div { font: 600 26px/1.3 var(--bn); display: flex; gap: 12px; align-items: center; }
.pmeta b { color: var(--mute); font-weight: 600; min-width: 130px; }
.ptag { font: 700 22px/1 var(--bn); padding: 10px 14px; border-radius: 12px; display: inline-block; margin-top: 22px; }
.caps { position: absolute; left: 880px; top: 236px; width: 960px; height: 300px; }
.caps .uses .chip { font-size: 25px; }
.usec { position: absolute; left: 880px; top: 556px; width: 960px; height: 310px; }
.usec .p { font-size: 26px; }
.lim { margin-top: 14px; font: 600 22px/1.3 var(--bn); color: var(--amber); }
.orbit { position: absolute; left: 520px; top: 40px; width: 210px; height: 210px; }
.orbit span { position: absolute; padding: 6px 10px; border-radius: 10px; font: 700 18px/1 var(--en); background: rgba(45,212,191,.15); border: 1px solid rgba(45,212,191,.6); color: #5eead4; }
.pdfs { position: absolute; right: 40px; top: 60px; width: 200px; height: 200px; }
.pdfs i { position: absolute; width: 110px; height: 140px; border-radius: 10px; background: #f5ebe0; border: 2px solid #c8b6a2; display: block; }
.pdfs b { position: absolute; left: 70px; top: 110px; width: 130px; padding: 10px; border-radius: 12px; background: rgba(74,222,128,.18); border: 2px solid rgba(74,222,128,.7); font: 700 18px/1.2 var(--bn); color: var(--green); }
/* pricing */
.pcol { position: absolute; top: 236px; width: 860px; height: 330px; }
.pcol.l { left: 80px; } .pcol.r { left: 980px; border-color: rgba(255,162,76,.65); }
.prow { display: flex; align-items: center; gap: 14px; font: 600 27px/1.3 var(--bn); margin-top: 16px; }
.pstrip { position: absolute; left: 80px; top: 586px; width: 1760px; height: 180px; padding: 22px 30px; border-radius: 22px; background: rgba(255,255,255,.04); border: 2px dashed rgba(255,190,130,.45); }
.pstrip .row { display: flex; gap: 18px; margin-top: 14px; }
.price { flex: 1; padding: 14px 18px; border-radius: 16px; background: var(--glass); border: 2px solid var(--stroke); }
.price b { font: 800 26px/1 var(--en); display: block; } .price span { font: 800 34px/1.2 var(--en); color: var(--cyan); }
.pnote { font: 600 21px/1.3 var(--bn); color: var(--mute); }
/* choose */
.q4g { position: absolute; left: 80px; top: 236px; width: 1760px; height: 420px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; }
.q4 { border-radius: 24px; background: var(--glass); border: 2px solid var(--stroke); padding: 22px 28px; display: flex; gap: 22px; align-items: center; }
.q4 .qn { font: 800 54px/1 var(--en); color: var(--cyan); min-width: 60px; }
.q4 .qt { font: 700 32px/1.2 var(--bn); } .q4 .qs { font: 500 22px/1.35 var(--bn); color: var(--mute); margin-top: 6px; }
.exflow { position: absolute; left: 80px; top: 680px; width: 1760px; height: 186px; padding: 20px 28px; border-radius: 22px; background: rgba(45,212,191,.08); border: 2px solid rgba(45,212,191,.5); }
.exflow .pills { display: flex; align-items: center; gap: 14px; margin-top: 16px; flex-wrap: wrap; }
.exflow .pills .pill { font-size: 26px; }
/* compare */
.pcard { position: absolute; left: 80px; top: 236px; width: 1760px; height: 140px; padding: 18px 28px; }
.pcard .pt { font: 600 26px/1.4 var(--bn); margin-top: 10px; } .pcard .pt .w { opacity: 0; }
.cpan { position: absolute; top: 396px; width: 570px; height: 250px; border-radius: 20px; background: #1c1510; border: 2px solid rgba(255,255,255,.14); overflow: hidden; }
.cpan .bar { height: 46px; } .cpan .addr { width: 200px; height: 30px; font: 800 18px/1 var(--en); }
.cpan .illus { font-size: 14px; padding: 5px 8px; }
.cpan .body { padding: 16px 20px; }
.cpan .ln { display: block; height: 13px; border-radius: 7px; background: rgba(255,244,232,.26); margin-top: 13px; transform-origin: 0 50%; }
.score { position: absolute; left: 80px; top: 666px; width: 1760px; height: 200px; padding: 14px 24px; border-radius: 22px; background: var(--glass); border: 2px solid var(--stroke); }
.sg { display: grid; grid-template-columns: 300px repeat(4, 1fr); gap: 8px 14px; align-items: center; }
.sg .hd { font: 700 21px/1.2 var(--bn); color: var(--cyan); text-align: center; }
.sg .tn { font: 800 22px/1 var(--en); }
.dots5 { display: flex; gap: 8px; justify-content: center; }
.dots5 i { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,190,130,.5); display: block; }
.dots5 i.f { background: var(--cyan); border-color: var(--cyan); }
.sub2 { position: absolute; right: 26px; top: 12px; font: 700 18px/1 var(--bn); color: var(--amber); }
#s12key { left: 570px; top: 776px; width: 1270px; height: 90px; border-radius: 22px; display: flex; align-items: center; gap: 18px; padding: 0 26px; background: linear-gradient(90deg, rgba(255,162,76,.16), rgba(45,212,191,.16)); border: 2px solid rgba(255,162,76,.55); font: 700 27px/1.2 var(--bn); }
#s12next { left: 1370px; top: 236px; width: 470px; height: 520px; border-color: rgba(45,212,191,.6); }
'''
open("style_l3.css","w").write(s)
print("css", len(s))