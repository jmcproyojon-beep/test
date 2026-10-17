# PILLAR 01 · LESSON 02 — AI, Machine Learning, Deep Learning & Generative AI
## Production Package · AI Fundamentals & Digital Literacy (বাংলা)

**Rendered file:** `pillar01-lesson02_final.mp4` (master, 78 MB) · **Measured duration:** 09:59.5 (599.5 s) · 1920×1080 · 30 fps · H.264 + AAC

> **What's real here:** the MP4 was actually rendered and checked.
> - **Narration:** Gemini text-to-speech, prebuilt male voice **Orus** (scenes 01, 02: `gemini-3.8-flash-tts`; scenes 03, 04, 05, 06: `gemini-3.1-flash-tts-preview`; scenes 07, 08, 09, 10, 11: `gemini-2.5-flash-preview-tts`). Each take was transcribed with Gemini and compared to the script (similarity scores in Section G).
> - **Search vs assistant comparison (scene 09):** both panels are clearly labelled illustrations ("প্রতীকী চিত্র — আসল স্ক্রিনশট নয়"), because this production environment can't reach chatgpt.com. Record the real side-by-side capture with Section E and replace the two panels before publishing.
> - **Token splits (scene 08)** are illustrative, and the video says so. Real tokenizers split text differently per model. Section E shows how to get real counts from OpenAI's official Tokenizer page.
> - **Instructor:** the photo is the channel owner's own image. It is a still, not lip-synced.

---
## SECTION A — Lesson metadata

| Field | Value |
|---|---|
| Lesson | PILLAR 01 · Lesson 02 — AI, Machine Learning, Deep Learning & Generative AI |
| Planned duration | 10:00 |
| Rendered duration | **09:59.5** (spoken narration plus chapter cards, pauses and end card) |
| Format | 16:9 · 1920×1080 · 30 fps · H.264 MP4 · Bangla burned-in subtitles + SRT |
| Audience | Absolute beginners: students, content creators, freelancers, job seekers, small business owners in Bangladesh |
| Language | Bangla (standard Bangladeshi), English technical terms explained |

**Learning objectives:** by the end, the learner can:
- draw the nesting AI ⊃ Machine Learning ⊃ Deep Learning, and place Generative AI (mostly deep-learning based) inside it;
- define Machine Learning and tell supervised, unsupervised and reinforcement learning apart with one example each;
- explain an artificial neural network (input, hidden and output layers, weights adjusted during training) and why many layers are called deep learning;
- say what makes Generative AI different from AI that only recognises or classifies, and name five kinds of output;
- describe a Large Language Model, its two build stages (pre-training, then fine-tuning with feedback), and why it can be confidently wrong;
- explain how training data quality, bias, cut-off date and language coverage affect AI;
- define tokens, context window and inference, and contrast inference with training;
- choose between a search engine and a generative assistant for a given question, and verify important facts at the original source.

**Prerequisites:** Lesson 01 (what AI is, and how it learns from data) is helpful but not required, since this lesson recaps it. You'll need internet access, Google Search, and a free ChatGPT or Gemini account for the exercise.

**Expected learning outcomes:** a completed Search-vs-AI comparison table for three questions, and a six-item classification with reasons (Section F). The learner can also say in one sentence how AI, ML, DL, Generative AI and LLMs relate.

---
## SECTION B — Full narration script (Bangla)

Every word below is exactly what the narrator says in the rendered video. English terms stay in Latin script; the narrator says them in English.

### ০১ · স্বাগতম  `00:01.2–00:31.1`

স্বাগতম PILLAR 01-এর দ্বিতীয় লেসনে।  
আগের লেসনে আমরা জেনেছি AI কী, আর কীভাবে এটি ডেটা থেকে শেখে।  
আজ আমরা আরেকটু গভীরে যাব — এমন কিছু শব্দ, যেগুলো শুনলেই অনেকের গুলিয়ে যায়: Artificial Intelligence, Machine Learning, Deep Learning, Neural Network, Generative AI আর Large Language Model।  
সাথে বুঝব ট্রেনিং ডেটা, টোকেন আর ইনফারেন্স মানে কী, আর সার্চ ইঞ্জিন আর AI অ্যাসিস্ট্যান্টের মধ্যে পার্থক্য কোথায়।  
শেষে থাকবে একটি হাতে-কলমে তুলনা আর আপনার জন্য অনুশীলন।  

### ০২ · বড় ছবি: চারটি বৃত্ত  `00:33.0–01:22.4`

শুরুতে পুরো ছবিটা দেখে নিই। এই চারটি শব্দকে কল্পনা করুন, একটির ভেতরে আরেকটি বৃত্ত হিসেবে।  
সবচেয়ে বড় বৃত্ত — Artificial Intelligence। কম্পিউটারকে দিয়ে বুদ্ধিমত্তার কাজ করানোর পুরো ক্ষেত্রটাই AI।  
তার ভেতরে Machine Learning — AI তৈরির এমন একটি পদ্ধতি, যেখানে কম্পিউটার ডেটা থেকে নিজে শেখে। তাই হাতে নিয়ম লিখে বানানো একটি দাবা খেলার প্রোগ্রামও AI, কিন্তু সেটি Machine Learning নয়।  
Machine Learning-এর ভেতরে Deep Learning — যেখানে অনেক স্তরের নিউরাল নেটওয়ার্ক ব্যবহার করে শেখা হয়।  
আর Generative AI হলো এমন AI, যা নতুন কনটেন্ট তৈরি করতে পারে। আজকের বেশিরভাগ Generative AI, যেমন ChatGPT-এর মতো চ্যাটবট, Deep Learning-এর ওপর ভিত্তি করে তৈরি।  
মনে রাখার সহজ উপায় — প্রতিটি ভেতরের বৃত্ত বাইরের বৃত্তের একটি অংশ। সব Deep Learning-ই Machine Learning, কিন্তু সব Machine Learning, Deep Learning নয়।  

### ০৩ · Machine Learning  `01:24.3–02:18.0`

এবার Machine Learning। সাধারণ প্রোগ্রামে আমরা নিয়ম লিখে দিই, আর Machine Learning-এ কম্পিউটার উদাহরণ দেখে নিজেই প্যাটার্ন শেখে।  
Machine Learning-এর প্রধান তিনটি ধরন আছে।  
প্রথম — Supervised Learning, বা তত্ত্বাবধানে শেখা। এখানে প্রতিটি উদাহরণের সাথে সঠিক উত্তর বা লেবেল দেওয়া থাকে। যেমন হাজারো ইমেইল, প্রতিটিতে লেখা স্প্যাম নাকি স্প্যাম নয় — দেখে দেখে মডেল নতুন ইমেইল চিনতে শেখে।  
দ্বিতীয় — Unsupervised Learning। এখানে কোনো লেবেল থাকে না; মডেল নিজেই ডেটার মধ্যে মিল খুঁজে দল বানায়। যেমন, একটি অনলাইন দোকান কেনাকাটার ধরন দেখে কাস্টমারদের কয়েকটি দলে ভাগ করতে পারে।  
তৃতীয় — Reinforcement Learning। এখানে মডেল চেষ্টা আর ভুলের মাধ্যমে শেখে — ভালো কাজে পুরস্কার, খারাপ কাজে শাস্তি। গেম খেলা বা রোবট নিয়ন্ত্রণ শেখাতে এই পদ্ধতি বেশ ব্যবহৃত হয়।  
মূল কথা — Machine Learning-এর শক্তি আসে ডেটা থেকে। ডেটা যত ভালো, শেখাও তত ভালো।  

### ০৪ · Neural Network ও Deep Learning  `02:19.9–03:20.1`

এবার Deep Learning আর Artificial Neural Network।  
Artificial Neural Network বা কৃত্রিম নিউরাল নেটওয়ার্কের ধারণা এসেছে মানুষের মস্তিষ্কের নিউরন থেকে। তবে এটি মস্তিষ্কের হুবহু নকল নয়, বরং অনেক সরল একটি গাণিতিক মডেল।  
একটি নিউরাল নেটওয়ার্কে থাকে কয়েকটি স্তর। ইনপুট স্তরে ডেটা ঢোকে — যেমন একটি ছবির পিক্সেল। মাঝের লুকানো স্তরগুলো ধাপে ধাপে প্যাটার্ন খোঁজে। আর আউটপুট স্তর ফলাফল দেয় — যেমন, এটি একটি বিড়ালের ছবি।  
প্রতিটি সংযোগের একটি ওজন বা weight থাকে। ট্রেনিংয়ের সময় মডেল নিজের ভুল দেখে এই ওজনগুলো একটু একটু করে ঠিক করে, যতক্ষণ না উত্তর ভালো হয়।  
যখন এই মাঝের স্তর অনেকগুলো হয়, তখন তাকে বলে Deep Learning। deep মানে গভীর — অর্থাৎ অনেক স্তর।  
প্রথম দিকের স্তর হয়তো শুধু রেখা আর কোণ চেনে, পরের স্তর চোখ বা কান, আর শেষের দিকের স্তর পুরো মুখ।  
ছবি চেনা, বাংলা ভয়েস টাইপিং, অনুবাদ — আজকের এসব প্রযুক্তির বড় অংশ Deep Learning-এর ওপর চলে।  

