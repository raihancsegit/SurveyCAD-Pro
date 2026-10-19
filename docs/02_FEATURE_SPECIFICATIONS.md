# 02. Feature Specifications (All 23 Modules)
**Land Survey CAD & Plot Management Platform**

---

## Overview of 23 Functional Modules

```
[ 01. Project Management ] ────────► [ 02. Map Import & Cleanup ] ───► [ 03. Scale Calibration ]
           │                                                                    │
           ▼                                                                    ▼
[ 04. View & Canvas Tools ] ◄─────── [ 05. Drawing Tools Engine ] ◄─── [ 22. Snap Manager ]
           │                                       │                            │
           ▼                                       ▼                            ▼
[ 06. Edit Tools Engine ] ─────────► [ 07. Measure & Dimension ] ────► [ 08. Area Measurement ]
           │                                       │                            │
           ▼                                       ▼                            ▼
[ 09. Layer Manager ] ─────────────► [ 10. Text & Annotations ] ─────► [ 11. Pantograph Engine ]
           │                                       │                            │
           ▼                                       ▼                            ▼
[ 12. Survey Calculator ] ─────────► [ 16. Object Properties ] ──────► [ 21. Closure & Validation ]
           │                                       │                            │
           ▼                                       ▼                            ▼
[ 18. Auto Plot Numbering ] ───────► [ 19. Plot Division ] ──────────► [ 20. Advanced Plot Tools ]
           │                                       │                            │
           ▼                                       ▼                            ▼
[ 17. Geo Reference & GPS ] ───────► [ 23. Map Overlay Compare ] ────► [ 13-15. Reports, PDF, DXF ]
```

---

### Module 01: Project Management (প্রজেক্ট ম্যানেজমেন্ট)
- **New Project**: Initialize blank project canvas with unit settings (Feet/Link/Meter) and survey zone.
- **Open / Save / Save As**: Store files with custom `.lscad` (Land Survey CAD) JSON-compressed format.
- **Auto-Save & Crash Recovery**: Periodic snapshot saves to local SQLite storage every 2 minutes.
- **Recent Projects Carousel**: Quick launch dashboard with thumbnail map previews and last modified timestamps.

---

### Module 02: Mouza Map Import & Image Cleanup (নকশা ইমপোর্ট ও ক্লিনআপ)
- **Multi-Format Support**: JPG, PNG, TIFF, and high-resolution scanned PDF map imports.
- **Image Processing Filters**:
  - **Rotation**: Exact 90°, 180°, 270°, and fine arbitrary degree rotation.
  - **Thresholding (B&W)**: Convert blurry yellowed antique Mouza sheets into crisp monochrome lines.
  - **Scan Noise & Dust Filter**: Automatic despeckle algorithm to eliminate scan dust dots.
  - **Deskew**: Auto-align slanted scan borders with horizontal/vertical reference line.
  - **Line Gap Repair**: Morphological closing to bridge faint broken scan lines.

---

### Module 03: Scale Calibration & Presets (স্কেল ক্যালিব্রেশন)
- **Bangladesh Mouza Scale Presets**:
  - `16" = 1 Mile` (1 inch = 330 ft = 500 links) — Standard CS/RS Cadastral Map
  - `32" = 1 Mile` (1 inch = 165 ft = 250 links) — Semi-detailed Urban Survey
  - `64" = 1 Mile` (1 inch = 82.5 ft = 125 links) — High-density City/Municipal Map
  - `80" = 1 Mile` (1 inch = 66 ft = 100 links / 1 Gunter Chain) — Ultra-precise Map
  - `4" = 1 Mile` (1 inch = 1320 ft = 20 chains) — Topographic Thana Map
- **Two-Point Calibration**: Click point A and point B on known map grid line, input ground distance in Links/Feet/Meters to compute exact pixel-to-ground scale factor.
- **Calibration Lock & Error Index**: Displays Root Mean Square Error (RMSE) of calibration.

---

### Module 04: View & Canvas Navigation Tools (ভিউ ও নেভিগেশন)
- **Zoom Tools**: Zoom In, Zoom Out, Zoom to Selection, Zoom to Extents, Zoom Window.
- **Pan & Navigation**: Middle mouse drag, Spacebar + Left click drag, live cursor coordinates display.
- **Grid & Crosshair**: Configurable grid spacing (in Links/Feet), full-screen crosshair guide.

---

### Module 05: Drawing Tools Engine (ড্রয়িং টুলস)
- **Geometric Primitives**: Point (Station/Benchmark), Line, Polyline, Polygon, Rectangle, Circle, Arc.
- **Survey Specific Symbols**:
  - North Arrow (উত্তর তীর) with multiple cartographic styles.
  - Graphical Scale Bar (স্কেল বার) with dynamic link/feet subdivision.
  - Survey Benchmark (BM), Traverse Control Point, Permanent Boundary Pillar.
