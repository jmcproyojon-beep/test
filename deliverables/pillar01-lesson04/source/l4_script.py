"""PILLAR 01 · Lesson 04 — Writing, Content & Communication (AI দিয়ে লেখা, content ও communication)."""

FORMULA = ["কাজ", "পাঠক", "উদ্দেশ্য", "টোন", "দৈর্ঘ্য", "ফরম্যাট"]
WEAK = "একটা ইমেইল লিখে দাও।"
STRONG = ("একজন বিদেশি ক্লায়েন্টকে ইমেইল লেখো। আমি ঢাকার একজন ফ্রিল্যান্স গ্রাফিক ডিজাইনার। "
          "লোগোর প্রথম খসড়া আজ পাঠাচ্ছি, আর শুক্রবারের মধ্যে তাঁর মতামত চাই। "
          "ভদ্র ও আত্মবিশ্বাসী টোনে, ইংরেজিতে, ১০০ শব্দের মধ্যে — বিষয় লাইনসহ।")

SCENES = [
 dict(id="s01", num="০১", title="স্বাগতম", type="intro",
  objective="Frame the module: AI as a writing partner across work, content and communication; preview the AI Content Engine outcome.",
  visual="Lip-synced presenter left; right: module title and a 6-item roadmap ticking in.",
  camera="Slow push-in on the presenter frame.",
  animation="Title rises; roadmap chips slide in on the matching sentence.",
  onscreen=["লেসন ০৪ · Writing, Content ও Communication", "লেখার ফর্মুলা", "Email · report · proposal · script", "Blog · caption · ad copy", "Translation ও editing", "Workflow: idea → publish", "নিজের AI Content Engine"],
  sound="Logo sting; soft pop per roadmap item.",
  lines=[
  "স্বাগতম চতুর্থ লেসনে — AI দিয়ে লেখা, কনটেন্ট আর কমিউনিকেশন।",
  "পড়াশোনা, চাকরি, ফ্রিল্যান্সিং কিংবা ব্যবসা — সব জায়গাতেই প্রতিদিন কিছু না কিছু লিখতে হয়। ইমেইল, রিপোর্ট, প্রপোজাল, পোস্ট, ক্যাপশন।",
  "আজ শিখব, AI-কে কীভাবে লেখার সহকারী হিসেবে ব্যবহার করবেন — দ্রুত, কিন্তু মান আর নিজের কণ্ঠ ঠিক রেখে।",
  "দেখব ইমেইল, রিপোর্ট, প্রপোজাল আর ভিডিও স্ক্রিপ্ট; তারপর ব্লগ, ক্যাপশন আর বিজ্ঞাপনের লেখা; সাথে অনুবাদ আর এডিটিং।",
  "শেষে আইডিয়া থেকে প্রকাশ পর্যন্ত পুরো কনটেন্ট ওয়ার্কফ্লো, আর আপনার নিজের একটি AI Content Engine তৈরির অ্যাসাইনমেন্ট।"]),

 dict(id="s02", num="০২", title="লেখার মূল ফর্মুলা", type="formula",
  objective="Give one reusable writing-prompt formula and the golden rule (AI drafts, you decide).",
  visual="Six formula chips assembling into one prompt bar: কাজ · পাঠক · উদ্দেশ্য · টোন · দৈর্ঘ্য · ফরম্যাট; below a golden-rule banner 'AI খসড়া দেয় — সিদ্ধান্ত, তথ্য আর দায়িত্ব আপনার'.",
  camera="Static; slight push-in as chips lock together.",
  animation="Chips fly into the bar one by one on their names; banner rises.",
  onscreen=["কাজ · পাঠক · উদ্দেশ্য · টোন · দৈর্ঘ্য · ফরম্যাট", "AI খসড়া দেয় — সিদ্ধান্ত আপনার"],
  sound="Wood-block tick per chip.",
  lines=[
  "যেকোনো লেখার কাজে একটি সহজ ফর্মুলা মনে রাখুন — ছয়টি জিনিস বলে দিন।",
  "কাজ — কী লিখতে হবে। পাঠক — কে পড়বে। উদ্দেশ্য — পড়ে পাঠক কী করবে বা বুঝবে। টোন — ভদ্র, বন্ধুসুলভ নাকি আনুষ্ঠানিক।",
  "দৈর্ঘ্য — কত শব্দ বা কত লাইন। আর ফরম্যাট — অনুচ্ছেদ, বুলেট, টেবিল নাকি নির্দিষ্ট অংশে ভাগ।",
  "এই ছয়টি দিলে AI অনুমান কম করে, আর প্রথম খসড়াই অনেক কাজের হয়।",
  "একটি ছোট কৌশল — নিজের একটি পুরোনো লেখা দিয়ে AI-কে বলুন, এই লেখার ধাঁচে লিখতে। তাহলে খসড়া আপনার মতোই শোনাবে।",
  "আর একটি সোনালি নিয়ম — AI খসড়া দেয়, কিন্তু সিদ্ধান্ত, তথ্য আর দায়িত্ব আপনার। নিজে না পড়ে, না মিলিয়ে কোনো লেখা পাঠাবেন না।"]),

 dict(id="s03", num="০৩", title="ইমেইল", type="email",
  objective="Demonstrate weak vs strong email prompts and the checks before sending.",
  visual="Two chat panels labelled 'প্রতীকী চিত্র — আসল স্ক্রিনশট নয়'. Left (red 'দুর্বল'): 'একটা ইমেইল লিখে দাও।' → generic reply full of [Name] [Date] placeholders. Right (green 'শক্তিশালী'): the strong client-email prompt with formula parts colour-tagged → a specific sample email (labelled 'নমুনা উত্তর'). Footer checklist: নাম · তারিখ · সংখ্যা · টোন · সংযুক্তি.",
  camera="Static wide; push on the strong prompt as parts highlight.",
  animation="Weak prompt types fast; placeholders blink. Strong prompt types; parts light up; sample email slides in; checklist ticks.",
  onscreen=["দুর্বল: একটা ইমেইল লিখে দাও।", "শক্তিশালী: কাজ + পাঠক + উদ্দেশ্য + টোন + দৈর্ঘ্য + ফরম্যাট", "পাঠানোর আগে: নাম · তারিখ · সংখ্যা · টোন · সংযুক্তি"],
  sound="Keyboard taps; low buzz on placeholders; soft chime on the strong result.",
  lines=[
  "প্রথমে ইমেইল। দুর্বল প্রম্পট — একটা ইমেইল লিখে দাও। ফলাফল একটি সাধারণ ইমেইল, যাতে নাম, তারিখ, বিষয় — সবকিছুর জায়গায় ফাঁকা ঘর।",
  "এবার শক্তিশালী প্রম্পট — একজন বিদেশি ক্লায়েন্টকে ইমেইল লেখো। আমি ঢাকার একজন ফ্রিল্যান্স গ্রাফিক ডিজাইনার। লোগোর প্রথম খসড়া আজ পাঠাচ্ছি, আর শুক্রবারের মধ্যে তাঁর মতামত চাই। ভদ্র ও আত্মবিশ্বাসী টোনে, ইংরেজিতে, একশো শব্দের মধ্যে, বিষয় লাইনসহ।",
  "দেখুন, এখানে ফর্মুলার ছয়টি অংশই আছে। ফলাফল প্রায় পাঠানোর মতো একটি নির্দিষ্ট ইমেইল।",
  "ক্লায়েন্টের রাগান্বিত মেসেজের শান্ত উত্তর, কিংবা বসকে ছুটির আবেদন — একই ফর্মুলায় লেখা যায়।",
  "তবে পাঠানোর আগে পাঁচটি জিনিস মিলিয়ে নিন — নাম, তারিখ, সংখ্যা, টোন আর সংযুক্তির উল্লেখ। AI কখনো কখনো এগুলো নিজের মতো বসিয়ে দেয়।"]),

 dict(id="s04", num="০৪", title="রিপোর্ট ও প্রপোজাল", type="reportprop",
  objective="Show AI-assisted structure for reports and freelance/business proposals, and what AI must not invent.",
  visual="Left card 'রিপোর্ট' with a structure stack: সারসংক্ষেপ → মূল তথ্য → বিশ্লেষণ → সুপারিশ; a note 'আপনার ডেটা দিন — AI বানাবে না'. Right card 'প্রপোজাল' with stack: ক্লায়েন্টের সমস্যা → আপনার সমাধান → সময়সীমা → মূল্য; red tag on মূল্য 'দাম আপনি ঠিক করবেন'.",
  camera="Static; push on each card in turn.",
  animation="Structure blocks stack up; red tag stamps on price.",
  onscreen=["রিপোর্ট: সারসংক্ষেপ → তথ্য → বিশ্লেষণ → সুপারিশ", "প্রপোজাল: সমস্যা → সমাধান → সময়সীমা → মূল্য", "তথ্য ও দাম আপনার — AI-এর নয়"],
  sound="Soft click per block.",
  lines=[
  "এবার রিপোর্ট আর প্রপোজাল — অফিস আর ফ্রিল্যান্সিংয়ে সবচেয়ে কাজের দুটি লেখা।",
  "রিপোর্টের জন্য AI-কে আপনার নোট বা তথ্য দিন, আর বলুন একটি কাঠামোয় সাজাতে — সারসংক্ষেপ, মূল তথ্য, বিশ্লেষণ আর সুপারিশ।",
  "খেয়াল রাখুন — সংখ্যা আর তথ্য আপনাকেই দিতে হবে। আপনি না দিলে AI বিশ্বাসযোগ্য দেখতে, কিন্তু বানানো সংখ্যা বসিয়ে দিতে পারে।",
  "প্রপোজালের জন্য ক্লায়েন্টের চাহিদাটা পেস্ট করুন, তারপর বলুন — ক্লায়েন্টের সমস্যা, আমার সমাধান, সময়সীমা আর মূল্য — এই চার অংশে একটি প্রপোজাল লেখো।",
  "তবে দাম আর সময়সীমা আপনি নিজে ঠিক করবেন। AI আপনার খরচ, দক্ষতা বা বাজারদর জানে না।",
  "আর ক্লায়েন্টের গোপন তথ্য বা চুক্তির বিবরণ AI-তে দেওয়ার আগে নাম ও সংবেদনশীল তথ্য সরিয়ে নিন।"]),

 dict(id="s05", num="০৫", title="ভিডিও স্ক্রিপ্ট", type="script",
  objective="Teach the hook–body–CTA script structure with timing and the 'read it aloud' check.",
  visual="Horizontal script timeline bar for a 60-second Reel: হুক (০–৩ সেকেন্ড) · মূল কথা (৩–৫০) · কল-টু-অ্যাকশন (৫০–৬০); a script card with columns সময় · কী বলবেন · স্ক্রিনে কী দেখাবেন. Note: 'জোরে পড়ে দেখুন — মুখের ভাষা হচ্ছে কি?'",
  camera="Static; slow pan along the timeline bar.",
  animation="Timeline segments fill left to right; script rows type in.",
  onscreen=["হুক · মূল কথা · কল-টু-অ্যাকশন", "সময় · কী বলবেন · স্ক্রিনে কী দেখাবেন", "জোরে পড়ে দেখুন"],
  sound="Tick per segment.",
  lines=[
  "এবার ভিডিও স্ক্রিপ্ট — ইউটিউব, ফেসবুক রিলস বা টিকটকের জন্য।",
  "ভালো স্ক্রিপ্টের তিনটি অংশ — প্রথম তিন সেকেন্ডে দর্শক ধরে রাখার হুক, তারপর মূল কথা, আর শেষে কল-টু-অ্যাকশন — যেমন ফলো করুন বা কমেন্টে জানান।",
  "AI-কে বলুন — ষাট সেকেন্ডের একটি রিলসের স্ক্রিপ্ট লেখো, তিনটি কলামে: সময়, কী বলব, আর স্ক্রিনে কী দেখাব। তাহলে শুটিং আর এডিটিং দুটোই সহজ হয়।",
  "আর ষাট সেকেন্ডের ভিডিওতে মোটামুটি দেড়শো শব্দের আশেপাশেই যথেষ্ট — বেশি লিখলে তাড়াহুড়ো করে বলতে হবে।",
  "স্ক্রিপ্ট পেলে অবশ্যই জোরে পড়ে দেখুন। লেখার ভাষা আর মুখের ভাষা আলাদা — যেখানে আটকে যায়, সেখানে AI-কে বলুন আরও সহজ কথ্য ভাষায় লিখতে।"]),

 dict(id="s06", num="০৬", title="ব্লগ লেখা", type="blog",
  objective="Teach outline-first blogging, adding first-hand experience, keywords and fact-checks.",
  visual="Three-step strip: আউটলাইন → প্রতিটি অংশ আলাদা করে → নিজের অভিজ্ঞতা ও উদাহরণ যোগ. Side card 'SEO কিওয়ার্ড' with keyword chip and 'জোর করে ভরবেন না'. Amber note 'তথ্য, পরিসংখ্যান ও উৎস যাচাই করুন'.",
  camera="Static; push on the steps.",
  animation="Outline lines expand into sections; an 'আমার অভিজ্ঞতা' sticky note slaps on.",
  onscreen=["আউটলাইন → অংশ ধরে লেখা → নিজের অভিজ্ঞতা", "কিওয়ার্ড স্বাভাবিকভাবে", "তথ্য ও উৎস যাচাই করুন"],
  sound="Paper rustle on the sticky note.",
  lines=[
  "এবার ব্লগ। পুরো ব্লগ একবারে না চেয়ে আগে একটি আউটলাইন চান — শিরোনাম আর প্রতিটি অংশের মূল পয়েন্ট।",
  "আউটলাইন ঠিক হলে প্রতিটি অংশ আলাদা করে লেখান। এতে লেখা গোছানো হয়, আর প্রতিটি অংশ আপনি নিয়ন্ত্রণ করতে পারেন।",
  "সবচেয়ে গুরুত্বপূর্ণ ধাপ — নিজের অভিজ্ঞতা, উদাহরণ আর মতামত যোগ করুন। শুধু AI-এর লেখা সাধারণ শোনায়; আপনার নিজের গল্পই পাঠককে ধরে রাখে।",
  "সার্চে আসার জন্য কিওয়ার্ড চাইলে AI-কে বলুন সেটি স্বাভাবিকভাবে ব্যবহার করতে — জোর করে বারবার নয়।",
  "লেখা শেষে আকর্ষণীয় শিরোনামের পাঁচটি বিকল্পও চেয়ে নিতে পারেন, তারপর নিজের পছন্দেরটি বাছুন।",
  "আর ব্লগে কোনো তথ্য, পরিসংখ্যান বা উদ্ধৃতি থাকলে আসল উৎস থেকে মিলিয়ে নিন।"]),

 dict(id="s07", num="০৭", title="ক্যাপশন ও বিজ্ঞাপনের লেখা", type="captionad",
  objective="Generate caption variations and ad copy with a simple formula; avoid false claims and policy issues.",
  visual="Left: three phone-post mockups with caption variations A/B/C (labelled প্রতীকী) for a Dhaka clothing shop. Right: ad-copy formula card সমস্যা → সুবিধা → প্রমাণ → কল-টু-অ্যাকশন; red banner 'মিথ্যা দাবি নয় · প্ল্যাটফর্মের বিজ্ঞাপন নীতি মানুন'.",
  camera="Static; push on the formula card.",
  animation="Captions slide up one by one; formula steps light; red banner stamps.",
  onscreen=["ক্যাপশন: কয়েকটি বিকল্প চান, সেরাটি বাছুন", "বিজ্ঞাপন: সমস্যা → সুবিধা → প্রমাণ → কল-টু-অ্যাকশন", "মিথ্যা দাবি নয় · বিজ্ঞাপন নীতি মানুন"],
  sound="Notification pop per caption.",
  lines=[
  "এবার সোশ্যাল মিডিয়ার ক্যাপশন আর বিজ্ঞাপনের লেখা।",
  "ক্যাপশনের জন্য একটি নয়, কয়েকটি বিকল্প চান — যেমন, ঢাকার একটি পোশাকের পেজের নতুন কালেকশনের জন্য তিনটি ক্যাপশন দাও: একটি মজার, একটি আবেগী, একটি সরাসরি অফারের। তারপর সেরাটি বাছুন বা মিলিয়ে নিন।",
  "বিজ্ঞাপনের লেখায় একটি সহজ কাঠামো কাজে আসে — গ্রাহকের সমস্যা, আপনার পণ্যের সুবিধা, একটি প্রমাণ, যেমন রিভিউ, আর শেষে কল-টু-অ্যাকশন।",
  "তবে সাবধান — মিথ্যা দাবি, যেমন শতভাগ গ্যারান্টি বা অবাস্তব ফল, লিখবেন না। এটি গ্রাহকের সাথে প্রতারণা, আর প্ল্যাটফর্মের বিজ্ঞাপন নীতিও ভাঙে।",
  "AI যদি এমন কোনো দাবি লিখে দেয়, যা আপনার পণ্যের ক্ষেত্রে সত্য নয়, তা অবশ্যই কেটে দিন।"]),

 dict(id="s08", num="০৮", title="অনুবাদ", type="translate",
  objective="Use AI for Bangla↔English translation with context and tone, and know its limits.",
  visual="Split card: Bangla sentence on the left morphing into English on the right with a tone dial (আনুষ্ঠানিক ↔ বন্ধুসুলভ). Check-chips: নাম · সংখ্যা · তারিখ · অর্থ. Red note: 'আইনি/সরকারি ডকুমেন্ট → পেশাদার অনুবাদক'. Tip: 'উল্টো অনুবাদ করে মিলিয়ে দেখুন'.",
  camera="Static; push on the morph.",
  animation="Words morph across; dial turns; check-chips tick.",
  onscreen=["প্রসঙ্গ ও টোন বলে দিন", "নাম · সংখ্যা · তারিখ · অর্থ মিলিয়ে নিন", "উল্টো অনুবাদে যাচাই", "আইনি/সরকারি কাগজ → পেশাদার অনুবাদক"],
  sound="Soft swoosh on the morph.",
  lines=[
  "এবার অনুবাদ — বাংলা থেকে ইংরেজি, বা ইংরেজি থেকে বাংলা।",
  "শুধু অনুবাদ করো না বলে প্রসঙ্গ আর টোন বলে দিন — যেমন, এটি একজন বিদেশি ক্লায়েন্টের জন্য, ভদ্র ও পেশাদার ইংরেজিতে অনুবাদ করো, আক্ষরিক নয়, স্বাভাবিক ভাষায়।",
  "অনুবাদের পর নাম, সংখ্যা, তারিখ আর মূল অর্থ ঠিক আছে কি না মিলিয়ে নিন। একটি ভালো কৌশল — অনুবাদটি আবার উল্টো দিকে অনুবাদ করিয়ে দেখুন, মূল কথা ঠিক থাকছে কি না।",
  "তবে আইনি কাগজ, সরকারি আবেদন বা চিকিৎসা-সংক্রান্ত লেখার মতো গুরুত্বপূর্ণ ক্ষেত্রে শুধু AI-এর ওপর ভরসা করবেন না — পেশাদার অনুবাদক বা বিশেষজ্ঞকে দিয়ে দেখিয়ে নিন।",
  "আর বাংলাভাষী গ্রাহকের জন্য কনটেন্ট দরকার হলে ইংরেজি থেকে অনুবাদ না করে সরাসরি বাংলায় লিখতে বলুন — তাতে ভাষা বেশি স্বাভাবিক হয়।"]),

 dict(id="s09", num="০৯", title="এডিটিং", type="editing",
  objective="Use AI to edit your own writing (grammar, clarity, length, tone) while keeping your voice.",
  visual="A paragraph with tracked-change marks: strikethroughs, insertions, a 'কী বদলালে, তালিকা দাও' callout. Four edit-mode chips: ব্যাকরণ ও বানান · আরও স্পষ্ট · আরও ছোট · টোন বদল. Note: 'নিজের কণ্ঠ রাখুন — অর্থ যেন না বদলায়'.",
  camera="Static; push on the tracked changes.",
  animation="Edit marks appear word by word; chips pop.",
  onscreen=["ব্যাকরণ ও বানান · আরও স্পষ্ট · আরও ছোট · টোন বদল", "কী বদলালে, তালিকা দাও", "নিজের কণ্ঠ রাখুন"],
  sound="Pen scribble on edits.",
  lines=[
  "এবার এডিটিং — নিজের লেখা ঠিক করতে AI দারুণ সহকারী।",
  "নিজের লেখা পেস্ট করে নির্দিষ্ট করে বলুন — শুধু ব্যাকরণ আর বানান ঠিক করো; কিংবা আরও স্পষ্ট করো; অর্ধেক ছোট করো; অথবা টোন আরও আনুষ্ঠানিক করো।",
  "একটি দরকারি নির্দেশনা যোগ করুন — কী কী বদলেছ, তার একটি তালিকা দাও। এতে আপনি প্রতিটি পরিবর্তন দেখে মেনে নিতে বা বাদ দিতে পারবেন, আর ইংরেজি লেখার ভুলগুলোও শিখে যাবেন।",
  "যেমন একজন চাকরিপ্রার্থী নিজের ইংরেজি সিভির সারসংক্ষেপ দিয়ে বলতে পারেন — ব্যাকরণ ঠিক করো, আরও আত্মবিশ্বাসী করো, কিন্তু কোনো নতুন দক্ষতা বা অভিজ্ঞতা যোগ করবে না।",
  "আর বলে দিন — আমার কণ্ঠ আর মূল অর্থ যেন না বদলায়। নইলে লেখাটা আপনার নয়, AI-এর মতো শোনাবে।"]),

 dict(id="s10", num="১০", title="কনটেন্ট ওয়ার্কফ্লো: আইডিয়া থেকে প্রকাশ", type="workflow",
  objective="Map an end-to-end content workflow with AI steps and human checkpoints.",
  visual="Seven-stage pipeline: আইডিয়া → গবেষণা → আউটলাইন → খসড়া → এডিট ও যাচাই → ডিজাইন → প্রকাশ ও মূল্যায়ন. AI icon on stages it helps; person icon with a green check on 'এডিট ও যাচাই' and 'প্রকাশ'. Example strip: একটি ব্লগ থেকে ৩টি ক্যাপশন + ১টি রিলস স্ক্রিপ্ট + ১টি ইমেইল.",
  camera="Slow pan left→right along the pipeline.",
  animation="Stages light up in sequence; human checkpoint badges pop; repurpose arrows fan out.",
  onscreen=["আইডিয়া → গবেষণা → আউটলাইন → খসড়া → এডিট ও যাচাই → ডিজাইন → প্রকাশ", "মানুষের যাচাই: এডিট ও প্রকাশের আগে", "একটি কনটেন্ট → অনেক ফরম্যাট"],
  sound="Tick per stage.",
  lines=[
  "এবার সবকিছু একসাথে — আইডিয়া থেকে প্রকাশ পর্যন্ত একটি কনটেন্ট ওয়ার্কফ্লো।",
  "আইডিয়া, গবেষণা, আউটলাইন, খসড়া, এডিট ও যাচাই, ডিজাইন, তারপর প্রকাশ আর ফলাফল মূল্যায়ন।",
  "আইডিয়া খোঁজা, আউটলাইন আর খসড়ায় AI অনেক সময় বাঁচায়। কিন্তু এডিট ও যাচাই, আর প্রকাশের সিদ্ধান্ত — এই দুই জায়গায় মানুষের চোখ বাধ্যতামূলক।",
  "আরেকটি শক্তিশালী কৌশল — রিপারপাস। একটি ব্লগ লিখে AI-কে বলুন সেখান থেকে তিনটি ক্যাপশন, একটি রিলস স্ক্রিপ্ট আর একটি নিউজলেটার ইমেইল বানাতে। এক পরিশ্রমে পাঁচটি কনটেন্ট।",
  "একটি সাধারণ স্প্রেডশিটেই এই ধাপগুলোর কলাম বানিয়ে প্রতিটি কনটেন্টের অবস্থা ট্র্যাক করতে পারেন।",
  "প্রকাশের পর কোন পোস্ট ভালো চলল, তা দেখে পরের আইডিয়া ঠিক করুন — এভাবেই চক্রটি প্রতি সপ্তাহে উন্নত হয়।"]),

 dict(id="s11", num="১১", title="আপনার AI Content Engine", type="engine",
  objective="Assemble the outcome — a personal AI Content Engine — and set the assignment.",
  visual="Engine diagram with four parts feeding a central gear: ১ ব্র্যান্ড ভয়েস কার্ড · ২ প্রম্পট টেমপ্লেট লাইব্রেরি · ৩ সাপ্তাহিক কনটেন্ট ক্যালেন্ডার · ৪ যাচাই চেকলিস্ট. Output arrows: ১ ব্লগ · ৩ ক্যাপশন · ১ স্ক্রিপ্ট · ১ ইমেইল. Assignment card with deliverables.",
  camera="Slow push-in on the gear.",
  animation="Parts slot into the engine; gear spins; outputs fan out; assignment card flips in.",
  onscreen=["ব্র্যান্ড ভয়েস কার্ড", "প্রম্পট টেমপ্লেট লাইব্রেরি", "সাপ্তাহিক কনটেন্ট ক্যালেন্ডার", "যাচাই চেকলিস্ট", "অ্যাসাইনমেন্ট: এক সপ্তাহের কনটেন্ট"],
  sound="Mechanical whirr as the gear turns; pop per output.",
  lines=[
  "এবার এই মডিউলের মূল অর্জন — নিজের একটি AI Content Engine। এটি চারটি অংশ নিয়ে একটি সহজ ব্যবস্থা, যা প্রতি সপ্তাহে আবার ব্যবহার করবেন।",
  "এক — ব্র্যান্ড ভয়েস কার্ড: আপনি বা আপনার ব্যবসা কেমন ভাষায় কথা বলে, কোন শব্দ ব্যবহার করেন আর করেন না, আর আপনার পাঠক কারা।",
  "দুই — প্রম্পট টেমপ্লেট লাইব্রেরি: ইমেইল, ক্যাপশন, ব্লগ আউটলাইন আর স্ক্রিপ্টের জন্য ফর্মুলা অনুযায়ী তৈরি প্রম্পট, যেখানে শুধু তথ্য বদলালেই চলে। তিন — সাপ্তাহিক কনটেন্ট ক্যালেন্ডার। আর চার — প্রকাশের আগে যাচাইয়ের চেকলিস্ট।",
  "আপনার অ্যাসাইনমেন্ট — এই চারটি অংশ একটি ডকুমেন্টে তৈরি করুন। তারপর এই ইঞ্জিন দিয়ে এক সপ্তাহের কনটেন্ট বানান: একটি ব্লগ, সেখান থেকে তিনটি ক্যাপশন, একটি রিলস স্ক্রিপ্ট আর একটি ইমেইল।",
  "জমা দিন — ডকুমেন্ট, তৈরি কনটেন্ট, আর দুই লাইনে লিখুন কোথায় AI-এর লেখা বদলাতে হয়েছে, আর কেন।"]),

 dict(id="s12", num="১২", title="সারসংক্ষেপ", type="recap",
  objective="Consolidate the module.",
  visual="Lip-synced presenter returns; checklist of six ideas; module-complete card 'মডিউল ০৪ সম্পন্ন'.",
  camera="Slow pull-back to the end frame.",
  animation="Checks tick in sequence; completion card slides in; end card.",
  onscreen=["✓ লেখার ফর্মুলা", "✓ Email · report · proposal · script", "✓ Blog · caption · ad copy", "✓ Translation ও editing", "✓ Idea → publish ওয়ার্কফ্লো", "✓ নিজের AI Content Engine"],
  sound="Success chime; music swells and fades.",
  lines=[
  "আজ আমরা শিখলাম লেখার ছয় অংশের ফর্মুলা — কাজ, পাঠক, উদ্দেশ্য, টোন, দৈর্ঘ্য আর ফরম্যাট।",
  "দেখলাম ইমেইল, রিপোর্ট, প্রপোজাল আর স্ক্রিপ্ট; ব্লগ, ক্যাপশন আর বিজ্ঞাপন; আর অনুবাদ ও এডিটিংয়ে AI কীভাবে সাহায্য করে।",
  "জানলাম আইডিয়া থেকে প্রকাশ পর্যন্ত ওয়ার্কফ্লো, আর নিজের AI Content Engine তৈরির উপায়।",
  "মনে রাখবেন — AI আপনার লেখার গতি বাড়ায়, কিন্তু আপনার অভিজ্ঞতা, কণ্ঠ আর সততাই লেখাকে আলাদা করে।",
  "আর AI দিয়ে বানানো ছবি, ভিডিও বা কণ্ঠ প্রকাশের সময় প্ল্যাটফর্মের নিয়ম অনুযায়ী প্রয়োজন হলে তা জানিয়ে দিন।",
  "অ্যাসাইনমেন্টটি শেষ করে চলে আসুন পরের মডিউলে। দেখা হবে!"]),
]

if __name__ == "__main__":
    import re
    tot = 0
    for s in SCENES:
        c = sum(len(re.sub(r"\s", "", l)) for l in s["lines"]); tot += c
        print(s["id"], len(s["lines"]), c)
    print("total chars", tot, "≈", round(tot / 11.7 / 60, 2), "min raw")