### ০৫ · Generative AI  `03:22.0–04:13.4`

এবার Generative AI — আজ যেটি নিয়ে সবচেয়ে বেশি আলোচনা।  
আগের অনেক AI কাজ করত চেনা বা বাছাই করার জন্য — যেমন, এটা স্প্যাম কি না, কিংবা এটা আম না কাঁঠাল। এগুলো বিদ্যমান তথ্য দেখে সিদ্ধান্ত দেয়।  
Generative AI এক ধাপ এগিয়ে নতুন কনটেন্ট তৈরি করে — যা আগে হুবহু ছিল না।  
লেখা — যেমন ইমেইল, রিপোর্ট বা গল্প। ছবি — বর্ণনা দিলেই নতুন ছবি। অডিও — কৃত্রিম কণ্ঠ বা মিউজিক। ভিডিও — ছোট ক্লিপ। আর কোড — প্রোগ্রামের অংশ। আগের লেসনে ChatGPT-তে প্রম্পট লিখে যে উত্তর পেয়েছিলেন, সেটিও Generative AI-এর একটি উদাহরণ।  
তবে নতুন তৈরি মানেই সঠিক বা নিরাপদ নয়। Generative AI ভুল তথ্য বানাতে পারে, আর এর তৈরি কনটেন্টের কপিরাইট ও নৈতিকতা নিয়েও প্রশ্ন আছে — যা আমরা ষষ্ঠ লেসনে বিস্তারিত দেখব।  

### ০৬ · Large Language Model (LLM)  `04:15.3–05:07.8`

Generative AI-এর সবচেয়ে পরিচিত রূপ হলো Large Language Model, সংক্ষেপে LLM।  
LLM হলো বিপুল পরিমাণ লেখা দিয়ে ট্রেনিং দেওয়া একটি বড় নিউরাল নেটওয়ার্ক, যা ভাষা বুঝে প্রশ্নের উত্তর দিতে আর নতুন লেখা তৈরি করতে পারে।  
ChatGPT, Google Gemini বা Claude-এর মতো AI অ্যাসিস্ট্যান্টের পেছনে মূল ইঞ্জিন হিসেবে কাজ করে এমন LLM।  
একটি LLM সাধারণত দুই ধাপে তৈরি হয়।  
প্রথম ধাপে প্রি-ট্রেনিং — বই, ওয়েবসাইট আর নানা লেখা থেকে মডেল শেখে, কোন শব্দের পরে কোন শব্দ আসার সম্ভাবনা বেশি।  
দ্বিতীয় ধাপে ফাইন-টিউনিং — নির্দেশনা মানা, প্রশ্নের কাজের উত্তর দেওয়া, আর ক্ষতিকর অনুরোধ এড়ানো শেখানো হয়। অনেক ক্ষেত্রে মানুষের মূল্যায়ন বা ফিডব্যাক দিয়েও উত্তর উন্নত করা হয়।  
মনে রাখবেন, LLM কোনো তথ্যভান্ডার থেকে উত্তর খুঁজে আনে না। শেখা প্যাটার্ন থেকে সম্ভাব্য উত্তর তৈরি করে — এজন্যই মাঝে মাঝে আত্মবিশ্বাসের সাথে ভুলও বলে।  

### ০৭ · ট্রেনিং ডেটা  `05:09.7–06:01.6`

AI-এর মান অনেকটাই নির্ভর করে তার ট্রেনিং ডেটার ওপর।  
ট্রেনিং ডেটা হলো সেই সব উদাহরণ, যা দেখে মডেল শেখে — লেখা, ছবি, শব্দ, কিংবা টেবিলের সংখ্যা। যেমন, বাংলা হাতের লেখা চেনার মডেল বানাতে হাজারো মানুষের হাতের লেখার ছবি লাগে, প্রতিটির সাথে সঠিক অক্ষরের লেবেল।  
ইংরেজিতে একটা কথা আছে — garbage in, garbage out। ভুল বা নিম্নমানের ডেটা দিলে ফলাফলও খারাপ হয়।  
ডেটায় পক্ষপাত থাকলে মডেলও পক্ষপাতী হয়। যেমন, কোনো ছবি চেনার মডেল যদি শুধু এক ধরনের মানুষের ছবিতে শেখে, অন্যদের ক্ষেত্রে সে বেশি ভুল করতে পারে।  
ডেটার সময়সীমাও গুরুত্বপূর্ণ। ট্রেনিংয়ের পরে যা ঘটেছে, তা মডেল নিজে থেকে জানে না — এজন্য কিছু অ্যাসিস্ট্যান্ট আলাদা করে ওয়েব সার্চের সুবিধা ব্যবহার করে।  
আর বাংলার মতো ভাষায় ইংরেজির তুলনায় অনলাইনে ডেটা কম, তাই অনেক মডেল বাংলায় তুলনামূলক কম দক্ষ হতে পারে — যদিও এই অবস্থা দ্রুত উন্নত হচ্ছে।  

### ০৮ · টোকেন ও ইনফারেন্স  `06:03.5–07:01.5`

এবার দুটি গুরুত্বপূর্ণ শব্দ — টোকেন আর ইনফারেন্স।  
LLM সরাসরি পুরো শব্দ বা বাক্য পড়ে না। লেখাকে সে ছোট ছোট টুকরোয় ভাঙে — এগুলোকে বলে টোকেন। একটি টোকেন হতে পারে একটি পুরো শব্দ, শব্দের অংশ, এমনকি একটি চিহ্ন।  
OpenAI-এর দেওয়া একটি মোটা হিসাবে, ইংরেজিতে গড়ে প্রায় চার অক্ষরে এক টোকেন হয়। আর বাংলার মতো অনেক ভাষায় একই কথা বলতে সাধারণত বেশি টোকেন লাগে।  
টোকেন কেন জানা দরকার? কারণ প্রতিটি মডেল একবারে নির্দিষ্ট পরিমাণ টোকেনই মাথায় রাখতে পারে — একে বলে কনটেক্সট উইন্ডো। আর অনেক পেইড সার্ভিসে খরচও হয় টোকেনের হিসাবে।  
আর ইনফারেন্স মানে হলো ট্রেনিং শেষ হওয়া মডেলকে ব্যবহার করে উত্তর তৈরি করা। আপনি যখন প্রশ্ন পাঠান, মডেল একটার পর একটা টোকেন অনুমান করে উত্তর গড়ে তোলে — এটাই ইনফারেন্স।  
ট্রেনিং হয় একবার, অনেক সময় আর খরচে। আর ইনফারেন্স ঘটে প্রতিবার, যখনই কেউ প্রশ্ন করে।  
আর যেহেতু প্রতিবার সম্ভাবনা থেকে টোকেন বাছাই হয়, তাই একই প্রশ্নে প্রতিবার হুবহু একই উত্তর না-ও আসতে পারে।  

### ০৯ · সার্চ ইঞ্জিন বনাম AI অ্যাসিস্ট্যান্ট  `07:03.4–08:22.9`

এবার একটি বাস্তব প্রশ্ন — Google-এর মতো সার্চ ইঞ্জিন আর ChatGPT-এর মতো AI অ্যাসিস্ট্যান্টের মধ্যে পার্থক্য কী?  
সার্চ ইঞ্জিন ইন্টারনেটে আগে থেকে থাকা ওয়েবপেজ খুঁজে দেয়, আর আপনাকে লিংকের তালিকা দেখায়। কোন উৎস বিশ্বাসযোগ্য, তা বাছাই করে পড়ার দায়িত্ব আপনার।  
AI অ্যাসিস্ট্যান্ট নিজের শেখা প্যাটার্ন থেকে সরাসরি একটি গোছানো উত্তর লিখে দেয়। আপনি চাইলে একই আলোচনায় ফলো-আপ প্রশ্নও করতে পারেন।  
সার্চ ইঞ্জিনের শক্তি — সাম্প্রতিক তথ্য, আসল উৎসের লিংক, আর অফিশিয়াল ওয়েবসাইট খুঁজে পাওয়া। দুর্বলতা — অনেক লিংক ঘেঁটে নিজেকেই উত্তর জোড়া দিতে হয়।  
AI অ্যাসিস্ট্যান্টের শক্তি — ব্যাখ্যা, সারসংক্ষেপ, লেখার খসড়া আর ধাপে ধাপে বুঝিয়ে দেওয়া। দুর্বলতা — ভুল তথ্য বানাতে পারে, আর অনেক সময় উৎস দেখায় না।  
এখন অনেক অ্যাসিস্ট্যান্ট ওয়েব সার্চ করে উৎসের লিংকও দেখায়, আর অনেক সার্চ ইঞ্জিনেও AI-তৈরি সারাংশ আসে। তবুও নিয়মটা একই — গুরুত্বপূর্ণ তথ্যের জন্য আসল উৎস খুলে মিলিয়ে নিন।  
একটি উদাহরণ দেখি — প্রশ্ন: এসএসসি পরীক্ষার ফলাফল কবে প্রকাশ হবে? এমন সাম্প্রতিক আর অফিশিয়াল তথ্যের জন্য সার্চ ইঞ্জিনে খুঁজে শিক্ষা বোর্ডের অফিশিয়াল ওয়েবসাইটই ভরসা।  
আর প্রশ্ন যদি হয় — সালোকসংশ্লেষণ সহজ বাংলায় বুঝিয়ে দিন, তাহলে AI অ্যাসিস্ট্যান্ট দারুণ কাজে আসে। তবে পরীক্ষার আগে পাঠ্যবইয়ের সাথে মিলিয়ে নিন।  

