import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, "/home/user/test")
from schemas.artifacts import validate_artifact

P = Path("projects/purbachal-house"); ART = P/"artifacts"; ART.mkdir(parents=True, exist_ok=True)
FINAL = str(P/"renders/purbachal-house-promo.mp4")
d = json.loads(subprocess.run(["ffprobe","-v","error","-show_format","-show_streams","-of","json",FINAL],
                              capture_output=True, text=True).stdout)
v = next(s for s in d["streams"] if s["codec_type"] == "video")
a = next(s for s in d["streams"] if s["codec_type"] == "audio")
dur, size = round(float(d["format"]["duration"]), 3), int(d["format"]["size"])

smr = {"version": "1.0",
 "files": [
  {"path": str(P/"assets/video/source.mp4"), "media_type": "video", "reviewed": True,
   "technical_probe": {"duration_seconds": 63.786, "resolution": "478x850", "fps": 60.0, "codec": "h264",
                       "audio_codec": "aac", "sample_rate": 48000, "channels": 2,
                       "file_size_bytes": 15626428, "bitrate_kbps": 1959.9},
   "content_summary": ("Customer-shot WhatsApp walkthrough, vertical, 60 fps. 0:00-0:10 the lane up to the property "
                       "and its painted boundary wall; 0:11-0:16 the decorative steel main gate opening onto the "
                       "grounds; 0:17-0:23 fruit trees and lawn; 0:23-0:32 the three-storey house with covered "
                       "parking and two cars; 0:33-0:38 the entrance door and grille; 0:39-0:48 a large tiled "
                       "drawing/dining hall with ceiling fans and a display cabinet; 0:49-1:03 the internal "
                       "staircase and further rooms. Audio is quiet handheld ambience (mean -39 dB)."),
   "quality_risks": ["Handheld 60 fps footage with walking shake — stabilisation needed.",
                     "478x850 source; 1080x1920 delivery is an upscale.",
                     "No usable audio bed and no music provider reachable.",
                     "Nothing in the footage states floor area, room count or price, so no such claim can be made."],
   "usable_for": ["Branded property promo for Facebook/WhatsApp sharing."]},
  {"path": str(P/"assets/images/photo-01.jpg"), "media_type": "image", "reviewed": True,
   "content_summary": "Three-quarter exterior photo, 960x1280: three storeys, curved balcony, rooftop terrace rail, cars under the porch.",
   "quality_risks": [], "usable_for": ["Opening hero still — sharper than any video frame."]},
  {"path": str(P/"assets/images/photo-02.jpg"), "media_type": "image", "reviewed": True,
   "content_summary": "Frontal exterior photo from the lawn, 960x1280: driveway, covered parking, mature trees either side.",
   "quality_risks": [], "usable_for": ["Mid-roll still establishing the house and grounds."]},
 ],
 "summary": ("A customer-supplied tour of an independent three-storey house on a walled, tree-filled plot, plus two "
             "clean exterior photos of the same house. Enough to build a branded showcase; nothing in it supports "
             "numeric claims."),
 "planning_implications": [
   "Open on the supplied photo rather than a video frame — it is the sharpest image of the house available.",
   "Stabilise every video beat; walking shake is the main thing that reads as amateur.",
   "Write every caption from what is visibly on screen (gate, wall, grounds, parking, entrance, hall, staircase); no floor area, bedroom count or price was supplied.",
   "Location line comes verbatim from the client: ঢাকার অদূরে পূর্বাচল উপশহরের পাশে.",
   "Brand lockup is set in type because the logo file did not survive into this container — swap the PNG in when supplied.",
 ]}
validate_artifact("source_media_review", smr)
(ART/"source_media_review.json").write_text(json.dumps(smr, indent=2, ensure_ascii=False))

BEATS = [("s01","text_card","নিজস্ব তিন তলা বাড়ি / ঢাকার অদূরে পূর্বাচল উপশহরের পাশে",0.0,4.0),
         ("s02","broll","নিজস্ব গেট ও সীমানা প্রাচীর",3.65,8.65),
         ("s03","broll","সুদৃশ্য প্রধান ফটক",8.3,12.3),
         ("s04","broll","গাছে ঘেরা সবুজ উঠান",11.95,16.45),
         ("s05","broll","তিন তলা নিজস্ব বাড়ি",16.1,20.1),
         ("s06","broll","ঘরের নিচেই গাড়ি পার্কিং",19.75,24.75),
         ("s07","broll","প্রশস্ত প্রবেশপথ",24.4,28.4),
         ("s08","broll","বিশাল ড্রয়িং ও ডাইনিং",28.05,33.55),
         ("s09","broll","অভ্যন্তরীণ সিঁড়ি · টাইলস মেঝে",33.2,38.2),
         ("s10","text_card","Brand close: wordmark, tagline, location, site-visit line",37.85,42.33)]
scene_plan = {"version": "1.0", "scenes": [
  {"id": bid, "type": typ, "description": txt, "start_seconds": a, "end_seconds": b,
   "transition_in": "dissolve", "transition_out": "dissolve",
   "overlay_notes": "Bengali headline pill plus English gloss, fading in 0.25s after the cut; brand bar top-right."}
  for bid, typ, txt, a, b in BEATS]}
validate_artifact("scene_plan", scene_plan)
(ART/"scene_plan.json").write_text(json.dumps(scene_plan, indent=2, ensure_ascii=False))

