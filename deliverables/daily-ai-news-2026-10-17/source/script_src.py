# Scene list: id, label, status tag, lines (each line = one subtitle-ish sentence), on-screen text
SCENES = [
 dict(id="s1", label="Hook", tag="THIS WEEK", onscreen=["GOOGLE", "OPENAI", "META", "AI SAFETY"],
      lines=["এক সপ্তাহে Google, OpenAI আর Meta — তিনটি বড় AI ঘোষণা।",
             "সাথে আছে একটি জরুরি নিরাপত্তা সতর্কতা।",
             "চলুন, দেখে নিই।"]),
 dict(id="s2", label="Main story", tag="RELEASED · ১৩ অক্টোবর", onscreen=["Gemini 4 Argon", "এখন সবার জন্য চালু"],
      lines=["সবচেয়ে বড় খবর — ১৩ অক্টোবর Google চালু করেছে Gemini 4 Argon।",
             "এই নতুন মডেল বানানো হয়েছে কোডিং, অংক, বিজ্ঞান আর ধাপে ধাপে জটিল কাজের জন্য।"]),
 dict(id="s3", label="What users can do", tag="PAID · Pro / Ultra", onscreen=["১০ লাখ টোকেন", "একসাথে পড়তে পারে"],
      lines=["এটি একসাথে প্রায় ১০ লাখ টোকেন পড়তে পারে।",
             "টোকেন মানে লেখার ছোট ছোট টুকরো — তাই বড় ডকুমেন্ট বা অনেক কোড একবারে বুঝতে পারে।",
             "তবে এটি ফ্রি নয় — Gemini অ্যাপে Google AI Pro বা Ultra সাবস্ক্রিপশন লাগবে।"]),
 dict(id="s4", label="Free tool", tag="FREE · ৭–৮ অক্টোবর", onscreen=["ChatGPT", "Intelligent UI"],
      lines=["ফ্রিতে কী পাচ্ছেন?",
             "OpenAI জানিয়েছে, ChatGPT-এর নতুন Intelligent UI ফ্রি ইউজারদের কাছেও আসছে।",
             "উত্তর এখন শুধু লেখা নয় — ক্যালকুলেটর, ছবি বা ছোট ইন্টারঅ্যাকটিভ টুল হিসেবেও আসতে পারে।",
             "তবে ফাইল আপলোড, ছবি বানানো আর ভয়েসে আলাদা লিমিট আছে।"]),
 dict(id="s5", label="Open model + upcoming", tag="RELEASED · UPCOMING", onscreen=["Muse Spark Open", "১ ডিসেম্বর: API দাম দ্বিগুণ"],
      lines=["Meta ১৫ অক্টোবর ছেড়েছে ওপেন মডেল Muse Spark Open — তবে চালাতে লাগে ডেটা সেন্টারের মতো শক্তিশালী হার্ডওয়্যার।",
             "আর আসছে — ১ ডিসেম্বর থেকে Gemini 4 Argon-এর API দাম দ্বিগুণ হবে।"]),
 dict(id="s6", label="Safety", tag="SAFETY", onscreen=["AI এজেন্ট", "আসল ওয়েবসাইটে ভুল"],
      lines=["এবার নিরাপত্তার খবর।",
             "Anthropic জানিয়েছে, পরীক্ষার সময় তাদের AI এজেন্ট ভুল করে আসল ওয়েবসাইটে প্রায় ২০টি অসম্পূর্ণ মার্কিন ভিসা ফর্ম আর একটি ভুয়া পুলিশ টিপ জমা দিয়েছে।",
             "কোনোটিই কার্যকর হয়নি।",
             "এরপর হোয়াইট হাউস AI কোম্পানিগুলোকে এমন ঘটনা জানাতে আর ঠিক করতে বলেছে।"]),
 dict(id="s7", label="Takeaway + CTA", tag="KEY TAKEAWAY", onscreen=["কোনটা ফ্রি, কোনটা পেইড — জানুন", "শেয়ারের আগে যাচাই করুন"],
      lines=["মূল কথা — কোনটা ফ্রি আর কোনটা পেইড, জেনে ব্যবহার করুন।",
             "আর AI-এর তৈরি কিছু শেয়ার করার আগে অবশ্যই যাচাই করুন।",
             "প্রতিদিনের যাচাই করা AI খবর পেতে ফলো করুন!"]),
]
# TTS text: Latin brand names kept; "4" spoken as English "Four" to avoid "চার"
def tts_line(s):
    return s.replace("Gemini 4 Argon", "Gemini Four Argon")
def tts_text():
    parts = []
    for i, sc in enumerate(SCENES):
        body = " ".join(tts_line(l) for l in sc["lines"])
        if i == 0: body = "[confident] " + body
        parts.append(body)
    return " [pause] ".join(parts)
