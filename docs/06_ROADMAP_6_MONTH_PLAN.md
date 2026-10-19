# 06. Six-Month Development Roadmap & Milestones
**Land Survey CAD & Plot Management Platform**

---

## Month-by-Month Development Schedule

```
M1: Foundation & Architecture ──► M2: Map Calibration & Drawing ──► M3: CAD Tools & Land Units
                                                                               │
M6: QA, Packaging & V1 ◄───────── M5: Cloud Sync, Mobile & GPS ◄─── M4: Plots, Division & DXF
```

---

### 🗓️ Month 1: Foundation, Architecture & Canvas Coordinate Engine
- **Target Deliverables**:
  - Monorepo setup with Shared TypeScript Core (`@land-survey/shared-core`).
  - Electron Desktop Shell + React Canvas viewport skeleton.
  - React Web portal shell + NestJS API & PostgreSQL/PostGIS database initialization.
  - SQLite local client storage setup.
  - 2D World-to-Screen coordinate transformation math.
- **Verification Gate**:
  - Open app -> Pan/Zoom infinite grid -> Save blank project to SQLite -> Re-open successfully.

---

### 🗓️ Month 2: Raster Mouza Map Engine & Precision Calibration
- **Target Deliverables**:
  - High-res Mouza map scan loader (JPG, PNG, TIFF, PDF).
  - Raster cleanup filters (90°/180°/270° rotate, thresholding B&W, deskew, noise reduction).
  - Two-point scale calibration tool with Link/Feet/Meter input.
  - Bangladesh 16", 32", 64", 80", 4" scale presets.
  - Basic drawing primitives (Point, Line, Polyline, Polygon).
- **Verification Gate**:
  - Import 10,000px scanned map -> Calibrate 2 grid points to 10 chains (660 ft) -> Verify 1:1 scale accuracy.

---

### 🗓️ Month 3: Snap Engine, CAD Editing & Bangladesh Land Math
- **Target Deliverables**:
  - Snap Manager Engine (Endpoint, Midpoint, Intersection, Perpendicular, F3/F7/F10).
  - CAD Edit Tools (Move, Copy, Rotate, Offset, Trim, Extend, Join, Vertex Edit).
  - Shoelace Polygon Area calculation engine with live preview.
  - Bangladesh Unit Conversion engine (Sq.ft, Sq.m, শতক, কাঠা, বিঘা, একর, হেক্টর, লিংক).
  - Layer Manager (Color, style, hide, lock) & Text/Annotation editor.
- **Verification Gate**:
  - Trace irregular 4-sided plot -> Snap to corners -> Verify area calculates accurately to within 0.001 শতক.

---

### 🗓️ Month 4: Plot Management, Partitioning, PDF Reports & DXF Export
- **Target Deliverables**:
  - Auto Plot Numbering tool (Prefix, increment, batch renumbering).
  - Plot Division & Partitioning (Equal area split, exact area slice, road frontage cut).
  - Boundary closure gap detector & self-intersection validation.
  - Digital Pantograph scale converter (16" <-> 64" etc.).
  - AutoCAD R12/2000 DXF export builder.
  - Official Survey PDF Report Generator with surveyor signature & boundary sketch.
- **Verification Gate**:
  - Partition 10 শতক plot into two 5-শতক parcels -> Export DXF and verify layers in AutoCAD.

---

### 🗓️ Month 5: Cloud Synchronization, Mobile Field GPS & Geo-Tools
- **Target Deliverables**:
  - React Native Mobile app for Android and iOS.
  - Real-time GPS field walk & boundary verification over OpenStreetMap / Satellite.
  - Offline-first SQLite queue & Bi-directional NestJS PostGIS sync engine.
  - KML / KMZ Google Earth export & overlay.
  - CS vs RS vs BS multi-era map swipe comparison slider.
- **Verification Gate**:
  - Walk boundary in mobile app -> GPS tracks plot corners -> Syncs seamlessly to Desktop app via Cloud.

---

### 🗓️ Month 6: Stress Testing, Cross-Platform QA, Security & V1 Production Release
- **Target Deliverables**:
  - Geometry precision and calculation audit across 1,000+ real Bangladesh Mouza plots.
  - Large raster image rendering optimization (tile pyramid caching).
  - Multi-user conflict resolution testing in offline sync.
  - Windows Desktop installer (.exe / .msi) packaging.
  - Android APK packaging & Web cloud deployment.
  - Full Surveyor User Manual (বাংলা ও ইংরেজি গাইড).
- **Verification Gate**:
  - Production V1 release candidate passing all 12 QA validation gates.

---