### ১০ · আপনার অনুশীলন  `08:24.8–09:16.4`

এবার আপনার অনুশীলন — দুটি অংশে।  
প্রথম অংশ — একই তিনটি প্রশ্ন একবার Google সার্চে, আরেকবার ChatGPT বা Gemini-তে করুন। যেমন — বাংলাদেশের জাতীয় ফলের নাম কী, ইমেইল লেখার সময় কোন পাঁচটি বিষয় খেয়াল রাখবেন, আর এই সপ্তাহে ঢাকার আবহাওয়া কেমন থাকবে।  
প্রতিটির জন্য একটি টেবিলে লিখুন — কোনটির উত্তর বেশি নির্ভুল, কোনটি উৎস দেখিয়েছে, কোনটি সাম্প্রতিক, আর কোনটি বুঝতে সহজ।  
দ্বিতীয় অংশ — স্ক্রিনের ছয়টি উদাহরণ দেখুন: স্প্যাম ফিল্টার, ফোনের ফেস আনলক, ChatGPT দিয়ে ইমেইল লেখা, হাতে লেখা নিয়মের দাবা প্রোগ্রাম, কাস্টমারদের দলে ভাগ করা, আর বর্ণনা থেকে ছবি তৈরি।  
প্রতিটি উদাহরণ চারটি বৃত্তের সবচেয়ে ভেতরের কোনটিতে পড়ে — AI, Machine Learning, Deep Learning নাকি Generative AI — লিখুন, আর এক লাইনে কারণ দিন।  
আপনার টেবিল আর উত্তরগুলো একটি ডকুমেন্টে লিখে সংরক্ষণ করুন — পরের লেসনগুলোতেও কাজে লাগবে।  

### ১১ · সারসংক্ষেপ  `09:18.3–09:56.5`

আজ আমরা দেখলাম — AI, Machine Learning, Deep Learning আর Generative AI একটির ভেতরে আরেকটি।  
শিখলাম নিউরাল নেটওয়ার্ক কীভাবে স্তরে স্তরে শেখে, LLM কী, আর ট্রেনিং ডেটা কেন এত গুরুত্বপূর্ণ।  
জানলাম টোকেন আর ইনফারেন্স মানে কী, আর কখন সার্চ ইঞ্জিন আর কখন AI অ্যাসিস্ট্যান্ট ব্যবহার করবেন।  
পরের লেসনে আমরা দেখব প্রয়োজনীয় AI টুলগুলো — লেখা, ছবি, ভিডিও, অডিও আর কোডিংয়ের জন্য — আর কীভাবে সঠিক টুল বেছে নেবেন।  
মনে রাখবেন, AI একটি শক্তিশালী সহকারী, কিন্তু যাচাই আর শেষ সিদ্ধান্তের দায়িত্ব সবসময় আপনার।  
অনুশীলনটি শেষ করে চলে আসুন পরের লেসনে। দেখা হবে!  

---
## SECTION C — Timecoded storyboard

Times are measured from the rendered timeline. From scene 02 on, each scene opens with a short chapter card (big number + title) before the narration starts.

### Scene ০১ — স্বাগতম  ·  00:00.0 → 00:31.6

- **Teaching objective:** Recall Lesson 01 and preview the eight ideas this lesson untangles.
- **Visual:** Instructor photo card left; right: lesson title and a 6-item roadmap that ticks in as named.
- **Camera:** Slow push-in (Ken Burns 1.00→1.06 on the photo).
- **Animation:** Title rises; roadmap items slide in from the right on the matching sentence.
- **On-screen text:** "লেসন ০২ · AI, Machine Learning, Deep Learning ও Generative AI" · "বড় ছবি: চারটি বৃত্ত" · "Machine Learning-এর ৩ ধরন" · "Neural Network ও Deep Learning" · "Generative AI ও LLM" · "ট্রেনিং ডেটা · টোকেন · ইনফারেন্স" · "সার্চ ইঞ্জিন বনাম AI অ্যাসিস্ট্যান্ট · অনুশীলন"
- **Transition in:** Fade from black, logo sting; previous scene fades out over 0.3 s.
- **Sound:** Logo sting; soft pop per roadmap item.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 00:01.2–00:03.9 | স্বাগতম PILLAR 01-এর দ্বিতীয় লেসনে। |
| 00:04.1–00:08.0 | আগের লেসনে আমরা জেনেছি AI কী, আর কীভাবে এটি ডেটা থেকে শেখে। |
| 00:08.2–00:19.8 | আজ আমরা আরেকটু গভীরে যাব — এমন কিছু শব্দ, যেগুলো শুনলেই অনেকের গুলিয়ে যায়: Artificial Intelligence, Machine Learning, Deep Learning, Neural Network, Generative AI আর Large Language Model। |
| 00:19.9–00:27.3 | সাথে বুঝব ট্রেনিং ডেটা, টোকেন আর ইনফারেন্স মানে কী, আর সার্চ ইঞ্জিন আর AI অ্যাসিস্ট্যান্টের মধ্যে পার্থক্য কোথায়। |
| 00:27.4–00:31.1 | শেষে থাকবে একটি হাতে-কলমে তুলনা আর আপনার জন্য অনুশীলন। |

### Scene ০২ — বড় ছবি: চারটি বৃত্ত  ·  00:31.6 → 01:22.9

- **Teaching objective:** Establish the nesting AI ⊃ ML ⊃ DL, with Generative AI mostly built on deep learning.
- **Visual:** Four nested rounded rings: AI (outer) → Machine Learning → Deep Learning → Generative AI (inner), each lighting up as defined; right-hand note card with the rule 'সব DL = ML, কিন্তু সব ML ≠ DL'.
- **Camera:** Slow push-in toward the centre ring as narration goes deeper.
- **Animation:** Rings scale in from outer to inner; labels fade up; rule card slides in last.
- **On-screen text:** "Artificial Intelligence" · "Machine Learning" · "Deep Learning" · "Generative AI" · "সব Deep Learning = Machine Learning, কিন্তু সব ML ≠ DL"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Soft whoosh per ring.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 00:33.0–00:39.0 | শুরুতে পুরো ছবিটা দেখে নিই। এই চারটি শব্দকে কল্পনা করুন, একটির ভেতরে আরেকটি বৃত্ত হিসেবে। |
| 00:39.1–00:46.0 | সবচেয়ে বড় বৃত্ত — Artificial Intelligence। কম্পিউটারকে দিয়ে বুদ্ধিমত্তার কাজ করানোর পুরো ক্ষেত্রটাই AI। |
| 00:46.1–00:57.3 | তার ভেতরে Machine Learning — AI তৈরির এমন একটি পদ্ধতি, যেখানে কম্পিউটার ডেটা থেকে নিজে শেখে। তাই হাতে নিয়ম লিখে বানানো একটি দাবা খেলার প্রোগ্রামও AI, কিন্তু সেটি Machine Learning নয়। |
| 00:57.4–01:02.8 | Machine Learning-এর ভেতরে Deep Learning — যেখানে অনেক স্তরের নিউরাল নেটওয়ার্ক ব্যবহার করে শেখা হয়। |
| 01:02.9–01:13.5 | আর Generative AI হলো এমন AI, যা নতুন কনটেন্ট তৈরি করতে পারে। আজকের বেশিরভাগ Generative AI, যেমন ChatGPT-এর মতো চ্যাটবট, Deep Learning-এর ওপর ভিত্তি করে তৈরি। |
| 01:13.6–01:22.4 | মনে রাখার সহজ উপায় — প্রতিটি ভেতরের বৃত্ত বাইরের বৃত্তের একটি অংশ। সব Deep Learning-ই Machine Learning, কিন্তু সব Machine Learning, Deep Learning নয়। |

### Scene ০৩ — Machine Learning  ·  01:22.9 → 02:18.5

