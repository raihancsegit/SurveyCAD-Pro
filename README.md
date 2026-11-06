# SurveyCAD Pro – Complete UI & Functional Specification

*Product:* SurveyCAD Pro  
*Platform:* Desktop Application (Electron)  
*Frontend:*  JavaScript, HTML  
*Mobile Application:* React Native  
*Interface Type:* Professional CAD Interface (AutoCAD-inspired)  
*Design Theme:* Dark Slate / Charcoal Gray  
*Target Users:* Land Surveyors, Survey Engineers and Land Measurement Professionals

---

# ১. সফটওয়্যারের মূল উদ্দেশ্য

SurveyCAD Pro হবে ভূমি জরিপকারীদের জন্য একটি পূর্ণাঙ্গ CAD ও Land Survey Management Software।

একজন সার্ভেয়ার যেন একই সফটওয়্যারে নিচের কাজগুলো করতে পারেন:

1. মৌজা ম্যাপ Import, Scale ও Drawing।
2. দাগের সীমানা নির্ধারণ এবং দূরত্ব ও ক্ষেত্রফল পরিমাপ।
3. জমির মালিকানা ও দখল অনুযায়ী ভাগ নির্ধারণ।
4. ওয়ারিশদের হিস্যা অনুযায়ী জমি বণ্টন।
5. CS, SA, RS, BS নকশা তুলনা ও Pentagraph তৈরি।
6. একই মৌজার একাধিক Sheet পাশাপাশি যুক্ত করা।
7. RTK GNSS ও Total Station থেকে Survey Data সংগ্রহ।
8. GPS Location দিয়ে বর্তমান দাগ শনাক্ত করা।
9. Professional PDF Report তৈরি ও Print করা।

# ২. সম্পূর্ণ UI Layout

সফটওয়্যারের মূল পেজটি নিচের অংশগুলো নিয়ে তৈরি হবে।

1. Application Title Bar
2. Classic Menu Bar
3. Ribbon Tab Bar
4. Ribbon Toolbar
5. Left Vertical Toolbar
6. Drawing Workspace
7. Right Dockable Sidebar
8. Command Line
9. Bottom Status Bar

*বিশেষ নির্দেশনা:* এই ডিজাইনে কোনো Project Explorer থাকবে না। Drawing Workspace বাম পাশের Vertical Toolbar থেকে ডান পাশের Sidebar পর্যন্ত সম্পূর্ণ জায়গা ব্যবহার করবে।

---

# ৩. Application Title Bar

সবার ওপরে Application Title Bar থাকবে।

### বাম পাশে

- SurveyCAD Pro Logo
- Software Name
- Version Number

### Quick Access Toolbar

- New Project
- Open Project
- Save
- Save As
- Print
- Undo
- Redo

### মাঝখানে

বর্তমান Project Name দেখাবে।

উদাহরণ: Chorbagh_Survey.prj

### ডান পাশে

- Search Commands / Tools
- Workspace Selector
- Notification
- Settings
- Minimize
- Maximize / Restore
- Close

Workspace Selector-এ বর্তমানে সক্রিয় Workspace-এর নাম দেখাবে, যেমন Surveying।

---

# ৪. Classic Menu Bar

Title Bar-এর নিচে Classic Menu Bar থাকবে।

### ৪.১ File

- New Project – নতুন Project তৈরি।
- Open Project – আগের Project খুলবে।
- Open Drawing – DWG/DXF ফাইল খুলবে।
- Save – বর্তমান কাজ সংরক্ষণ।
- Save As – নতুন নামে সংরক্ষণ।
- Import – বিভিন্ন ফরম্যাটের ফাইল Import।
- Export – Drawing ও Data Export।
- Print – সরাসরি প্রিন্ট।
- Export PDF – PDF রিপোর্ট তৈরি।
- Recent Projects – সাম্প্রতিক Project।
- Close Project – বর্তমান Project বন্ধ।
- Exit – Software বন্ধ।

### ৪.২ Edit

- Undo
- Redo
- Cut
- Copy
- Paste
- Erase / Delete
- Select All
- Find

### ৪.৩ View

- Zoom In
- Zoom Out
- Zoom Extents
- Zoom Window
- Pan
- Grid On/Off
- Snap On/Off
- Full Screen
- Show/Hide Sidebar
- Reset Workspace

### ৪.৪ Insert

- Insert Image
- Insert Mouza Map
- Insert Block
- Insert Survey Points
- Insert Text
- Insert Label

### ৪.৫ Format