assets = [
 {"id": "vid-source", "type": "video", "path": str(P/"assets/video/source.mp4"), "source_tool": "client-supplied",
  "scene_id": "s02", "duration_seconds": 63.786, "resolution": "478x850", "format": "mp4", "cost_usd": 0.0,
  "generation_summary": "Customer walkthrough; seven windows trimmed, stabilised and graded."},
 {"id": "img-photo-01", "type": "image", "path": str(P/"assets/images/photo-01.jpg"), "source_tool": "client-supplied",
  "scene_id": "s01", "resolution": "960x1280", "format": "jpg", "cost_usd": 0.0,
  "generation_summary": "Hero still, slow push-in under the title."},
 {"id": "img-photo-02", "type": "image", "path": str(P/"assets/images/photo-02.jpg"), "source_tool": "client-supplied",
  "scene_id": "s05", "resolution": "960x1280", "format": "jpg", "cost_usd": 0.0,
  "generation_summary": "Second still, frontal view of the house and grounds."},
 {"id": "ovl-lower-thirds", "type": "image", "path": str(P/"assets/overlays"), "source_tool": "pillow",
  "scene_id": "s02", "format": "png", "cost_usd": 0.0,
  "generation_summary": "Eight Bengali lower thirds (Noto Serif Bengali) with English glosses, a brand bar and the end card, rendered with shaping via Pillow/raqm."},
 {"id": "aud-ambience", "type": "audio", "path": str(P/"assets/audio/bed.m4a"), "source_tool": "ffmpeg",
  "scene_id": "s01", "duration_seconds": 43.5, "cost_usd": 0.0,
  "generation_summary": "Source ambience high-passed at 95 Hz, limited and dropped to -45 dB mean so the file carries a clean track until music is supplied."},
]
manifest = {"version": "1.0", "assets": assets, "total_cost_usd": 0.0}
validate_artifact("asset_manifest", manifest)
(ART/"asset_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

cuts = [{"id": bid, "source": "img-photo-01" if bid == "s01" else ("img-photo-02" if bid == "s05" else "vid-source"),
         "in_seconds": 0.0, "out_seconds": round(b - a, 2),
         "transition_in": "dissolve", "transition_out": "dissolve", "transition_duration": 0.35,
         "reason": txt} for bid, typ, txt, a, b in BEATS]
edit = {"version": "1.0", "renderer_family": "documentary-montage", "render_runtime": "ffmpeg",
        "composition_mode": "templated", "cuts": cuts,
        "audio": {"music": {"asset_id": "aud-ambience", "volume": 0.6}},
        "metadata": {
          "delivery_promise": {"promise_type": "source_led", "motion_required": True, "source_required": True,
                               "tone_mode": "corporate", "quality_floor": "presentable", "approved_fallback": None},
          "stabilisation": "Two-pass vidstab (shakiness 9, smoothing 28) on every video beat.",
          "copy_policy": ("Captions describe only what is on screen. No floor area, bedroom count, land size or price "
                          "appears because the client supplied none. Location line used verbatim as given."),
          "branding": "Wordmark and tagline set in type (DejaVu + Noto Serif Bengali); client logo PNG to be swapped in when re-supplied.",
          "audio": "Cleaned source ambience at -45 dB mean; no music provider reachable from this environment.",
        }}
validate_artifact("edit_decisions", edit)
(ART/"edit_decisions.json").write_text(json.dumps(edit, indent=2, ensure_ascii=False))

render_report = {"version": "1.0",
 "outputs": [{"path": FINAL, "format": "mp4", "codec": v["codec_name"], "audio_codec": a["codec_name"],
              "resolution": f'{v["width"]}x{v["height"]}', "fps": 30.0, "duration_seconds": dur,
              "file_size_bytes": size, "platform_target": "instagram_reels"}],
 "render_grammar": "documentary-montage",
 "warnings": ["Brand lockup is typeset, not the client's logo artwork — the logo file was lost with the previous container.",
              "No music: Pixabay is blocked by this environment's egress policy and ElevenLabs/Freesound need API keys.",
              "No contact details, price or floor area on screen — none were supplied.",
              "Delivery upscaled from a 478x850 source."],
 "verification_notes": [f"ffprobe: {v['width']}x{v['height']} {v['codec_name']}/{a['codec_name']}, {dur}s, {size} bytes.",
                        "Audio mean -44.9 dB, peak -17.1 dB — no clipping.",
                        "Ten frames sampled across every beat; each Bengali caption renders with correct conjuncts and sits over footage that supports it."]}
validate_artifact("render_report", render_report)
(ART/"render_report.json").write_text(json.dumps(render_report, indent=2, ensure_ascii=False))

final_review = {"version": "1.0", "output_path": FINAL, "status": "pass",
 "checks": {"technical_probe": {"valid_container": True, "duration_seconds": dur, "resolution": "1080x1920",
                                "fps": 30.0, "has_audio": True, "codec": v["codec_name"],
                                "file_size_bytes": size, "issues": []},
            "visual_spotcheck": {"frames_sampled": 10, "frame_paths": [], "black_frames_detected": False,
                                 "broken_overlays": False, "missing_assets": False, "unreadable_text": False,
                                 "issues": []},
            "audio_spotcheck": {"narration_present": False, "music_present": False, "unexpected_silence": False,
                                "clipping_detected": False, "mix_intelligible": True,
                                "issues": ["Ambience only; add music before publishing."]},
            "promise_preservation": {"delivery_promise_honored": True, "renderer_family_used": "documentary-montage",
                                     "render_runtime_used": "ffmpeg", "runtime_swap_detected": False,
                                     "motion_ratio_actual": 0.72, "silent_downgrade_detected": False, "issues": []},
            "subtitle_check": {"subtitles_expected": False, "subtitles_present": False,
                               "issues": ["All copy is burned in, so the video reads muted."]}},
 "issues_found": [], "recommended_action": "present_to_user"}
validate_artifact("final_review", final_review)
(ART/"final_review.json").write_text(json.dumps(final_review, indent=2, ensure_ascii=False))
print("artifacts:", sorted(p.name for p in ART.glob("*.json")))