- **Auto & Semi-Auto Tracing**: Smart edge-following cursor for assisted vectorization of raster map lines.

---

### Module 06: CAD Edit Tools (এডিটিং ইঞ্জিন)
- **Basic Operations**: Select, Move, Copy, Delete, Rotate, Mirror, Scale.
- **Advanced Topology**:
  - **Offset**: Parallel line/polygon offset at exact offset distance (e.g. 5 ft setback or 10 link pathway).
  - **Trim & Extend**: Slice crossing polylines or extend to boundary boundaries.
  - **Join**: Weld adjacent open line segments into a continuous closed polygon.
  - **Vertex Editor**: Add, delete, move, or fillet polyline vertices with live dimension feedback.
  - **Multi-Level Undo/Redo**: 100+ steps history stack.

---

### Module 07: Measurement & Dynamic Dimensions (পরিমাপ ও ডাইমেনশন)
- **Live Dimension Tools**: Aligned Dimension, Linear (Horizontal/Vertical) Dimension, Angular Dimension, Radius/Diameter.
- **Continuous Polyline Measurement**: Total length plus individual segment lengths breakdown.
- **Customizable Styles**: Arrow styles, tick marks, text size, precision (0.00), font color, and dual unit display (e.g. `66.0 ft [100.0 lk]`).

---

### Module 08: Area Measurement & Unit Conversion (ক্ষেত্রফল পরিমাপ)
- **Shoelace Polygon Area Engine**: Sub-millimeter precision 2D polygon area calculation.
- **Live Area Preview**: Real-time area badge updating as the user draws polygon vertices.
- **Auto-Close**: Double-click or press Enter to auto-close boundary to initial vertex.
- **Hatching & Fill**: Solid fill, striped hatch, opacity slider for distinctive plot visual identification.

---

### Module 09: Layer Manager (লেয়ার ম্যানেজার)
- **Layer Controls**: Create, Rename, Delete, Duplicate, Color Picker, Line Weight (0.1mm - 2.0mm), Line Style (Solid, Dashed, Dotted).
- **Visibility & Security**: Show/Hide, Lock/Unlock (protect against accidental edits), Active Layer selection.
- **Default Survey Layers**: `Boundary`, `Plots`, `Roads`, `Waterbody`, `Dimensions`, `Text`, `Pillars`.

---

### Module 10: Text & Annotation Editor (টেক্সট এডিটর)
- **Bangla & English Typography**: Full Unicode support for Bangla fonts (Noto Sans Bengali, Hind Siliguri, SolaimanLipi).
- **Text Attributes**: Font family, font size, bold, italic, text rotation angle, background badge fill, layer assignment.

---

### Module 11: Digital Pantograph (প্যান্টোগ্রাফ / স্কেল কনভার্টার)
- **Proportional Enlargement / Reduction**: Resize entire survey drawings between 16", 32", 64", and 80" scales with automatic dimension and text recalibration.

---

### Module 12: Survey Calculator (আমিন সার্ভে ক্যালকুলেটর)
- **Multi-Unit Grid**: Instant synchronized conversion between:
  - Square Feet (বর্গফুট)
  - Square Meters (বর্গমিটার)
  - শতক / ডেসিমেল (Decimal / Shotok)
  - কাঠা (Katha)
  - বিঘা (Bigha)
  - একর (Acre)
  - হেক্টর (Hectare)
  - ছটাক ও গণ্ডা
- **Linear Equivalency**: Link (লিংক), Feet (ফুট), Meter (মিটার), Yard (গজ), Gunter Chain (চেইন), Hath (হাত), Bighat (বিঘাত).

---

### Module 13: Report Generator (অফিসিয়াল সার্ভে রিপোর্ট জেনারেশন)
- **Official Field Report Template**:
  - Project Title, Mouza, JL Number, Khatian (খতিয়ান), Daag No (দাগ নং), District, Upazila.
  - Client Name, Survey Date, Surveyor Name & Registration ID.
  - High-res embedded drawing sketch with North arrow and scale bar.
  - Tabulated boundary measurements (Side A, B, C, D distances + angles).
  - Total Area breakdown in শতক, কাঠা, বিঘা & বর্গফুট.
  - Surveyor official signature badge and company branding logo.

---