- Layer Properties
- Text Style
- Dimension Style
- Drawing Units
- Color Settings
- Line Type
- Line Weight

### ৪.৬ Tools

- Virtual Guniya Scale
- Scale Calculator
- Area Calculator
- Unit Converter
- Coordinate Converter
- Survey Utilities
- Software Preferences

### ৪.৭ Draw

- Polyline
- Auto Polyline
- Circle
- Arc
- Rectangle
- Hatch

### ৪.৮ Dimension

- Linear Dimension
- Aligned Dimension
- Angular Dimension
- Distance Measurement
- Dimension Style

### ৪.৯ Modify

- Move
- Copy
- Rotate
- Scale
- Trim
- Extend
- Mirror
- Split
- Offset
- Erase

### ৪.১০ CAD-Earth

CAD-Earth Integration ও Geospatial Data আদান-প্রদানের জন্য এই Menu থাকবে। Integration সক্রিয় থাকলেই সংশ্লিষ্ট Command কাজ করবে।

### ৪.১১ Parametric

- Geometric Constraints
- Dimensional Constraints
- Constraint Management

### ৪.১২ Window

- Open Drawings
- Drawing Tabs
- Panel Management
- Workspace Management

### ৪.১৩ Help

- User Manual
- Keyboard Shortcuts
- Help & Support
- About SurveyCAD Pro

### ৪.১৪ Express

দ্রুত Drawing ও Editing-এর Utility Commands থাকবে।

### ৪.১৫ Raster

- Attach Raster Image
- Detach Image
- Image Clip
- Image Transparency


# ৫. Ribbon Tab Bar

Classic Menu Bar-এর নিচে Ribbon Tabs থাকবে।

ক্রম অনুসারে:

1. Home
2. Draw
3. Modify
4. Annotate
5. Mouza
6. Survey
7. Partition
8. Pentagraph
9. Map Combine
10. RTK / Total Station
11. GIS
12. Analysis
13. Report
14. Express

প্রতিটি Tab-এ সংশ্লিষ্ট Tool Group ও Button প্রদর্শিত হবে। Home Tab-এ দৈনন্দিন প্রয়োজনীয় Drawing ও Survey Tools-এর Quick Access থাকবে।

# ৬. Ribbon Toolbar – বিস্তারিত

Ribbon-এর Button-গুলো Group অনুযায়ী সাজানো থাকবে। প্রতিটি Group-এর নিচে Group Name থাকবে।

## ৬.১ Draw Group

| Button | কাজ |
|---|---|
| Polyline | একাধিক পয়েন্ট যুক্ত করে রেখা আঁকা |
| Circle | বৃত্ত আঁকা |
| Arc | বৃত্তের অংশ বা বাঁকা রেখা তৈরি |
| Rectangle | আয়তাকার Drawing |
| Hatch | নির্দিষ্ট এলাকার ভিতরে Pattern বা Fill দেওয়া |

## ৬.২ Modify Group

| Button | কাজ |
|---|---|
| Move | Drawing Object স্থানান্তর |
| Rotate | Object ঘোরানো |
| Trim | অতিরিক্ত রেখা কেটে বাদ দেওয়া |
| Copy | Object-এর অনুলিপি তৈরি |
| Extend | রেখা নির্দিষ্ট সীমানা পর্যন্ত বাড়ানো |
| Offset | নির্দিষ্ট দূরত্বে সমান্তরাল রেখা তৈরি |
| Scale | Object-এর আকার পরিবর্তন |
| Mirror | Object-এর প্রতিচ্ছবি তৈরি |
| Split | Object ভাগ করা |
| Erase | নির্বাচিত Object মুছে ফেলা |

*Erase:* Modify Group-এ Split-এর পরে থাকবে।

## ৬.৩ Annotation Group

| Button | কাজ |
|---|---|
| Text | Drawing-এ Text লেখা |
| Dimension | রেখার দৈর্ঘ্য ও দূরত্ব দেখানো |
| Angular | দুটি রেখার মধ্যবর্তী কোণ নির্ণয় ও প্রদর্শন |
| Leader | কোনো নির্দিষ্ট Object-এর দিকে নির্দেশক লাইন তৈরি |
| Label | দাগ, মালিকানা বা অন্যান্য তথ্যের Label তৈরি |
| Numbering | দাগ নম্বর ও অন্যান্য ধারাবাহিক নম্বর বসানো |

*Angular:* Annotation Group-এ Dimension-এর পাশে থাকবে।

