# 📱 Land Survey CAD - Mobile Application Architecture

এই ডিরেক্টরিটি ল্যান্ড সার্ভে ক্যাড প্ল্যাটফর্মের মোবাইল কম্প্যানিয়ন অ্যাপ (React Native / Expo)।

## 🏗️ আর্কিটেকচার ও মডুলারিটি

মোবাইল অ্যাপটি ব্রাউজারের কোনো DOM (`document`, `window`) বা সাধারণ HTML ক্যানভাসের ওপর নির্ভরশীল নয়। এটি সরাসরি **`@land-survey/shared-core`** প্যাকেজ থেকে পিওর সার্ভে ইঞ্জিন ও ম্যাথ ফাংশন ব্যবহার করে:

```typescript
import {
  convertSqftToLandUnits,
  computePolygonMetrics,
  calculateKhatianDistribution,
  validateBoundaryClosure,
  computeTwoPointCalibration,
  generateDXF,
  generateKML
} from '@land-survey/shared-core';

// উদাহরণ: ফিল্ডে দাগের ৪ কোণার জিপিএস/লিংক দিয়ে শতক ও কাঠা হিসাব
const metrics = computePolygonMetrics([
  { x: 100, y: 150 },
  { x: 420, y: 160 },
  { x: 400, y: 390 },
  { x: 120, y: 380 }
]);

const landArea = convertSqftToLandUnits(metrics.areaSqUnits * 0.4356);
console.log(landArea.formattedBangla); // "৪ কাঠা ২.৫ শতক"
```

## 🚀 ফিচারসমূহ:
1. **ফিল্ড সার্ভে ক্যালকুলেটর**: শতক, কাঠা, বিঘা, একর ও গান্টার লিংক কনভার্সন।
2. **১৬ আনা খতিয়ান হিস্যা ক্যালকুলেটর**: ওয়ারিশান ও সহ-শরিকদের মধ্যে দশমিক ও আনাভিত্তিক জমির নিখুঁত বণ্টন।
3. **স্কেল ক্যালিব্রেশন**: ১৬", ৩২", ৬৪", ৮০" মৌজা স্কেল লক।
4. **DXF ও KML এক্সপোর্ট**: সরাসরি মোবাইল থেকেই ক্লায়েন্ট বা ইঞ্জিনিয়ারকে ফাইল শেয়ার।