### Module 14: PDF Map Export & Printing (পিডিএফ এক্সপোর্ট ও প্রিন্ট)
- **Sheet Sizes**: A4, A3, A2, A1, A0 (Portrait & Landscape).
- **Scale-Accurate Output**: 1:1, 1:100, 1:500, or exact Bangladesh Mouza scale output.
- **Cartographic Border**: Outer neatline, coordinates tick marks, title block, legend, and disclaimer.

---

### Module 15: DXF Export & Import (অটোক্যাড DXF কম্প্যাটিবিলিটি)
- **AutoCAD Compatibility**: Export clean AutoCAD R12 / 2000 DXF format.
- **Entity Preservation**: Layers, colors, polylines, coordinates, text labels, and dimensions.

---

### Module 16: Object Properties Panel (অবজেক্ট প্রোপার্টিজ প্যানেল)
- **Contextual Inspector**: Live sidebar displaying:
  - Object Type (Polygon / Line / Point / Text / Dimension)
  - Assigned Layer & Color
  - Vertex Count & Coordinate Table $(X, Y)$
  - Perimeter / Length (Feet, Links, Meters)
  - Calculated Area (Sq.ft, শতক, কাঠা, বিঘা)
  - Centroid Coordinates & Bounding Box

---

### Module 17: Geo-Referencing & GPS Plot Locator (জিপিএস ও প্লট লোকেটর)
- **WGS84 & Bangladesh Transverse Mercator (BTM / BUTM)**: Coordinate transformations.
- **KML / KMZ Export & Overlay**: Export plots to view over Google Earth satellite imagery.
- **Field GPS Plot Walking (Mobile)**: Live GPS tracking displaying the surveyor's current position relative to traced Mouza plot boundaries.

---

### Module 18: Auto Plot Numbering (অটো দাগ নাম্বারিং)
- **Smart Sequence Generator**: Starting number, prefix (e.g. `দাগ-`), suffix, increment (+1, +2).
- **Sequential Click Numbering**: Click inside each plot to drop auto-centered plot number labels.
- **Duplicate Number Detection & Renumbering**: Find missing or duplicate plot numbers across entire Mouza map.

---

### Module 19: Plot Division & Land Partitioning (জমি বন্টন ও ভাগাভাগি)
- **Partition Methods**:
  1. **Equal Area Division**: Divide a large plot into $N$ equal parts.
  2. **Exact Area Cutoff**: Slice an exact specified area (e.g. `5.5 শতক`) from any designated boundary side.
  3. **Ratio / Percentage Partition**: E.g. Shareholder ratio `40% : 30% : 30%` or inheritance shares (ফারায়েজ বন্টন).
  4. **Road Frontage Division**: Partition ensuring each sub-plot receives equitable road access.
- **Interactive Cut Line**: Move/rotate boundary cut line with live area updates.

---

### Module 20: Advanced Plot Processing (প্লট স্প্লিট ও মার্জ)
- **Split Polygon by Line**: Cut a parcel into two distinct valid polygons.
- **Merge Adjacent Plots**: Union two touching plots into a single unified boundary polygon, automatically removing shared internal border lines.
- **Centroid Calculation**: Geometric center point generation for text placement.

---

### Module 21: Boundary Closure & Topology Validation (টপোলজি ভ্যালিডেশন)
- **Geometric Health Checks**:
  - Detect open gaps in boundary loops with visual red warning circles.
  - Auto-close gaps within user-defined tolerance (e.g. $< 0.1$ ft).
  - Detect self-intersecting polylines (Bow-tie polygons).
  - Detect overlapping plot boundaries and zero-area duplicate vertices.
  - Simplify polylines by removing redundant collinear points.

---

### Module 22: Snap Manager (স্মার্ট স্ন্যাপ ইঞ্জিন)
- **Snap Modes**: Endpoint, Midpoint, Intersection, Nearest, Perpendicular, Center, Vertex, Pillar Corner.
- **Keyboard Shortcuts**:
  - `F3`: Object Snap Toggle (On/Off)
  - `F7`: Grid Display Toggle
  - `F10`: Polar Tracking Angle Lock (0°, 45°, 90°, 135°)
- **Visual Indicators**: Magnetic snap glyphs (Square for endpoint, Triangle for midpoint, Hourglass for intersection).

---

### Module 23: Map Overlay & Survey Comparison (নকশা তুলনা - CS vs RS vs BS)
- **Multi-Era Historical Map Overlay**:
  - **CS** (Cadastral Survey - ১৯৪০)
  - **RS** (Revisional Survey - ১৯৬২)
  - **SA** (State Acquisition - ১৯৫৬)
  - **BS / City Survey** (বাংলাদেশ সার্ভে - বর্তমান)
- **Visual Compare Tools**: Opacity slider, horizontal/vertical split swipe curtain, boundary shift measurements.

---