*Numbering:* দাগ নম্বর স্বয়ংক্রিয়ভাবে বা নির্ধারিত ক্রমে বসানোর জন্য ব্যবহার হবে।

## ৬.৪ Mouza Group

| Button | কাজ |
|---|---|
| Import Map | JPG, PNG, TIFF ইত্যাদি মৌজা ম্যাপ Import |
| Scale | মৌজা ম্যাপের নির্ধারিত স্কেল প্রয়োগ |
| Geo-Refer. | ম্যাপের Geographic Position নির্ধারণ |
| Sheet | একাধিক Sheet পরিচালনা ও নির্বাচন |

### Scale Button-এর বিশেষ নির্দেশনা

মৌজার Sheet Size অনুযায়ী স্বয়ংক্রিয়ভাবে Scale Factor গণনা করতে হবে।

Formula:

Scale Factor = (5280 × 12) / Sheet Width

উদাহরণ:

| Sheet Size | Scale Factor |
|---|---:|
| 16 Inch | 3960 |
| 32 Inch | 1980 |
| 64 Inch | 990 |
| 80 Inch | 792 |

JPG Import-এর Initial Dimension ও Unit Conversion AutoCAD-এর সঙ্গে সামঞ্জস্যপূর্ণ হতে হবে। একই Base Point ও Scale Factor প্রয়োগে একই ফলাফল পাওয়া প্রয়োজন।

## ৬.৫ Survey Group

| Button | কাজ |
|---|---|
| Plot Measure | নির্দিষ্ট দাগের জমি পরিমাপ |
| Area | বন্ধ Polyline-এর ক্ষেত্রফল নির্ণয় |
| Perimeter | জমির মোট সীমানার দৈর্ঘ্য নির্ণয় |

Area Result-এ নিচের ইউনিটগুলো সমর্থন করতে হবে:

- Square Feet
- Square Meter
- Decimal
- Katha
- Bigha
- Acre
- Hectare

## ৬.৬ Pentagraph Group

| Button | কাজ |
|---|---|
| Ownership | জমির মালিকদের তথ্য ও মালিকানা সংরক্ষণ |
| Distribution | মালিকদের মধ্যে জমি বণ্টন |
| Inheritance | ওয়ারিশদের হিস্যা অনুযায়ী জমি বণ্টন |

## ৬.৭ Map Combine Group

| Button | কাজ |
|---|---|
| CS-BS Overlay | CS ও BS নকশা Overlay করে তুলনা |
| Common | দুটি ম্যাপের Common অংশ শনাক্ত |
| Stitch | একাধিক Sheet পাশাপাশি যুক্ত করা |

Pentagraph এবং Map Combine-এর ফলাফল Drawing ও Report আকারে সংরক্ষণ করা যাবে।

## ৬.৮ RTK / Total Station

এই Ribbon Tab নির্বাচন করলে RTK GNSS ও Total Station সম্পর্কিত Tool প্রদর্শিত হবে।

### RTK Tools

- Connect RTK
- Disconnect RTK
- Base Configuration
- Rover Configuration
- CORS / NTRIP Settings
- Import RTK Points
- Live Point Collection
- Point List
- Coordinate Processing

### Total Station Tools

- Connect Total Station
- Disconnect Total Station
- Import Total Station Data
- Traverse
- Point Processing
- Survey Data Processing
- Traverse Adjustment

### Data Import Support

- CSV
- TXT
- RAW
- DXF
- DWG

Device অনুযায়ী Supported Import Format ও Connection Method নির্ধারণ করতে হবে।

## ৬.৯ GIS Group

- GPS
- Location Finder

GPS দিয়ে সার্ভেয়ারের বর্তমান Location সংগ্রহ করতে হবে।

Location Finder ব্যবহার করে মৌজা ম্যাপের সঙ্গে GPS Position মিলিয়ে বর্তমান মৌজা ও দাগ শনাক্ত করতে হবে।

## ৬.১০ Analysis Group

এই Tab-এ Measurement ও Land Data Analysis-এর প্রয়োজনীয় Tools থাকবে।

- Area Analysis
- Distance Analysis
- Bearing Analysis
- Coordinate Analysis

## ৬.১১ Report Group

| Button | কাজ |
|---|---|
| Report | Professional Report তৈরি |
| PDF | PDF ফাইলে Export |
| Print | সরাসরি প্রিন্ট |

---

# ৭. Left Vertical Toolbar

Drawing Workspace-এর একদম বাম পাশে একটি Vertical Icon Toolbar থাকবে।

