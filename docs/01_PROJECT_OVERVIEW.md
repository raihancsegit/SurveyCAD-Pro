# 01. Project Overview & Strategy
**Land Survey CAD & Plot Management Platform**

---

## 1. Executive Summary

In Bangladesh, land surveying (জমি জরিপ ও সীমানা নির্ধারণ), mouza map analysis (মৌজা নকশা), and plot partitioning (জমি বন্টন / দাগ ভাগ) are traditionally performed using complex enterprise CAD software (like AutoCAD) or error-prone manual calculations with Gunter's chains and scales.

This project delivers a **dedicated, lightweight, and modern Land Survey CAD platform** built specifically for the workflows of Bangladeshi land surveyors (আমিন), real estate developers, and civil engineers.

---

## 2. Core Vision & Strategic Approach

### ❌ What We Are NOT Building
- An AutoCAD clone with thousands of 3D mechanical, architectural, or electrical modeling tools.
- A heavy, bloated CAD software requiring high-end dedicated GPUs.

### ✅ What We ARE Building
- A **fast, purpose-built 2D Land Survey CAD application**.
- Built-in **Mouza map calibration** (16", 32", 64", 80", 4" to a mile presets).
- Native support for **Bengali Land Units** (শতক/ডেসিমেল, কাঠা, বিঘা, একর, ছটাক, গণ্ডা, কানি, লিংক, চেইন, ফুট, গজ, মিটার).
- **Automated Plot Partitioning & Division** (equal area splitting, road frontage calculation).
- **Cross-Platform Shared Core** (Desktop offline app, Cloud Web portal, Mobile Field GPS app).

---

## 3. Technology Stack & Platform Allocation

| Platform | Technology Stack | Primary Purpose |
| :--- | :--- | :--- |
| **Shared Core** | TypeScript / ESNext (Monorepo Package) | Geometry algorithms, distance, Shoelace area, unit math, validation rules, snap calculations. |
| **Desktop App** | Electron + React + Canvas/WebGL + TypeScript | Full offline CAD workspace, large Mouza map rendering, scan image cleanup, hardware acceleration. |
| **Web Portal** | React + TypeScript + Tailwind CSS | Cloud project management, browser-based CAD viewer/editor, client report sharing. |
| **Mobile App** | React Native + Expo + TypeScript | Field GPS survey, live plot boundary tracking, on-site measurements, quick area check. |
| **Backend API** | Node.js + NestJS + TypeScript | Authentication, project cloud sync, multi-user permissions, PDF report generation. |
| **Cloud Database** | PostgreSQL + PostGIS Extension | Geospatial coordinate storage, spatial queries, project versioning. |
| **Local Database** | SQLite / Better-SQLite3 | Local offline project storage, change queue for seamless synchronization. |

---

## 4. Architectural Philosophy: "Write Once, Calculate Everywhere"

```
                          ┌───────────────────────────┐
                          │    @land-survey/core      │
                          │   Shared TypeScript Core  │
                          ├───────────────────────────┤
                          │ • Point / Vector Math     │
                          │ • Shoelace Polygon Area   │
                          │ • Bangladesh Unit Tables  │
                          │ • Snap Proximity Engine   │
                          │ • Plot Split & Partition  │
                          │ • Boundary Closure Tests  │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  [ Desktop Electron ]           [ Web React CAD ]           [ Mobile React Native ]
  • Heavy CAD Editing           • Cloud Collaboration       • Field GPS Plot Walk
  • Scan Map Calibration        • Client Preview            • Boundary Verification
  • High-Res DXF / PDF          • PDF Report Generation     • Mobile Offline Survey
```

---

## 5. Target Audience & Personas

1. **Professional Land Surveyors (সার্টিফাইড আমিন / সার্ভেয়ার)**
   - Need fast Mouza map tracing, boundary area calculations, and instant land division reports.
2. **Real Estate Developers & Housing Companies**
   - Need master-plan plot layout design, road frontage allocation, and land parcel management.
3. **Civil Engineers & Surveying Firms**
   - Need DXF export for civil tools, coordinate logging, and control point benchmarks.
4. **Individual Land Owners & Buyers**
   - Need transparent boundary verification, GPS plot location check, and dispute-free area reports.

---

## 6. Budget & Practical Implementation Principles (৳৩,০০,০০০ Target)

To deliver an exceptional, stable, and production-ready system within the budget:
1. **Lightweight Custom 2D Geometry Engine**: Utilize a clean 2D vector canvas rather than relying on bloated commercial proprietary CAD kernels.
2. **Reuse Shared Core**: Develop the mathematical and geometric logic once in TypeScript to eliminate triple-maintenance across Desktop, Web, and Mobile.
3. **Modular Deliverables**: Prioritize core survey CAD tools (Map Import -> Calibration -> Trace -> Measure -> Plot Division -> Report) before advanced 3D or raster AI features.

---