- **Teaching objective:** Define ML and distinguish supervised, unsupervised and reinforcement learning with local examples.
- **Visual:** Header strip 'নিয়ম লেখা নয় — উদাহরণ থেকে শেখা'; three cards: Supervised (labelled emails ✓/✗), Unsupervised (customer dots forming clusters), Reinforcement (agent + reward star); footer 'শক্তি আসে ডেটা থেকে'.
- **Camera:** Static wide; gentle zoom on each card as it is explained.
- **Animation:** Cards rise in sequence; inside each, a tiny animation (labels flip, dots group, star pops).
- **On-screen text:** "Supervised: লেবেলসহ উদাহরণ" · "Unsupervised: লেবেল ছাড়া দল বানানো" · "Reinforcement: পুরস্কার ও শাস্তি" · "ডেটা যত ভালো, শেখা তত ভালো"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Pop per card.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 01:24.3–01:32.2 | এবার Machine Learning। সাধারণ প্রোগ্রামে আমরা নিয়ম লিখে দিই, আর Machine Learning-এ কম্পিউটার উদাহরণ দেখে নিজেই প্যাটার্ন শেখে। |
| 01:32.3–01:35.7 | Machine Learning-এর প্রধান তিনটি ধরন আছে। |
| 01:35.8–01:49.0 | প্রথম — Supervised Learning, বা তত্ত্বাবধানে শেখা। এখানে প্রতিটি উদাহরণের সাথে সঠিক উত্তর বা লেবেল দেওয়া থাকে। যেমন হাজারো ইমেইল, প্রতিটিতে লেখা স্প্যাম নাকি স্প্যাম নয় — দেখে দেখে মডেল নতুন ইমেইল চিনতে শেখে। |
| 01:49.1–02:01.7 | দ্বিতীয় — Unsupervised Learning। এখানে কোনো লেবেল থাকে না; মডেল নিজেই ডেটার মধ্যে মিল খুঁজে দল বানায়। যেমন, একটি অনলাইন দোকান কেনাকাটার ধরন দেখে কাস্টমারদের কয়েকটি দলে ভাগ করতে পারে। |
| 02:01.8–02:12.5 | তৃতীয় — Reinforcement Learning। এখানে মডেল চেষ্টা আর ভুলের মাধ্যমে শেখে — ভালো কাজে পুরস্কার, খারাপ কাজে শাস্তি। গেম খেলা বা রোবট নিয়ন্ত্রণ শেখাতে এই পদ্ধতি বেশ ব্যবহৃত হয়। |
| 02:12.6–02:18.0 | মূল কথা — Machine Learning-এর শক্তি আসে ডেটা থেকে। ডেটা যত ভালো, শেখাও তত ভালো। |

### Scene ০৪ — Neural Network ও Deep Learning  ·  02:18.5 → 03:20.6

- **Teaching objective:** Explain an artificial neural network (layers, weights, training) and why many layers = deep learning.
- **Visual:** Animated network diagram: input layer (pixels) → two hidden layers → output ('বিড়াল'); one connection labelled 'weight'; a feature strip below: রেখা ও কোণ → চোখ, কান → পুরো মুখ; side note 'মস্তিষ্কের হুবহু নকল নয় — সরল গাণিতিক মডেল'.
- **Camera:** Slow lateral move left→right following the signal through the layers.
- **Animation:** Nodes pop layer by layer; connection lines draw; signal pulses travel; weight label wiggles during 'training'; feature strip fills left→right.
- **On-screen text:** "ইনপুট স্তর" · "লুকানো স্তর" · "আউটপুট স্তর" · "weight (ওজন)" · "অনেক স্তর = Deep" · "রেখা → চোখ/কান → মুখ"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Soft electric ticks as pulses travel.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 02:19.9–02:23.7 | এবার Deep Learning আর Artificial Neural Network। |
| 02:23.8–02:35.5 | Artificial Neural Network বা কৃত্রিম নিউরাল নেটওয়ার্কের ধারণা এসেছে মানুষের মস্তিষ্কের নিউরন থেকে। তবে এটি মস্তিষ্কের হুবহু নকল নয়, বরং অনেক সরল একটি গাণিতিক মডেল। |
| 02:35.6–02:49.8 | একটি নিউরাল নেটওয়ার্কে থাকে কয়েকটি স্তর। ইনপুট স্তরে ডেটা ঢোকে — যেমন একটি ছবির পিক্সেল। মাঝের লুকানো স্তরগুলো ধাপে ধাপে প্যাটার্ন খোঁজে। আর আউটপুট স্তর ফলাফল দেয় — যেমন, এটি একটি বিড়ালের ছবি। |
| 02:50.0–02:59.3 | প্রতিটি সংযোগের একটি ওজন বা weight থাকে। ট্রেনিংয়ের সময় মডেল নিজের ভুল দেখে এই ওজনগুলো একটু একটু করে ঠিক করে, যতক্ষণ না উত্তর ভালো হয়। |
| 02:59.4–03:06.4 | যখন এই মাঝের স্তর অনেকগুলো হয়, তখন তাকে বলে Deep Learning। deep মানে গভীর — অর্থাৎ অনেক স্তর। |
| 03:06.5–03:13.5 | প্রথম দিকের স্তর হয়তো শুধু রেখা আর কোণ চেনে, পরের স্তর চোখ বা কান, আর শেষের দিকের স্তর পুরো মুখ। |
| 03:13.6–03:20.1 | ছবি চেনা, বাংলা ভয়েস টাইপিং, অনুবাদ — আজকের এসব প্রযুক্তির বড় অংশ Deep Learning-এর ওপর চলে। |

### Scene ০৫ — Generative AI  ·  03:20.6 → 04:13.9

- **Teaching objective:** Contrast recognising/classifying AI with AI that generates new content; flag accuracy and copyright caveats.
- **Visual:** Left card 'চেনা ও বাছাই' (spam? mango/jackfruit?) vs right card 'নতুন তৈরি'; five output chips: লেখা · ছবি · অডিও · ভিডিও · কোড; amber banner 'নতুন মানেই সঠিক নয় · কপিরাইট ও নৈতিকতা → লেসন ০৬'.
- **Camera:** Static; slight push toward the right card.
- **Animation:** Left card in, then right card with sparkle; chips pop one by one on their words; banner rises last.
- **On-screen text:** "চেনা ও বাছাই" · "নতুন কনটেন্ট তৈরি" · "লেখা" · "ছবি" · "অডিও" · "ভিডিও" · "কোড" · "নতুন মানেই সঠিক নয়"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Sparkle on 'তৈরি'; pop per chip.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 03:22.0–03:26.5 | এবার Generative AI — আজ যেটি নিয়ে সবচেয়ে বেশি আলোচনা। |
| 03:26.6–03:36.7 | আগের অনেক AI কাজ করত চেনা বা বাছাই করার জন্য — যেমন, এটা স্প্যাম কি না, কিংবা এটা আম না কাঁঠাল। এগুলো বিদ্যমান তথ্য দেখে সিদ্ধান্ত দেয়। |
| 03:36.8–03:42.9 | Generative AI এক ধাপ এগিয়ে নতুন কনটেন্ট তৈরি করে — যা আগে হুবহু ছিল না। |
| 03:43.1–04:01.5 | লেখা — যেমন ইমেইল, রিপোর্ট বা গল্প। ছবি — বর্ণনা দিলেই নতুন ছবি। অডিও — কৃত্রিম কণ্ঠ বা মিউজিক। ভিডিও — ছোট ক্লিপ। আর কোড — প্রোগ্রামের অংশ। আগের লেসনে ChatGPT-তে প্রম্পট লিখে যে উত্তর পেয়েছিলেন, সেটিও Generative AI-এর একটি উদাহরণ। |
| 04:01.6–04:13.4 | তবে নতুন তৈরি মানেই সঠিক বা নিরাপদ নয়। Generative AI ভুল তথ্য বানাতে পারে, আর এর তৈরি কনটেন্টের কপিরাইট ও নৈতিকতা নিয়েও প্রশ্ন আছে — যা আমরা ষষ্ঠ লেসনে বিস্তারিত দেখব। |

### Scene ০৬ — Large Language Model (LLM)  ·  04:13.9 → 05:08.3

- **Teaching objective:** Define an LLM, how it is built (pre-training, fine-tuning/feedback) and why it can be confidently wrong.
- **Visual:** Definition card; assistant chips 'ChatGPT · Gemini · Claude' with 'পেছনে LLM' arrow; two-step flow: ১ প্রি-ট্রেনিং (book/web icons) → ২ ফাইন-টিউনিং (checklist + people-feedback icon); amber note 'তথ্যভান্ডার নয় — প্যাটার্ন থেকে তৈরি'.
- **Camera:** Static; push-in on the two-step flow.
- **Animation:** Definition types in; chips slide; step boxes rise with arrow draw; note pulses once.
- **On-screen text:** "LLM = বিপুল লেখায় ট্রেনিং পাওয়া বড় নিউরাল নেটওয়ার্ক" · "ChatGPT · Gemini · Claude" · "১ প্রি-ট্রেনিং" · "২ ফাইন-টিউনিং ও ফিডব্যাক" · "তথ্যভান্ডার নয়"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Click per step.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 04:15.3–04:20.6 | Generative AI-এর সবচেয়ে পরিচিত রূপ হলো Large Language Model, সংক্ষেপে LLM। |
| 04:20.7–04:29.6 | LLM হলো বিপুল পরিমাণ লেখা দিয়ে ট্রেনিং দেওয়া একটি বড় নিউরাল নেটওয়ার্ক, যা ভাষা বুঝে প্রশ্নের উত্তর দিতে আর নতুন লেখা তৈরি করতে পারে। |
| 04:29.7–04:36.6 | ChatGPT, Google Gemini বা Claude-এর মতো AI অ্যাসিস্ট্যান্টের পেছনে মূল ইঞ্জিন হিসেবে কাজ করে এমন LLM। |
| 04:36.7–04:39.3 | একটি LLM সাধারণত দুই ধাপে তৈরি হয়। |
| 04:39.4–04:44.4 | প্রথম ধাপে প্রি-ট্রেনিং — বই, ওয়েবসাইট আর নানা লেখা থেকে মডেল শেখে, কোন শব্দের পরে কোন শব্দ আসার সম্ভাবনা বেশি। |
| 04:44.5–04:58.2 | দ্বিতীয় ধাপে ফাইন-টিউনিং — নির্দেশনা মানা, প্রশ্নের কাজের উত্তর দেওয়া, আর ক্ষতিকর অনুরোধ এড়ানো শেখানো হয়। অনেক ক্ষেত্রে মানুষের মূল্যায়ন বা ফিডব্যাক দিয়েও উত্তর উন্নত করা হয়। |
| 04:58.3–05:07.8 | মনে রাখবেন, LLM কোনো তথ্যভান্ডার থেকে উত্তর খুঁজে আনে না। শেখা প্যাটার্ন থেকে সম্ভাব্য উত্তর তৈরি করে — এজন্যই মাঝে মাঝে আত্মবিশ্বাসের সাথে ভুলও বলে। |