*বিশেষ নির্দেশনা:* এখানে শুধু Icon থাকবে। কোনো Text Label দেখানো যাবে না। Mouse Hover করলে Tooltip-এ Tool Name দেখাবে।

ক্রম অনুসারে:

| ক্রম | Tool | কাজ |
|---:|---|---|
| 1 | Select / Pointer | Object নির্বাচন |
| 2 | Polyline | রেখা আঁকা |
| 3 | Circle | বৃত্ত আঁকা |
| 4 | Magic Wand | নির্ধারিত Tolerance অনুযায়ী Raster বা Drawing Element নির্বাচন |
| 5 | Pan | Workspace সরানো |
| 6 | Copy | Object কপি |
| 7 | Move | Object স্থানান্তর |
| 8 | Text | Text লেখা |
| 9 | Rotate | Object ঘোরানো |
| 10 | Virtual Guniya Scale | মৌজা ম্যাপের স্কেল অনুযায়ী ভার্চুয়াল গুনিয়া দিয়ে পরিমাপ |
| 11 | Dimension | রেখার দৈর্ঘ্য মাপা |
| 12 | Split / Cut | রেখা বা Object ভাগ করা |
| 13 | Erase | নির্বাচিত Object মুছে ফেলা |
| 14 | Auto Polyline | স্বয়ংক্রিয়ভাবে সীমানা শনাক্ত করে Polyline তৈরি |

### Toolbar Interaction

- নির্বাচিত Tool নীল Highlight হবে।
- এক সময়ে একটি Primary Tool Active থাকবে।
- Mouse Hover করলে Tooltip দেখাবে।
- Right Click করলে সংশ্লিষ্ট Tool-এর Context Menu দেখানো যাবে।
- Keyboard Shortcut সমর্থন করতে হবে।
- Toolbar স্থায়ীভাবে বাম পাশে থাকবে।

---

# ৮. Main Drawing Workspace

এটি সফটওয়্যারের সবচেয়ে গুরুত্বপূর্ণ অংশ।

Left Toolbar ও Right Sidebar-এর মাঝখানে পুরো জায়গা জুড়ে Drawing Workspace থাকবে।

### Workspace-এর বৈশিষ্ট্য

1. Dark CAD Grid Background।
2. X এবং Y Coordinate Axis।
3. Crosshair Cursor।
4. Mouse Wheel Zoom In/Out।
5. Middle Mouse Button দিয়ে Pan।
6. Object Selection ও Editing।
7. Multiple Drawing Tabs।
8. Zoom Extents।
9. View Cube / Direction Compass।
10. WCS Coordinate Indicator।

### Multiple Drawing Tabs

একটি Project-এর মধ্যে একাধিক মৌজা ও Sheet খোলা যাবে।

উদাহরণ:

- Start Page
- Chorbagh_Sheet01.dwg
- Chorbagh_Sheet02.dwg
- Dakshinpara_Sheet01.dwg

প্রয়োজনে নতুন Drawing Tab যুক্ত করার জন্য + Button থাকবে।

একাধিক মৌজা ও Sheet-এর আলাদা Scale, Sheet Information ও Drawing Data সংরক্ষিত থাকবে।

---

# ৯. Right Sidebar

Right Sidebar হবে Photoshop-এর মতো Dockable Panel System।

উপরের দিকে চারটি Tab থাকবে:

1. Layers
2. Properties
3. Measure
4. Survey

ব্যবহারকারী প্রয়োজন অনুযায়ী Tab পরিবর্তন করতে পারবেন।

## ৯.১ Layers Panel

Layers Panel-এ বর্তমান Drawing-এর সমস্ত Layer দেখাবে।

Default Layer:

| Layer Name | Color |
|---|---|
| Mouza_Map | Magenta |
| Plot_Boundary | Green |
| Plot_No | Yellow |
| Road | Red |
| River | Cyan |
| Dimension | Yellow |
| Text | White |

প্রতিটি Layer-এর জন্য থাকবে:

- Visibility On/Off
- Lock/Unlock
- Layer Color
- Layer Name
- Current Layer Selection

উপরে থাকবে:

- Search Layers
- Add New Layer
- Duplicate Layer
- Delete Layer

একটি Layer Hide করলে সেই Layer-এর সব Object Workspace থেকে অদৃশ্য হবে। Lock থাকলে সেই Layer-এর Object পরিবর্তন করা যাবে না।

## ৯.২ Properties Panel

যেকোনো Drawing Object Select করলে তার Properties দেখাবে।

