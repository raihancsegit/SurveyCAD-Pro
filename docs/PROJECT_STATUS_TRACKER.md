# 📊 Land Survey CAD — Master Project Tracker & Step-by-Step Testing Guide
**বাংলাদেশ ল্যান্ড সার্ভে ও নকশা ব্যবস্থাপনা প্ল্যাটফর্ম — প্রজেক্ট ট্র্যাকার ও টেস্টিং নির্দেশিকা**

> Last Updated: **August 2026** • Development Stage: **Month 3 Active (Completed: 15 / 23 Modules — ~70%)**  
> লাইভ ক্যানভাস লিংক: **[http://localhost:5050](http://localhost:5050)**  
> ডেস্কটপ অ্যাপ কমান্ড: `cd E:\Project\land-survey-cad\apps\desktop && npx electron .`  
> একক টেস্টিং ডকুমেন্ট: **[STEP_BY_STEP_TESTING_GUIDE.md](./STEP_BY_STEP_TESTING_GUIDE.md)**

---

## 🎯 Overall Progress Summary

| Total Modules | ✅ Completed / Live | 🟡 In Progress | ⚪ Upcoming / Planned | Progress |
| :---: | :---: | :---: | :---: | :---: |
| **23 Modules** | **15 Modules** | **2 Modules** | **6 Modules** | **~70% (Core CAD & Editing Live)** |

---

## 📋 23 Modules Status Checklist (ডকুমেন্টেশন অনুযায়ী অগ্রগতি)

### 🟢 1. সম্পন্নকৃত ও কার্যকর মডিউলসমূহ (Completed & Live in Workspace)

| Module # | Module Name | Status | What Has Been Built & Working |
| :--- | :--- | :---: | :--- |
| **01** | **Project Management (.lscad)** | ✅ Completed | • ১-ক্লিকে সম্পূর্ণ প্রজেক্টের সব দাগ, পিলার, স্কেল ও নকশা `.lscad` ফরম্যাটে সেভ এবং লোড। |
| **02** | **Mouza Map Import & Cleanup Studio** | ✅ Completed | • হাই-রেজুলেশন স্ক্যান ইমেজ লোডার (JPG/PNG/PDF)।<br>• B&W Thresholding ফিল্টার, Brightness, Contrast, Opacity ও 90° Rotation। |
| **03** | **Scale Calibration & Presets** | ✅ Completed | • Bangladesh scale presets: 16", 32", 64", 80", 4" = 1 Mile.<br>• Two-Point Calibration engine calculating pixel-to-ground scale factor. |
| **04** | **View & Canvas Tools** | ✅ Completed | • Infinite 2D sub-pixel precision Canvas.<br>• Smooth mouse wheel zoom towards cursor & Middle-drag pan.<br>• Fullscreen surveyor crosshair & live $(X, Y)$ coordinate HUD.<br>• Adaptive Grid in Links & Feet (Toggle `F7`). |
| **05** | **Drawing Tools Engine** | ✅ Completed | • Point (Pillar / Benchmark marker).<br>• Polyline & Polygon (দাগ বাউন্ডারি).<br>• North Arrow (উত্তর তীর) & live drawing hint guides. |
| **06** | **CAD Edit & Vertex Grips** | ✅ Completed | • **Draggable Vertex Handles (নীল গ্রিপ পয়েন্ট):** মাউস দিয়ে দাগের কোণা টেনে সরালে সাথে সাথে শতক, কাঠা ও আইল পরিমাপ রিয়েল-টাইম আপডেট হওয়া।<br>• **Offset / সীমানা অফসেট (O):** রাস্তার জায়গা ছাড়া বা বাউন্ডারি সেটব্যাকের জন্য সমান্তরাল অফসেট বাউন্ডারি তৈরি। |
| **07** | **Measure & Dimensions** | ✅ Completed | • Dynamic edge dimension badges along all boundary segments in Links & Feet.<br>• Live perimeter length calculation. |
| **08** | **Area Measurement (Shoelace Engine)** | ✅ Completed | • Mathematical Shoelace 2D polygon area calculation.<br>• Live real-time area calculation as vertices are clicked.<br>• Auto-close polygon on double-click / `Enter`. |
| **09** | **Layer Manager (লেয়ার ম্যানেজার)** | ✅ Completed | • Plots, Pillars, Dimensions ও Annotations লেয়ারের জন্য শো/হাইড (👁️ Visibility toggle) কন্ট্রোল। |
| **10** | **Bangla Text & Annotations (T)** | ✅ Completed | • ক্যানভাসে ক্লিক করে বাংলায় বিবরণী নোট যোগ করা (যেমন: `১২ ফুট সরকারি রাস্তা`, `পাকা সীমানা প্রাচীর`). |
| **12** | **Survey Calculator & Land Units** | ✅ Completed | • **শতক (Decimal)**, **কাঠা**, **বিঘা**, **একর**, **বর্গফুট**, **বর্গমিটার**, **বর্গলিংক** লাইভ কনভার্সন।<br>• বাংলা কথ্য বিবরণী (যেমন: `১০ শতক (৬ কাঠা ১ ছটাক)`). |
| **13** | **Survey Report Generator** | ✅ Completed | • Official printable Survey Report preview modal.<br>• Mouza, Khatian, Daag No, Client details, Boundary tables & Surveyor signature/seal block. |
| **15** | **DXF Export Engine (AutoCAD)** | ✅ Completed | • AutoCAD R12/2000 compatible `LWPOLYLINE` & `MTEXT` ASCII DXF file generator সরাসরি ডাউনলোড। |
| **19** | **Plot Division (দাগ বন্টন ও কর্তন)** | ✅ Completed | • কাঁচি টুল (Cut/Split) দিয়ে দাগকে ৫১২/ক ও ৫১২/খ অংশে বিভক্ত করা ও শতক রিক্যালকুলেট।<br>• স্লাইডার দিয়ে শতাংশ অনুপাতে লাইভ এরিয়া প্রিভিউ। |
| **22** | **Snap Manager Engine** | ✅ Completed | • Magnetic Endpoint (Square) & Midpoint (Triangle) snapping.<br>• Proximity tolerance check (Toggle with `F3`). |

---

### 🟡 2. বর্তমানে চলমান কাজসমূহ (In Progress)

| Module # | Module Name | Status | Current Focus & What's In Progress |
| :--- | :--- | :---: | :--- |
| **11** | **Digital Pantograph** | 🟡 In Progress | • নকশার ১৬" থেকে ৩২" বা ৬৪" স্কেলে আনুপাতিক বড়/ছোট (Scale-up/down) ইঞ্জিন। |
| **21** | **Closure & Topology Validation** | 🟡 In Progress | • বাউন্ডারির ফাঁকা গ্যাপ (Open gap) ডিটেকশন ও অটো-ক্লোজ। |

---

### ⚪ 3. পরবর্তী ধাপের কাজসমূহ (Upcoming Features)

| Module # | Module Name | Target Month | Planned Capabilities |
| :--- | :--- | :---: | :--- |
| **14** | **PDF Map Export** | Month 4 | Cartographic title block, outer neatline, scale bar, and A4/A3 scale printing. |
| **16** | **Object Properties Inspector** | Month 3 | Deep inspector for vertex coordinates table, bounding box, and centroid. |
| **17** | **Geo-Reference & GPS Locator** | Month 5 | WGS84 to BTM/BUTM coordinates, KML/KMZ Google Earth export & satellite overlay. |
| **18** | **Auto Plot Numbering** | Month 4 | Sequential click numbering, auto-center plot tags, duplicate finder. |
| **20** | **Advanced Plot Tools** | Month 4 | Merge contiguous plots into a unified polygon. |
| **23** | **Map Overlay & Comparison** | Month 5 | CS vs RS vs BS multi-era map swipe comparison slider. |
| **App** | **Mobile App (React Native)** | Month 5 | Android/iOS field survey app with GPS plot walking. |

---

## 🧪 পার্ট-বাই-পার্ট লাইভ টেস্টিং নির্দেশিকা (Live Step-by-Step QA Manual)

### ১. ক্যানভাস জুম ও প্যান টেস্ট:
- মাউস হুইল সামনে-পেছনে ঘুরিয়ে জুম ইন/আউট করুন।
- মাউসের চাকা (Middle Click) চেপে ধরে পুরো ক্যানভাস ড্র্যাগ করে ঘোরান।

### ২. দাগ আঁকা ও শতক পরিমাপ টেস্ট:
- বাঁ পাশের **`Plot / দাগ আঁকা (P)`** আইকনে ক্লিক করে ক্যানভাসে ৩-৪টি পয়েন্টে ক্লিক করুন।
- শেষ পয়েন্টে **Double Click** করুন ➔ সাথে সাথে শতক, কাঠা, বিঘা ও চারদিকের আইলের ফুট পরিমাপ ভেসে উঠবে।

### ৩. দাগের কোণা টেনে রিসাইজ টেস্ট (Vertex Grips):
- **`Select (V)`** দিয়ে দাগের ওপর ক্লিক করুন ➔ ৪ কোণায় ৪টি নীল রঙের চারকোনা গ্রিপ বক্স দেখতে পাবেন।
- যেকোনো কোণা মাউস দিয়ে ধরে টেনে বড়/ছোট করে রিয়েল-টাইম এরিয়া আপডেট যাচাই করুন।

### ৪. দাগ বন্টন ও কাটিং টেস্ট (Plot Division):
- ডান পাশের স্লাইডার `50% : 50%` করে **`দাগ কর্তন করুন`** বাটনে চাপুন।
- দাগটি কেটে স্বয়ংক্রিয়ভাবে **দাগ নং ৫১২/ক** এবং **দাগ নং ৫১২/খ** হিসেবে বিভক্ত হবে।

### ৫. নকশা ফিল্টার ও স্কেল ক্যালিব্রেশন টেস্ট:
- **`নকশা ফিল্টার`** ওপেন করে B&W Threshold ও Contrast পরিবর্তন করে দেখুন।
- **`স্কেল ক্যালিব্রেট (C)`** দিয়ে ২টি পয়েন্ট ক্লিক করে বাস্তব দূরত্ব ইনপুট দিন।

### ৬. টেক্সট ও লেয়ার ম্যানেজার টেস্ট:
- **`Text (T)`** ক্লিক করে ক্যানভাসে লিখুন: `১২ ফুট সরকারি রাস্তা`।
- **`লেয়ার ম্যানেজার`** ওপেন করে চোখ (👁️) আইকন চেপে দাগ বা টেক্সট হাইড/শো করুন।

### ৭. AutoCAD DXF ও প্রজেক্ট সেভ টেস্ট:
- **`DXF Export`** ক্লিক করে `.dxf` ফাইল ডাউনলোড করে AutoCAD-এ টেস্ট করুন।
- **`সেভ (.lscad)`** ক্লিক করে সম্পূর্ণ প্রজেক্টের ব্যাকআপ ফাইল ডাউনলোড করুন।