### Scene ০৭ — ট্রেনিং ডেটা  ·  05:08.3 → 06:02.1

- **Teaching objective:** Show why training data quality, bias, cut-off and language coverage shape AI behaviour.
- **Visual:** Left card 'ট্রেনিং ডেটা = শেখার উদাহরণ' with icons (লেখা, ছবি, শব্দ, সংখ্যা); right: four rows — Garbage in, garbage out · পক্ষপাত (Bias) · সময়সীমা (Cut-off) · বাংলা ডেটা কম.
- **Camera:** Static; gentle zoom on each row.
- **Animation:** Icons pop; rows slide in from the right on their sentence.
- **On-screen text:** "ট্রেনিং ডেটা = শেখার উদাহরণ" · "Garbage in, garbage out" · "পক্ষপাত (Bias)" · "সময়সীমা (Cut-off)" · "বাংলা ডেটা তুলনামূলক কম"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Neutral whoosh; low tone on 'পক্ষপাত'.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 05:09.7–05:13.1 | AI-এর মান অনেকটাই নির্ভর করে তার ট্রেনিং ডেটার ওপর। |
| 05:13.2–05:27.3 | ট্রেনিং ডেটা হলো সেই সব উদাহরণ, যা দেখে মডেল শেখে — লেখা, ছবি, শব্দ, কিংবা টেবিলের সংখ্যা। যেমন, বাংলা হাতের লেখা চেনার মডেল বানাতে হাজারো মানুষের হাতের লেখার ছবি লাগে, প্রতিটির সাথে সঠিক অক্ষরের লেবেল। |
| 05:27.4–05:34.0 | ইংরেজিতে একটা কথা আছে — garbage in, garbage out। ভুল বা নিম্নমানের ডেটা দিলে ফলাফলও খারাপ হয়। |
| 05:34.2–05:43.3 | ডেটায় পক্ষপাত থাকলে মডেলও পক্ষপাতী হয়। যেমন, কোনো ছবি চেনার মডেল যদি শুধু এক ধরনের মানুষের ছবিতে শেখে, অন্যদের ক্ষেত্রে সে বেশি ভুল করতে পারে। |
| 05:43.4–05:52.3 | ডেটার সময়সীমাও গুরুত্বপূর্ণ। ট্রেনিংয়ের পরে যা ঘটেছে, তা মডেল নিজে থেকে জানে না — এজন্য কিছু অ্যাসিস্ট্যান্ট আলাদা করে ওয়েব সার্চের সুবিধা ব্যবহার করে। |
| 05:52.4–06:01.6 | আর বাংলার মতো ভাষায় ইংরেজির তুলনায় অনলাইনে ডেটা কম, তাই অনেক মডেল বাংলায় তুলনামূলক কম দক্ষ হতে পারে — যদিও এই অবস্থা দ্রুত উন্নত হচ্ছে। |

### Scene ০৮ — টোকেন ও ইনফারেন্স  ·  06:02.1 → 07:02.0

- **Teaching objective:** Explain tokens, context windows and token-based cost, and inference versus training.
- **Visual:** Two sentences split into coloured token chips (English: fewer chips; Bangla: more chips), labelled 'উদাহরণ — আসল ভাঙন মডেলভেদে আলাদা'; a context-window bar filling up; bottom comparison: ট্রেনিং (একবার, অনেক সময় ও খরচ) vs ইনফারেন্স (প্রতিবার প্রশ্নে).
- **Camera:** Static; zoom on token rows.
- **Animation:** Sentences split into chips with a slicing motion; window bar fills; inference card shows tokens appearing one by one.
- **On-screen text:** "টোকেন = লেখার ছোট টুকরো" · "ইংরেজি: গড়ে ~৪ অক্ষর ≈ ১ টোকেন (OpenAI-এর মোটা হিসাব)" · "কনটেক্সট উইন্ডো" · "ট্রেনিং: একবার" · "ইনফারেন্স: প্রতিবার"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Small 'snip' per token chip.
- **Screen-recording shot (optional):** a 10-second insert of OpenAI's official Tokenizer page counting the same English and Bangla sentences (Section E, part 2), placed over the top token card.

| Time | Voiceover (spoken) |
|---|---|
| 06:03.5–06:06.9 | এবার দুটি গুরুত্বপূর্ণ শব্দ — টোকেন আর ইনফারেন্স। |
| 06:07.0–06:16.8 | LLM সরাসরি পুরো শব্দ বা বাক্য পড়ে না। লেখাকে সে ছোট ছোট টুকরোয় ভাঙে — এগুলোকে বলে টোকেন। একটি টোকেন হতে পারে একটি পুরো শব্দ, শব্দের অংশ, এমনকি একটি চিহ্ন। |
| 06:17.0–06:27.8 | OpenAI-এর দেওয়া একটি মোটা হিসাবে, ইংরেজিতে গড়ে প্রায় চার অক্ষরে এক টোকেন হয়। আর বাংলার মতো অনেক ভাষায় একই কথা বলতে সাধারণত বেশি টোকেন লাগে। |
| 06:28.0–06:38.1 | টোকেন কেন জানা দরকার? কারণ প্রতিটি মডেল একবারে নির্দিষ্ট পরিমাণ টোকেনই মাথায় রাখতে পারে — একে বলে কনটেক্সট উইন্ডো। আর অনেক পেইড সার্ভিসে খরচও হয় টোকেনের হিসাবে। |
| 06:38.3–06:49.0 | আর ইনফারেন্স মানে হলো ট্রেনিং শেষ হওয়া মডেলকে ব্যবহার করে উত্তর তৈরি করা। আপনি যখন প্রশ্ন পাঠান, মডেল একটার পর একটা টোকেন অনুমান করে উত্তর গড়ে তোলে — এটাই ইনফারেন্স। |
| 06:49.1–06:53.6 | ট্রেনিং হয় একবার, অনেক সময় আর খরচে। আর ইনফারেন্স ঘটে প্রতিবার, যখনই কেউ প্রশ্ন করে। |
| 06:53.8–07:01.5 | আর যেহেতু প্রতিবার সম্ভাবনা থেকে টোকেন বাছাই হয়, তাই একই প্রশ্নে প্রতিবার হুবহু একই উত্তর না-ও আসতে পারে। |

### Scene ০৯ — সার্চ ইঞ্জিন বনাম AI অ্যাসিস্ট্যান্ট  ·  07:02.0 → 08:23.4

- **Teaching objective:** Compare search engines and generative assistants and decide which to use for which question.
- **Visual:** Two browser-style panels side by side, both labelled 'প্রতীকী চিত্র — আসল স্ক্রিনশট নয়': left 'সার্চ ইঞ্জিন' shows a list of three link results; right 'AI অ্যাসিস্ট্যান্ট' shows a single composed answer bubble. Under each: strengths (green) and weaknesses (amber). Bottom: two example questions with the recommended tool tag.
- **Camera:** Static wide; slight push on each panel in turn.
- **Animation:** Link rows drop in; answer bubble writes in; strength/weakness chips pop; example tags stamp in.
- **On-screen text:** "সার্চ ইঞ্জিন: ওয়েবপেজ + লিংক" · "AI অ্যাসিস্ট্যান্ট: গোছানো উত্তর" · "সাম্প্রতিক ও অফিশিয়াল তথ্য → সার্চ + অফিশিয়াল সাইট" · "ব্যাখ্যা ও খসড়া → AI অ্যাসিস্ট্যান্ট (যাচাইসহ)"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Click per link row; soft notification for the answer.
- **Screen-recording shot:** replace the two illustrated panels with the real side-by-side capture from Section E (Google Search on the left, ChatGPT or Gemini on the right). Keep the pros/cons, rule and example cards below. If you use the real capture, remove the "প্রতীকী চিত্র" labels.