### General Properties

- Object Type
- Color
- Layer
- Linetype
- Lineweight
- Transparency

### Geometry Properties

- Position X
- Position Y
- Length
- Area
- Perimeter
- Coordinates
- Vertex Information

Polyline Select করলে তার প্রতিটি Segment-এর Length ও প্রয়োজনীয় Geometry দেখাতে হবে।

Closed Polyline হলে Area ও Perimeter দেখাতে হবে।

## ৯.৩ Measure Panel

পরিমাপ সম্পর্কিত সব তথ্য থাকবে।

- Distance
- Angular
- Area
- Perimeter
- Bearing
- Coordinates
- Measurement Unit

Measurement Unit পরিবর্তনের সুবিধা থাকবে।

উদাহরণ:

- Feet
- Inch
- Meter
- Square Feet
- Square Meter
- Decimal
- Acre

## ৯.৪ Survey Panel

এই Tab-এ Survey Data এবং বর্তমান Survey Information দেখাবে।

- Current Mouza
- Current Sheet
- Current Dag
- GPS Information
- RTK Point Information
- Total Station Information
- Survey Point List

---

# ১০. Right Sidebar – Plot Information ও Accordion Panels

Layers / Properties / Measure / Survey Tabs-এর নিচে Plot Information থাকবে।

### Plot Information

নির্বাচিত দাগ বা জমির তথ্য:

| Field | Description |
|---|---|
| Mouza | মৌজার নাম |
| Sheet No. | সিট নম্বর |
| Dag No. | দাগ নম্বর |
| Area | জমির ক্ষেত্রফল |
| Perimeter | জমির মোট পরিসীমা |
| Owner | মালিকের সংখ্যা বা নাম |

নির্বাচিত দাগ পরিবর্তন হলে এই তথ্য স্বয়ংক্রিয়ভাবে আপডেট হবে।

### নিচে Accordion Panels থাকবে:

*১. Ownership & Share*

- মালিকের নাম
- মালিকানার পরিমাণ
- অংশ বা হিস্যা
- দখলের পরিমাণ
- মালিকের তালিকা

*২. Calculation*

- Area Calculation
- Share Calculation
- Land Distribution Calculation
- Unit Conversion

*৩. GPS / RTK Points*

- Imported Points
- Live GPS Points
- Point Coordinates
- Point Description
- Point List

*৪. Total Station Data*

- Imported Data
- Station Information
- Traverse Information
- Point Coordinates
- Processing Results

*৫. Reports*

- Plot Measurement Report
- Ownership Report
- Land Distribution Report
- Inheritance Report
- Pentagraph Report
- Map Comparison Report

প্রতিটি Accordion Expand/Collapse করা যাবে।

---

# ১১. Command Line

Drawing Workspace-এর নিচে Command Line থাকবে।

এখানে দুটি অংশ থাকবে:

1. Command History
2. Command Input

### Command History

সর্বশেষ ব্যবহৃত Command ও ফলাফল দেখাবে।

উদাহরণ:

Command: AREA

Select closed polyline: 1 found

Area = 12,960.000 sq.ft

Perimeter = 482.000 ft

### Command Input

এখানে Keyboard দিয়ে Command লিখে কাজ করা যাবে।

- Command Auto Suggestion
- Previous Command History
- Enter দিয়ে Execute
- Esc দিয়ে Cancel
- Keyboard Shortcut

Mouse Toolbar এবং Command Line—দুই পদ্ধতিতেই একই Drawing Operations কাজ করবে।

---

# ১২. Bottom Status Bar

সফটওয়্যারের একদম নিচে Status Bar থাকবে।

### Drawing Tabs

- Model
- Layout1
- Layout2
- Add Layout (+)

### Coordinate Display

- X Coordinate
- Y Coordinate
- Z Coordinate

Mouse Cursor পরিবর্তনের সঙ্গে Coordinates আপডেট হবে।

### Scale Selector

বর্তমান Drawing Scale দেখাবে।

উদাহরণ: Scale: 1:3960

### Unit Selector

বর্তমান Drawing Unit দেখাবে।

উদাহরণ: Unit: Feet

### Device Status

- RTK: Connected / Disconnected
- TS: Connected / Disconnected

সংযুক্ত থাকলে সবুজ Status Indicator দেখাবে।

### Coordinate System

বর্তমান Coordinate System দেখাবে।

উদাহরণ: WGS84

### Drafting Controls

