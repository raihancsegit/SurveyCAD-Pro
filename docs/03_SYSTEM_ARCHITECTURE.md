# 03. System Architecture & Sync Engine
**Land Survey CAD & Plot Management Platform**

---

## 1. High-Level Architectural Diagram

```text
+-------------------------------------------------------------------------------+
|                           CLIENT APPLICATIONS                                 |
|                                                                               |
|  +---------------------------+  +-------------------+  +-------------------+  |
|  |     DESKTOP (Electron)    |  |    WEB (React)    |  |  MOBILE (RN/Expo) |  |
|  | • 2D Canvas / WebGL       |  | • Web Canvas      |  | • Field GPS Map   |  |
|  | • Local File System Access|  | • Cloud Workspace |  | • Live Boundary   |  |
|  | • High-res Scan Filters   |  | • PDF Sharing     |  | • Offline Storage |  |
|  +-------------┬-------------+  +---------┬---------+  +---------┬---------+  |
|                │                          │                      │            |
|                ▼                          ▼                      ▼            |
|  +-------------------------------------------------------------------------+  |
|  |                   @land-survey/core (SHARED TYPESCRIPT CORE)             |  |
|  | • Geometry Engine  • Unit Tables  • Snap Math  • Plot Division Engine   |  |
|  +----------------------------------------┬--------------------------------+  |
|                                           │                                   |
|                ┌──────────────────────────┴──────────────────────────┐        |
|                ▼                                                     ▼        |
|  +---------------------------+                         +-------------------+  |
|  |   SQLite Offline Store    |                         | Sync Queue Engine |  |
|  | (Local DB / Fast Cache)   |                         | (UUID Change Log) |  |
|  +---------------------------+                         +---------┬---------+  |
+------------------------------------------------------------------┼------------+
                                                                   │ (HTTPS / WSS)
                                                                   ▼
+-------------------------------------------------------------------------------+
|                            BACKEND CLOUD SERVICES                             |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                     Node.js / NestJS API Gateway                        |  |
|  | • JWT Authentication  • Project Sync Controller  • PDF Report Engine    |  |
|  +----------------------------------------┬--------------------------------+  |
|                                           │                                   |
|                                           ▼                                   |
|  +-------------------------------------------------------------------------+  |
|  |                     PostgreSQL 16 + PostGIS Spatial DB                  |  |
|  | • Spatial Polygons (ST_Area, ST_Centroid) • Project Version History     |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 2. Shared Core Architecture (`packages/shared-core`)

The shared TypeScript package is the single source of truth for all mathematical, geometric, and unit conversion algorithms across Desktop, Web, and Mobile.

### Directory Structure of `@land-survey/shared-core`:
```text
packages/shared-core/
├── src/
│   ├── geometry/
│   │   ├── point.ts              # 2D Point & Vector operations
│   │   ├── line.ts               # Line segment, intersections, perpendiculars
│   │   ├── polyline.ts           # Open polyline length, offset, vertex manipulation
│   │   ├── polygon.ts            # Closed polygon, Shoelace area, centroid, bounding box
│   │   ├── partition.ts          # Plot division algorithms (equal area, ratio, frontage)
│   │   └── snap.ts               # Proximity snap calculation engine
│   ├── units/
│   │   ├── bangladesh-units.ts   # Shotok, Katha, Bigha, Acre, Hectare, Link, Chain
│   │   └── scale-presets.ts      # 16", 32", 64", 80", 4" scale multipliers
│   ├── validation/
│   │   ├── closure.ts            # Open boundary gap detector
│   │   ├── self-intersection.ts  # Complex polygon self-intersection tests
│   │   └── overlap.ts            # Plot boundary overlap detector
│   ├── formats/
│   │   ├── lscad-parser.ts       # Native .lscad JSON schema serializer
│   │   ├── dxf-generator.ts      # AutoCAD R12/2000 DXF builder
│   │   └── kml-generator.ts      # Google Earth KML polygon builder
│   └── index.ts                  # Public package entrypoint
├── package.json
└── tsconfig.json
```

---

## 3. Offline-First Bi-Directional Synchronization Protocol

Surveyors frequently work in remote rural areas without internet access. The platform implements an **Offline-First SQLite + UUID Event Queue**:

```
[ Surveyor edits plot on Desktop / Mobile ]
                   │
                   ▼
       [ Writes to Local SQLite ]
       [ Appends to 'sync_queue' table ]
                   │
                   ▼
         [ Internet Available? ]
        ├── NO  ──► Continue offline smoothly
        └── YES ──► POST /api/sync/push (Batch payload)
                          │
                          ▼
            [ Backend validates & stores in PostgreSQL ]
            [ Resolves conflicts using Last-Write-Wins + Version IDs ]
                          │
                          ▼
            [ Other devices pull updates via /api/sync/pull ]
```

---

## 4. Canvas Rendering Strategy

- **Desktop (Electron)**: HTML5 2D Canvas with double-buffering. For large Mouza scans (20,000 x 15,000 px), image is split into multi-resolution tile pyramids to maintain 60 FPS pan and zoom.
- **Web (React)**: High-performance canvas component with React hooks for reactive UI state sync.
- **Mobile (React Native)**: React Native Skia / SVG viewport with touch gesture recognizers (pinch-to-zoom, two-finger pan).

---