| Time | Voiceover (spoken) |
|---|---|
| 07:03.4–07:10.4 | এবার একটি বাস্তব প্রশ্ন — Google-এর মতো সার্চ ইঞ্জিন আর ChatGPT-এর মতো AI অ্যাসিস্ট্যান্টের মধ্যে পার্থক্য কী? |
| 07:10.5–07:20.8 | সার্চ ইঞ্জিন ইন্টারনেটে আগে থেকে থাকা ওয়েবপেজ খুঁজে দেয়, আর আপনাকে লিংকের তালিকা দেখায়। কোন উৎস বিশ্বাসযোগ্য, তা বাছাই করে পড়ার দায়িত্ব আপনার। |
| 07:20.9–07:28.9 | AI অ্যাসিস্ট্যান্ট নিজের শেখা প্যাটার্ন থেকে সরাসরি একটি গোছানো উত্তর লিখে দেয়। আপনি চাইলে একই আলোচনায় ফলো-আপ প্রশ্নও করতে পারেন। |
| 07:29.1–07:39.3 | সার্চ ইঞ্জিনের শক্তি — সাম্প্রতিক তথ্য, আসল উৎসের লিংক, আর অফিশিয়াল ওয়েবসাইট খুঁজে পাওয়া। দুর্বলতা — অনেক লিংক ঘেঁটে নিজেকেই উত্তর জোড়া দিতে হয়। |
| 07:39.4–07:50.4 | AI অ্যাসিস্ট্যান্টের শক্তি — ব্যাখ্যা, সারসংক্ষেপ, লেখার খসড়া আর ধাপে ধাপে বুঝিয়ে দেওয়া। দুর্বলতা — ভুল তথ্য বানাতে পারে, আর অনেক সময় উৎস দেখায় না। |
| 07:50.5–08:02.6 | এখন অনেক অ্যাসিস্ট্যান্ট ওয়েব সার্চ করে উৎসের লিংকও দেখায়, আর অনেক সার্চ ইঞ্জিনেও AI-তৈরি সারাংশ আসে। তবুও নিয়মটা একই — গুরুত্বপূর্ণ তথ্যের জন্য আসল উৎস খুলে মিলিয়ে নিন। |
| 08:02.7–08:13.2 | একটি উদাহরণ দেখি — প্রশ্ন: এসএসসি পরীক্ষার ফলাফল কবে প্রকাশ হবে? এমন সাম্প্রতিক আর অফিশিয়াল তথ্যের জন্য সার্চ ইঞ্জিনে খুঁজে শিক্ষা বোর্ডের অফিশিয়াল ওয়েবসাইটই ভরসা। |
| 08:13.4–08:22.9 | আর প্রশ্ন যদি হয় — সালোকসংশ্লেষণ সহজ বাংলায় বুঝিয়ে দিন, তাহলে AI অ্যাসিস্ট্যান্ট দারুণ কাজে আসে। তবে পরীক্ষার আগে পাঠ্যবইয়ের সাথে মিলিয়ে নিন। |

### Scene ১০ — আপনার অনুশীলন  ·  08:23.4 → 09:16.9

- **Teaching objective:** Practise the comparison and the four-circle classification.
- **Visual:** Left: comparison worksheet (3 question rows × columns নির্ভুলতা · উৎস · সাম্প্রতিক · সহজবোধ্য, for Search vs AI). Right: six example cards to classify (স্প্যাম ফিল্টার, ফোনের ফেস আনলক, ChatGPT দিয়ে ইমেইল, হাতে লেখা নিয়মের দাবা প্রোগ্রাম, কাস্টমারদের দলে ভাগ, বর্ণনা থেকে ছবি) each with a '?' badge.
- **Camera:** Slow push-in.
- **Animation:** Table rows draw in; example cards flip in one by one.
- **On-screen text:** "অংশ ১: Search বনাম AI — ৩টি প্রশ্ন" · "অংশ ২: কোন বৃত্তে? (সবচেয়ে ভেতরের)"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Paper rustle; pop per card.
- **Screen-recording shot (optional):** a 5–8 s glimpse of the learner typing question 1 into Google and into ChatGPT/Gemini (from the Section E capture).

| Time | Voiceover (spoken) |
|---|---|
| 08:24.8–08:27.2 | এবার আপনার অনুশীলন — দুটি অংশে। |
| 08:27.3–08:41.9 | প্রথম অংশ — একই তিনটি প্রশ্ন একবার Google সার্চে, আরেকবার ChatGPT বা Gemini-তে করুন। যেমন — বাংলাদেশের জাতীয় ফলের নাম কী, ইমেইল লেখার সময় কোন পাঁচটি বিষয় খেয়াল রাখবেন, আর এই সপ্তাহে ঢাকার আবহাওয়া কেমন থাকবে। |
| 08:42.0–08:48.2 | প্রতিটির জন্য একটি টেবিলে লিখুন — কোনটির উত্তর বেশি নির্ভুল, কোনটি উৎস দেখিয়েছে, কোনটি সাম্প্রতিক, আর কোনটি বুঝতে সহজ। |
| 08:48.3–09:00.3 | দ্বিতীয় অংশ — স্ক্রিনের ছয়টি উদাহরণ দেখুন: স্প্যাম ফিল্টার, ফোনের ফেস আনলক, ChatGPT দিয়ে ইমেইল লেখা, হাতে লেখা নিয়মের দাবা প্রোগ্রাম, কাস্টমারদের দলে ভাগ করা, আর বর্ণনা থেকে ছবি তৈরি। |
| 09:00.4–09:11.2 | প্রতিটি উদাহরণ চারটি বৃত্তের সবচেয়ে ভেতরের কোনটিতে পড়ে — AI, Machine Learning, Deep Learning নাকি Generative AI — লিখুন, আর এক লাইনে কারণ দিন। |
| 09:11.4–09:16.4 | আপনার টেবিল আর উত্তরগুলো একটি ডকুমেন্টে লিখে সংরক্ষণ করুন — পরের লেসনগুলোতেও কাজে লাগবে। |

### Scene ১১ — সারসংক্ষেপ  ·  09:16.9 → 09:59.5

- **Teaching objective:** Consolidate and preview Lesson 03 (tools and platforms).
- **Visual:** Instructor photo returns; checklist of six ideas ticks green; next-lesson card: লেখা · ছবি · ভিডিও · অডিও · কোডিং টুল · সঠিক টুল বাছাই.
- **Camera:** Slow pull-back to the end frame.
- **Animation:** Checks tick in sequence; next card slides in; end card.
- **On-screen text:** "✓ চারটি বৃত্ত" · "✓ ML-এর ৩ ধরন" · "✓ Neural Network ও Deep Learning" · "✓ Generative AI ও LLM" · "✓ ট্রেনিং ডেটা · টোকেন · ইনফারেন্স" · "✓ সার্চ বনাম AI অ্যাসিস্ট্যান্ট" · "পরের লেসন: প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম"
- **Transition in:** Cyan-purple chapter card (number scales in, title rises, underline draws) → card fades to the scene; previous scene fades out over 0.3 s.
- **Sound:** Success chime; music swells and fades.
- **Screen-recording shot:** none (animated scene).

| Time | Voiceover (spoken) |
|---|---|
| 09:18.3–09:24.4 | আজ আমরা দেখলাম — AI, Machine Learning, Deep Learning আর Generative AI একটির ভেতরে আরেকটি। |
| 09:24.6–09:31.2 | শিখলাম নিউরাল নেটওয়ার্ক কীভাবে স্তরে স্তরে শেখে, LLM কী, আর ট্রেনিং ডেটা কেন এত গুরুত্বপূর্ণ। |
| 09:31.3–09:37.7 | জানলাম টোকেন আর ইনফারেন্স মানে কী, আর কখন সার্চ ইঞ্জিন আর কখন AI অ্যাসিস্ট্যান্ট ব্যবহার করবেন। |
| 09:37.9–09:46.8 | পরের লেসনে আমরা দেখব প্রয়োজনীয় AI টুলগুলো — লেখা, ছবি, ভিডিও, অডিও আর কোডিংয়ের জন্য — আর কীভাবে সঠিক টুল বেছে নেবেন। |
| 09:46.9–09:53.1 | মনে রাখবেন, AI একটি শক্তিশালী সহকারী, কিন্তু যাচাই আর শেষ সিদ্ধান্তের দায়িত্ব সবসময় আপনার। |
| 09:53.2–09:56.5 | অনুশীলনটি শেষ করে চলে আসুন পরের লেসনে। দেখা হবে! |

---
## SECTION D — Animation prompts (AI video generation, optional B-roll / upgrades)

**Shared style for every prompt:** "16:9, 1920×1080, 30 fps, premium 2.5D/3D educational motion graphics, deep navy (#060b1f) background with a subtle cyan grid, electric cyan (#22e3ff) and soft purple (#8b5cf6) accents, glassmorphism panels with soft inner glow, clean geometric shapes, calm confident camera moves, no on-screen text (text is added in edit), no logos, no real people." Keep prompts in English for the generators. Burn Bangla text in the edit, because generators misspell Bangla.

**০১ · স্বাগতম (00:00.0–00:31.6):** Slow push-in through a calm futuristic learning studio: six floating glass tiles assemble into a path and light up cyan one by one; gentle particles and soft volumetric light, welcoming and uncluttered.

**০২ · বড় ছবি: চারটি বৃত্ত (00:31.6–01:22.9):** Four translucent concentric glass rings float in dark space, largest cyan, then purple, magenta and a small glowing amber core; each ring scales in from the outside inward and glows as it lands; slow push-in toward the amber core.

**০৩ · Machine Learning (01:22.9–02:18.5):** Three glass panels side by side. Left: small envelope cards sliding in and receiving red or green tags. Centre: a cloud of grey dots drifting and gathering into three coloured clusters. Right: a small friendly robot cube moving and receiving a green star, then a red cross. Static camera with subtle parallax.

**০৪ · Neural Network ও Deep Learning (02:18.5–03:20.6):** A clean 3D neural network: a column of input nodes, two hidden columns, two output nodes, all joined by thin glowing lines; pulses of light travel left to right layer by layer; one connection thickens and glows amber as if being tuned; slow lateral camera move along the signal.