| Button | কাজ |
|---|---|
| GRID | Grid On/Off |
| SNAP | Cursor Snap |
| ORTHO | Horizontal ও Vertical Drawing |
| POLAR | Polar Tracking |
| OSNAP | Object Snap |
| OTRACK | Object Snap Tracking |
| DYN | Dynamic Input |
| LWT | Lineweight Display |

প্রতিটি Button On থাকলে Highlight হবে, Off থাকলে Normal থাকবে।

### অন্যান্য

- Zoom Percentage
- Full Screen
- Workspace Status

---

# ১৩. প্রধান Survey Workflow

Software-এর বিভিন্ন অংশের কার্যকারিতা নিচের Workflow অনুযায়ী হতে হবে।

## Workflow 1: Mouza Map Import & Measurement

1. Import Map Button থেকে JPG/PNG/TIFF Import।
2. Mouza Sheet Size নির্বাচন।
3. Auto Scale Factor Calculate।
4. Map Scale Apply।
5. নির্দিষ্ট Dag Number Search।
6. দাগ Zoom In।
7. Polyline বা Auto Polyline দিয়ে Boundary তৈরি।
8. Dimension দিয়ে প্রতিটি বাহু পরীক্ষা।
9. Area ও Perimeter Calculate।
10. Report তৈরি।
11. PDF Export বা Print।

## Workflow 2: Ownership & Possession Mapping

1. নির্দিষ্ট দাগ নির্বাচন।
2. মালিকদের তথ্য Input।
3. কে কোন অংশে দখলে রয়েছে তা Drawing।
4. মালিকানার পরিমাণ Input।
5. প্রতিটি অংশের Area Calculate।
6. Ownership & Possession Map তৈরি।
7. Report তৈরি।

## Workflow 3: Inheritance Distribution

1. দাগ নির্বাচন।
2. মোট জমির পরিমাণ নির্ধারণ।
3. ওয়ারিশদের তথ্য যোগ।
4. প্রত্যেক ওয়ারিশের প্রাপ্য হিস্যা Input।
5. Share অনুযায়ী জমির পরিমাণ Calculate।
6. জমি বণ্টনের Drawing তৈরি।
7. প্রত্যেকের প্রাপ্য পরিমাণ ও সীমানা দেখানো।
8. Report Export।

হিস্যা গণনার নিয়ম ব্যবহারকারীর দেওয়া বৈধ বণ্টন তথ্য অনুযায়ী কাজ করবে।

## Workflow 4: Pentagraph

1. CS Map Import।
2. BS Map Import।
3. দুটি নকশা Overlay।
4. প্রয়োজন অনুযায়ী Scale ও Alignment।
5. পুরোনো ও নতুন Dag Number Compare।
6. জমির পরিমাণ Compare।
7. পরিবর্তনগুলো চিহ্নিত।
8. Pentagraph Report তৈরি।

## Workflow 5: Map Stitching

1. একই মৌজার একাধিক Sheet Import।
2. Sheet নির্বাচন।
3. পাশাপাশি স্থাপন ও Alignment।
4. সীমানা ও দাগ মিলিয়ে দেখা।
5. Common Boundary পরীক্ষা।
6. Combined Mouza Map তৈরি।
7. Report বা Export।

## Workflow 6: GPS Location Finder

1. GPS / RTK Device Connect।
2. বর্তমান Location সংগ্রহ।
3. বর্তমান Mouza Map-এর সঙ্গে Coordinate Match।
4. সার্ভেয়ার কোন Dag-এ অবস্থান করছেন তা শনাক্ত।
5. Workspace-এ Current Position Marker দেখানো।
6. Location ও Dag Information দেখ

---

# ১৪. Design & UX Requirements

বর্তমান চূড়ান্ত ডিজাইন অনুসারে UI তৈরি করতে হবে।

### Color Theme

- Workspace: AutoCAD-inspired dark charcoal / slate gray।
- Ribbon: Dark gray।
- Sidebar: Dark slate gray।
- Active Button: Blue Highlight।
- Normal Icon: Light Gray / White।
- Important Tool Accent: Yellow।
- Selected Drawing Object: Green Highlight।
- Map Boundary: Magenta।
- Road: Red।
- River: Cyan।

### Interaction

- সব Button-এ Tooltip থাকতে হবে।
- Active Tool Highlight হবে।
- Panel Expand/Collapse করা যাবে।
- Right Sidebar Dockable হবে।
- Left Toolbar Icon-only থাকবে।
- Window Resize করলে Workspace Responsive হবে।
- Workspace-এর Drawing Area সর্বোচ্চ জায়গা ব্যবহার করবে।