**০৫ · Generative AI (03:20.6–04:13.9):** Left: a calm sorting machine places items into two bins. Right: a glowing amber spark bursts into five floating cards (a page of text, a picture frame, a sound wave, a film strip, code brackets) arranged in a row; light sparkles; slight push toward the right.

**০৬ · Large Language Model (LLM) (04:13.9–05:08.3):** A vast library of floating pages streams into a large crystalline neural core (pre-training), then a second stage where small human-hand icons place check marks on output cards that feed back into the core (fine-tuning with feedback); calm push-in.

**০৭ · ট্রেনিং ডেটা (05:08.3–06:02.1):** A conveyor of example cards (text, images, sound waves, numbers) flows into a model core. Some cards are cracked and grey and come out as cracked results; a balance scale tips to one side; an hourglass marks a cut-off line. Steady camera, gentle zoom on each idea.

**০৮ · টোকেন ও ইনফারেন্স (06:02.1–07:02.0):** A sentence of light breaks into coloured chip-shaped pieces with a gentle slicing motion; a horizontal window bar fills up with chips; chips then appear one after another to build a reply. Close, clean macro framing.

**০৯ · সার্চ ইঞ্জিন বনাম AI অ্যাসিস্ট্যান্ট (07:02.0–08:23.4):** Two floating glass browser-like panels with no brand and no readable text: the left shows three stacked link rows dropping in, the right shows one long answer bubble writing itself; small green and amber badges appear under each; static wide shot.

**১০ · আপনার অনুশীলন (08:23.4–09:16.9):** A glass worksheet table assembles row by row on a dark desk while six small cards flip in on the right, each with an amber question badge; slow push-in.

**১১ · সারসংক্ষেপ (09:16.9–09:59.5):** Six green check marks light up in a vertical list, then the camera pulls back to reveal a glowing doorway suggesting the next lesson; music swell, gentle fade to the course end card.

---
## SECTION E — Screen recording guide

### Part 1 · Search engine vs AI assistant (replaces scene 09's two panels)

**Why this is needed:** scene 09 currently uses labelled illustrations. A real side-by-side capture from your own computer is more authentic, and the brief requires it wherever possible.

**Applications:** Google Search at `https://www.google.com`, and either ChatGPT at `https://chatgpt.com` (official OpenAI site) or Google Gemini at `https://gemini.google.com` (official Google site), in Chrome or Edge on a computer. Interfaces change often, so check what you see on recording day, and say only what appears on your screen.

**Before recording (privacy and setup):**
- Use a separate browser profile with no other tabs, bookmarks or extensions visible.
- Sign in to ChatGPT/Gemini before you start recording. Never record the password step.
- Hide or blur your name, email and profile picture, and any earlier chats in the sidebar. Start a new, empty chat.
- Google results depend on your location and account. Use a signed-out or clean profile so personal suggestions don't appear.
- Snap the two windows side by side (Windows: Win + ← / Win + →; macOS: hover the green button → tile), at 110–125% browser zoom.
- Recorder: OBS Studio (free) or the built-in Windows/macOS recorder, 1920×1080, 30 fps, cursor visible.
- Don't type anything personal.

**Shot list (matches scene 09 narration):**