### Important

- কোনো Project Explorer যোগ করা যাবে না।
- Left Toolbar-এ Text Label দেখানো যাবে না।
- Ribbon-এর নির্ধারিত Group Position পরিবর্তন করা যাবে না।
- Angular ও Erase ছাড়া অনুমোদনহীন নতুন Tool যোগ করা যাবে না।
- বিদ্যমান Menu বা Button বাদ দেওয়া যাবে না।
- Multiple Mouza ও Multiple Sheet Support থাকতে হবে।

---

# ১৫. Developer Implementation Notes

### Drawing Engine

Drawing Engine-এ নিচের বিষয়গুলো নিশ্চিত করতে হবে:

- Accurate Vector Drawing
- Polyline Editing
- Closed Polygon Detection
- Object Selection
- Vertex Editing
- Undo / Redo
- Layer-Based Rendering
- Zoom / Pan
- Snapping
- Area / Perimeter Calculation
- Dimension Calculation

### Data Management

প্রতিটি Project-এর অধীনে একাধিক Mouza, একাধিক Sheet এবং অসংখ্য Dag থাকবে।

প্রতিটি Sheet-এর নিজস্ব:

- Scale
- Image Reference
- Layer Configuration
- Drawing Objects
- Coordinate Information
- Measurement Data

থাকবে।

একটি Sheet-এর Scale পরিবর্তন করলে অন্য Sheet-এর Scale পরিবর্তন করা যাবে না।

### Data Integrity

- মূল Imported Image অপরিবর্তিত রাখতে হবে।
- Drawing Operations Undo/Redo সমর্থন করবে।
- Project Save করলে Drawing, Layer, Measurement ও Survey Data সংরক্ষণ হবে।
- Application Crash হলে Auto Recovery ব্যবস্থা রাখতে হবে।
- Export করা PDF ও Print-এর ফলাফল Drawing Workspace-এর সঙ্গে সামঞ্জস্যপূর্ণ হবে।

---

# ১৬. Final Acceptance Checklist

ডেভেলপমেন্ট সম্পন্ন হওয়ার পর নিচের বিষয়গুলো পরীক্ষা করতে হবে।

- [ ] Final UI Design অনুযায়ী Menu ও Ribbon আছে।
- [ ] Left Toolbar শুধু Icon দিয়ে তৈরি।
- [ ] সব Left Toolbar Button কার্যকর।
- [ ] Angular Annotation Group-এ আছে।
- [ ] Erase Modify Group-এ আছে।
- [ ] Layers Panel কার্যকর।
- [ ] Properties Panel কার্যকর।
- [ ] Measure Panel কার্যকর।
- [ ] Survey Panel কার্যকর।
- [ ] Mouza Map Import করা যায়।
- [ ] Sheet Size অনুযায়ী Scale কাজ করে।
- [ ] AutoCAD-এর সঙ্গে Raster Scaling তুলনা করে যাচাই করা হয়েছে।
- [ ] Polyline ও Auto Polyline কাজ করে।
- [ ] Dimension সঠিক ফলাফল দেয়।
- [ ] Area ও Perimeter সঠিকভাবে Calculate হয়।
- [ ] Numbering কাজ করে।
- [ ] Multiple Mouza ও Multiple Sheet Support আছে।
- [ ] Ownership & Share Management কাজ করে।
- [ ] Inheritance Distribution কাজ করে।
- [ ] Pentagraph কাজ করে।
- [ ] Map Stitching কাজ করে।
- [ ] RTK GNSS Data Import / Connect কাজ করে।
- [ ] Total Station Data Import / Connect কাজ করে।
- [ ] GPS Location Finder কাজ করে।
- [ ] PDF Export ও Print সঠিকভাবে কাজ করে।
- [ ] Project Save ও Reopen করলে সব Data অক্ষত থাকে।

*Final Instruction:* SurveyCAD Pro-কে সাধারণ ওয়েব ড্যাশবোর্ডের মতো তৈরি করা যাবে না। এটি একটি Professional Desktop CAD Application হিসেবে তৈরি করতে হবে। AutoCAD-এর মতো Ribbon, Full Drawing Workspace, Left Icon Toolbar, Right Dockable Panels, Command Line এবং Bottom Status Bar—এই কাঠামো অপরিবর্তিত রাখতে হবে। সফটওয়্যারের সব Tool বাস্তবে কার্যকর হতে হবে; শুধু UI-তে Button প্রদর্শন করলেই কাজ সম্পন্ন হয়েছে বলে গণ্য হবে না।
[3:04 am, 05/11/2026] Bangla Editor: আপনার Survey CAD-এ AutoCAD-এর মতো মৌজা ম্যাপ Scaling করার জন্য আমি ৪টি Formula প্রয়োগ করার পরামর্শ দিচ্ছি।

সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো, মৌজার Sheet Size থেকে Scale Factor নির্ণয় এবং JPG-এর Pixel থেকে Drawing Coordinate নির্ণয়—এই দুটি আলাদা ধাপ।
১. Mouza Scale Factor Formula
আপনার দেওয়া হিসাব অনুযায়ী:
\[
\boxed{S=\frac{5280\times12}{W}}
\]

এখানে:
- \(S\) = Scale Factor
- \(W\) = মৌজা ম্যাপের Sheet Size (ইঞ্চি)
- 5280 = এক মাইলের ফুট
- 12 = এক ফুটের ইঞ্চি
Sheet Size	Scale Factor
১৬ ইঞ্চি	৩৯৬০
৩২ ইঞ্চি	১৯৮০
৬৪ ইঞ্চি	৯৯০
৮০ ইঞ্চি	৭৯২

২. Raster Image Initial Size Formula
JPG Import করার সময় Pixel থেকে Initial Drawing Size নির্ণয় করতে হবে।

যদি DPI জানা থাকে:
\[
W_{initial}=\frac{PixelWidth}{DPI}
\]

\[
H_{initial}=\frac{PixelHeight}{DPI}
\]

এখানে ফলাফল হবে ইঞ্চিতে।

তবে AutoCAD-এর সঙ্গে মিলানোর জন্য AutoCAD যে Initial Image Size ব্যবহার করে, Survey CAD-এও সেটিই ব্যবহার করতে হবে। শুধু DPI Metadata-এর ওপর নির্ভর করা যাবে না।
৩. Final Image Scaling Formula
AutoCAD-এর SCALE Command-এর মতো:
\[
\boxed{W_{final}=W_{initial}\times S}
\]

\[
\boxed{H_{final}=H_{initial}\times S}
\]

Base Point ধরে Position পরিবর্তনের সূত্র:
\[
X_{new}=X_b+(X_{old}-X_b)\times S
\]

\[
Y_{new}=Y_b+(Y_{old}-Y_b)\times S
\]

এখানে \(X_b,Y_b\) হলো Base Point।
৪. Unit Conversion Formula
আপনার CAD-এ পরিমাপের জন্য নিচের Conversion রাখতে হবে।
Conversion	Formula
Inch → Feet	Inch ÷ 12
Feet → Inch	Feet × 12
Feet → Meter	Feet × 0.3048
Meter → Feet	Meter ÷ 0.3048
Square Feet → Decimal	Sq.ft ÷ 435.6
Square Feet → Acre	Sq.ft ÷ 43560


৫. Developer-এর জন্য সম্পূর্ণ JavaScript Formula

function calculateMouzaScale(sheetWidth) {
    return (5280 * 12) / sheetWidth;
}

function scaleRasterImage(image, sheetWidth) {
    const scaleFactor = calculateMouzaScale(sheetWidth);

    return {
        width: image.width * scaleFactor,
        height: image.height * scaleFactor,
        scaleFactor
    };
}

// Example: 16-inch Mouza Map
const image = {
    width: 10,
    height: 8
};

console.log(scaleRasterImage(image, 16));



এই কোডে image.width ও image.height-কে AutoCAD-এর Initial Drawing Unit-এ প্রকাশিত হতে হবে। Pixel সরাসরি ব্যবহার করা যাবে না, যতক্ষণ না Pixel-to-Drawing-Unit রূপান্তর সম্পন্ন হচ্ছে।

৬. আমার চূড়ান্ত সুপারিশ
আপনার Survey CAD-এ নিচের Workflow রাখুন:
1. Import Mouza JPG
   
   JPG Image Import হবে।
2. Select Mouza Sheet Size
   
   ১৬ / ৩২ / ৬৪ / ৮০ ইঞ্চি নির্বাচন।
3. Calculate Scale Factor
   
   \(S=63360/W\)
4. Apply AutoCAD Compatible Scaling
   
   একই Initial Size, Base Point ও Scale Factor প্রয়োগ।
5. Enable Measurement
   
   Distance, Area, Decimal, Acre ইত্যাদি হিসাব।