| # | Action on screen | Narration at that moment | Highlight / zoom |
|---|---|---|---|
| 1 | Show both windows side by side: Google on the left, ChatGPT/Gemini on the right. | "…সার্চ ইঞ্জিন আর… AI অ্যাসিস্ট্যান্টের মধ্যে পার্থক্য কী?" | Label the panels 'সার্চ ইঞ্জিন' / 'AI অ্যাসিস্ট্যান্ট'. |
| 2 | In Google, type `সালোকসংশ্লেষণ কী` and press Enter; scroll slowly over the result links. | "সার্চ ইঞ্জিন… লিংকের তালিকা দেখায়।" | Box the list of links for 2 s. |
| 3 | In the assistant, type `সালোকসংশ্লেষণ কী, সহজ বাংলায় বলুন` and send. Let the full answer appear. | "AI অ্যাসিস্ট্যান্ট… একটি গোছানো উত্তর লিখে দেয়।" | Zoom 115% on the answer. |
| 4 | Type the follow-up `আরেকটু উদাহরণ দিন` and send. | "…ফলো-আপ প্রশ্নও করতে পারেন।" | Highlight the follow-up bubble. |
| 5 | Hover over Google's result URLs (domain names). | Strengths/weaknesses of search. | Green underline on a .gov.bd or textbook-board domain if one appears. |
| 6 | Point at the assistant's answer; if it shows sources/links, hover them; if not, point out that none are shown. | Strengths/weaknesses of the assistant. | Amber note: 'উৎস দেখাচ্ছে কি?' |
| 7 | If an AI-generated summary appears at the top of Google, or the assistant offers web search, point at it. Skip this step if neither appears; don't stage it. | "এখন অনেক অ্যাসিস্ট্যান্ট ওয়েব সার্চ করে…" | Purple 'AI সারাংশ' tag. |
| 8 | In Google, search `এসএসসি পরীক্ষার ফলাফল` and open the official education board result site from the results (check the domain ends in .gov.bd or is the board's published result portal). | SSC result example. | Zoom on the address bar showing the official domain. |

**Prompts to type (exactly):**

```
সালোকসংশ্লেষণ কী, সহজ বাংলায় বলুন
```
```
আরেকটু উদাহরণ দিন
```

**Expected response (what to look for, not a fixed text):** Google shows a page of links (encyclopedia, textbook or education sites, videos), sometimes with a summary box. The assistant writes a short Bangla explanation: plants use sunlight, water and carbon dioxide to make food (glucose) and release oxygen, with a simple everyday example. Wording varies every time.

**What to explain during each click:** search engines find existing pages and you judge the source. Assistants compose an answer from learned patterns and can continue the conversation. For recent or official information (results, dates, prices, rules), go to the official source. For explanations and drafts, assistants are useful, but check them against the textbook.

### Part 2 (optional) · Real token counts (insert for scene 08)

Open OpenAI's official Tokenizer page (`https://platform.openai.com/tokenizer`). Paste `I love learning AI`, then `আমি AI শিখতে ভালোবাসি`, and record the token and character counts the page shows. Read out the real numbers from your screen. They will differ from the illustrative chips in the video, which is the point: each model's tokenizer splits text its own way. If the page layout has changed, record whatever official token-count tool OpenAI currently links from its help article on tokens.

**Common errors and troubleshooting:**

| Problem | Fix |
|---|---|
| Assistant answers in English | Add "বাংলায় উত্তর দিন" or send it as a follow-up. |
| Google results show personalised or local ads | Use a clean/signed-out profile; scroll past ads and say they are ads. |
| Assistant says it can't browse or doesn't know recent events | That's the knowledge cut-off from scene 07. Use it as a teaching moment and don't hide it. |
| SSC result date isn't announced yet | Show the official board site anyway, and say the date will be published there. Never quote a date from an AI answer. |
| Free plan limits / model notices | Plans and limits change. Don't quote them in the video; check the official pricing page if needed. |
| Look-alike 'AI' apps or sites | Use only chatgpt.com / the OpenAI app, or gemini.google.com / the Google app. |

**Privacy precautions (say them on camera too):** never enter passwords, NID numbers, bank/mobile-banking details, exam roll/registration numbers, customer data or confidential documents. Blur personal details before publishing.

---
## SECTION F — Student activities

### Part 1 · Search engine vs AI assistant comparison

**Instructions (step by step):**
1. Open Google Search in one tab and ChatGPT or Gemini in another.
2. Ask the same three questions in both: (a) বাংলাদেশের জাতীয় ফলের নাম কী? (b) ইমেইল লেখার সময় কোন পাঁচটি বিষয় খেয়াল রাখবেন? (c) এই সপ্তাহে ঢাকার আবহাওয়া কেমন থাকবে?
3. For each question, record in the table who did better (S = Search, AI = Assistant, or 'equal') on four criteria: accuracy, showed a source, up to date, easy to understand.
4. Check at least one fact per question at an original source (for example the Bangladesh Meteorological Department for weather).
5. Write one sentence: which tool you'd use for which kind of question, and why.

### Part 2 · Which circle?

For each of the six examples, write the innermost circle it belongs to (AI, Machine Learning, Deep Learning or Generative AI) and a one-line reason.

**Expected deliverable:** one 3×4 comparison table with a one-sentence conclusion, plus a six-row classification list with reasons. Submit as a Google Doc, spreadsheet or a photo of handwritten work.

**Self-assessment checklist:**
- [ ] তিনটি প্রশ্নই দুই জায়গায় করেছি?
- [ ] প্রতিটি প্রশ্নে অন্তত একটি তথ্য আসল উৎস থেকে যাচাই করেছি?
- [ ] আবহাওয়ার মতো সাম্প্রতিক প্রশ্নে কোনটি ভালো করেছে, তার কারণ লিখেছি?
- [ ] ছয়টি উদাহরণের প্রতিটিতে সবচেয়ে ভেতরের বৃত্ত আর কারণ লিখেছি?
- [ ] কোনো ব্যক্তিগত তথ্য শেয়ার করিনি?

**Common mistakes:** saying the AI 'searched' when it answered from memory · judging accuracy without checking any source · writing only 'AI' for every example instead of the innermost circle · putting the rule-based chess program in Machine Learning · treating a fluent answer as a verified one.

**Model answer — Part 1 (typical, results vary by day and tool):**

| Question | Accuracy | Source shown | Up to date | Easy to understand |
|---|---|---|---|---|
| জাতীয় ফল (কাঁঠাল) | Equal: both say jackfruit (কাঁঠাল) | S (links); AI only if it used web search | Equal (fact doesn't change) | AI (one direct sentence) |
| ইমেইলের ৫টি বিষয় | Equal / AI (well-organised list) | S | Equal | AI (structured, can be customised in a follow-up) |
| ঢাকার এই সপ্তাহের আবহাওয়া | S (forecast sites / BMD) | S | S, unless the assistant used live web search | Equal |

*Conclusion example:* "সাম্প্রতিক বা অফিশিয়াল তথ্যের জন্য সার্চ ইঞ্জিন আর আসল উৎস; কোনো বিষয় বুঝতে বা লেখার খসড়ার জন্য AI অ্যাসিস্ট্যান্ট — তবে যাচাই করে।"

**Model answer — Part 2:**

| Example | Innermost circle | Reason |
|---|---|---|
| স্প্যাম ফিল্টার | Machine Learning | Learns from labelled spam / not-spam emails (supervised). Modern filters may also use deep learning, and 'Deep Learning' is accepted with that reason. |
| ফোনের ফেস আনলক | Deep Learning | Face recognition in modern phones uses deep neural networks trained on images. |
| ChatGPT দিয়ে ইমেইল লেখা | Generative AI | An LLM generates new text. |
| হাতে লেখা নিয়মের দাবা প্রোগ্রাম | AI (not ML) | Follows rules written by programmers; it doesn't learn from data. |
| কাস্টমারদের দলে ভাগ করা | Machine Learning | Unsupervised learning (clustering) groups customers without labels. |
| বর্ণনা থেকে ছবি তৈরি | Generative AI | Creates a new image from a text prompt (deep-learning-based image generator). |

**Evaluation rubric (20 points):**

| Criterion | 4–5 Excellent | 2–3 Developing | 0–1 Needs work |
|---|---|---|---|
| Comparison completeness (5) | All 3 questions × 4 criteria filled with reasons | Some cells missing or unexplained | Mostly empty |
| Verification (5) | Original source noted for each question | Some verified | No verification |
| Classification accuracy (5) | 5–6 correct, innermost circle with a sound reason | 3–4 correct | 0–2 correct or no reasons |
| Conclusion & safety (5) | Clear rule for when to use which tool; no personal data | Vague conclusion | Missing / unsafe |

---
## SECTION G — Video post-production

**Subtitles:** `pillar01-lesson02.bn.srt`, 182 cues, at most about 66 characters (2 lines) each, timed to the narration. They're burned into the video (Hind Siliguri Bold 42 px, white on 84% navy, cyan for English terms and numbers) and also supplied as an SRT for YouTube/Facebook closed captions.

**Voiceover pacing (measured per take):**

| Scene | Model | Duration | Pace (chars/s) | Script match |
|---|---|---|---|---|
| s01_c0 | gemini-3.8-flash-tts | 31.4 s | 12.2 | 1.00 |
| s02_c0 | gemini-3.8-flash-tts | 51.9 s | 12.9 | 1.00 |
| s03_c0 | gemini-3.1-flash-tts-preview | 56.3 s | 12.3 | 0.90 |
| s04_c0 | gemini-3.1-flash-tts-preview | 63.2 s | 11.0 | 0.98 |
| s05_c0 | gemini-3.1-flash-tts-preview | 54.0 s | 10.1 | 0.98 |
| s06_c0 | gemini-3.1-flash-tts-preview | 55.1 s | 12.1 | 1.00 |
| s07_c0 | gemini-2.5-flash-preview-tts | 54.4 s | 12.0 | 0.97 |
| s08_c0 | gemini-2.5-flash-preview-tts | 60.9 s | 11.9 | 0.97 |
| s09_c0 | gemini-2.5-flash-preview-tts | 83.5 s | 11.9 | 0.98 |
| s10_c0 | gemini-2.5-flash-preview-tts | 54.2 s | 12.1 | 0.95 |
| s11_c0 | gemini-2.5-flash-preview-tts | 40.0 s | 11.3 | 0.82 |

Durations and pace above are for the raw takes. In the edit every take was time-stretched ×1.05 (pitch preserved) to fit the 10:00 plan and normalized to the same loudness (−18 LUFS per take before the mix). All takes use the same Orus voice. Several TTS models were used because each free daily quota ran out (scenes 01, 02: `gemini-3.8-flash-tts`; scenes 03, 04, 05, 06: `gemini-3.1-flash-tts-preview`; scenes 07, 08, 09, 10, 11: `gemini-2.5-flash-preview-tts`), so the timbre can shift slightly where the model changes. To make it uniform, regenerate those scenes on one model after the quota resets and re-run the timing script; nothing else changes.

Target pace is 11–14 characters per second. Match is the Gemini transcript's similarity to the script, where 1.00 means identical. Small gaps come from spelling variants of English terms.

**Music and sound effects:**
- **Music:** the same original code-synthesized soft bed as Lesson 01 (consistent series identity, no licensing), sitting about 20 dB under the voice and sidechain-ducked.
- **Sound effects:** logo sting, a whoosh per chapter card, pops on element entrances, small 'snip' pops as tokens split in scene 08, clicks on search results and a notification on the assistant answer in scene 09, card-flip pops in scene 10, and a success chime at the recap.

**Transitions:** chapter card between every scene, previous scene fades out over 0.3 s, and elements enter with ease-out motion. No hard cuts.

**Screen highlights and zooms:** nested rings pulse in sequence for the rule in scene 02. Neural-network layers pulse left to right and the weight line highlights in scene 04. Tokens pop one by one in scene 08. Panel borders light up for the matching example in scene 09. For the real capture, use the zooms in Section E.

**Thumbnail title:** "AI, ML, Deep Learning — পার্থক্য কী?" (main) · subline "লেসন ০২ · PILLAR 01". Layout: instructor photo at the left 40%, four nested coloured rings at the right with the labels AI · ML · DL · GenAI, Hind Siliguri Bold text, cyan glow.

**Video description (YouTube/Facebook):**

```
AI, Machine Learning, Deep Learning ও Generative AI — পার্থক্য কী? | লেসন ০২ · PILLAR 01 (বাংলা)

এই লেসনে শিখবেন:
00:00 স্বাগতম
00:31 বড় ছবি: চারটি বৃত্ত
01:22 Machine Learning
02:18 Neural Network ও Deep Learning
03:20 Generative AI
04:13 Large Language Model (LLM)
05:08 ট্রেনিং ডেটা
06:02 টোকেন ও ইনফারেন্স
07:02 সার্চ ইঞ্জিন বনাম AI অ্যাসিস্ট্যান্ট
08:23 আপনার অনুশীলন
09:16 সারসংক্ষেপ

অনুশীলন: একই ৩টি প্রশ্ন Google আর ChatGPT/Gemini-তে করে তুলনা করুন, আর ৬টি উদাহরণ কোন বৃত্তে পড়ে লিখুন।
নিরাপত্তা: ব্যক্তিগত তথ্য AI চ্যাটে দেবেন না। গুরুত্বপূর্ণ তথ্য আসল উৎসে যাচাই করুন।

পরের লেসন: প্রয়োজনীয় AI টুল ও প্ল্যাটফর্ম
#AIবাংলা #MachineLearning #DeepLearning #GenerativeAI #LLM
```

Chapter times in the description come from the rendered timeline. YouTube needs the first chapter at 00:00, which it is.

**Export settings:** H.264 High profile, 1920×1080, 30 fps constant frame rate, yuv420p (the delivered master uses CRF 18). AAC-LC 192 kbps, 48 kHz stereo. Fast-start for web playback. Loudness −14 LUFS integrated, true peak ≤ −1 dBTP.

**Measured QC on the delivered file:** Duration: 09:59.5 (599.5 s) · Video: H.264 High, 1920×1080, 30 fps, yuv420p, CRF 18 · Audio: AAC-LC 192 kbps 48 kHz stereo · Integrated loudness: −14.0 LUFS · True peak: −2.3 dBTP · HyperFrames lint: 0 errors · Frames reviewed: end-of-scene frame for all 11 scenes (6 layout issues found and fixed) + final-file contact sheet · Narration takes verified: 11/11 (script similarity 0.83–1.00; lowest scores are Latin-vs-Bangla spellings of English terms, transcripts checked by eye)

**Accuracy notes (checked for this lesson):** OpenAI's help article on tokens gives the rule of thumb that 1 token is about 4 characters of English text. Bangla generally needs more tokens per word in common tokenizers, but exact counts vary by model (see the Section E part 2 insert). SSC results are published by Bangladesh's education boards on their official sites. Bangladesh's national fruit is the jackfruit (কাঁঠাল).

**Before publishing:** replace scene 09's panels with your real capture (Section E) · listen to the full narration once for pronunciation of English terms (neural network, reinforcement, fine-tuning, inference) · turn on the platform's AI-generated content label, because the narration is AI-generated · add the SRT as Bangla captions.
