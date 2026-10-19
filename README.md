# Land Survey CAD & Plot Management Platform
**বাংলাদেশ ল্যান্ড সার্ভে ও নকশা ব্যবস্থাপনা প্ল্যাটফর্ম**

> A practical, lightweight, multi-platform Land Survey CAD & Plot Management System tailored for land surveyors (আমিন / সার্ভেয়ার), engineers, and real estate planners in Bangladesh.

---

## 📊 Live Project Status & Feature Tracker

👉 **[PROJECT_STATUS_TRACKER.md](./docs/PROJECT_STATUS_TRACKER.md)** — সম্পূর্ণ ২৩টি মডিউল ও ৬ মাসের প্ল্যানের বর্তমান অগ্রগতি ও পরবর্তী কাজের বিস্তারিত তালিকা।

---

## 🌟 Platforms Overview

```
                      ┌─────────────────────────────────────────┐
                      │          SHARED TYPESCRIPT CORE         │
                      │ Geometry • Units • Area • Validation    │
                      └────────────────────┬────────────────────┘
                                           │
                ┌──────────────────────────┼──────────────────────────┐
                │                          │                          │
        ┌───────▼────────┐         ┌───────▼────────┐         ┌───────▼────────┐
        │    DESKTOP     │         │      WEB       │         │     MOBILE     │
        │  Electron+React│         │  React + Vite  │         │  React Native  │
        │ Offline CAD App│         │  Cloud CAD Hub │         │ Field GPS App  │
        └───────┬────────┘         └───────┬────────┘         └───────┬────────┘
                │                          │                          │
                └──────────────────────────┼──────────────────────────┘
                                           │
                                ┌──────────▼──────────┐
                                │   Node.js / NestJS  │
                                │   REST & Sync API   │
                                └──────────┬──────────┘
                                           │
                             ┌─────────────▼─────────────┐
                             │    PostgreSQL + PostGIS   │
                             │   Cloud Spatial Database  │
                             └───────────────────────────┘
```

---

## 📚 Complete Project Documentation (`docs/`)

| Document | Title | Description |
| :--- | :--- | :--- |
| [PROJECT_STATUS_TRACKER.md](./docs/PROJECT_STATUS_TRACKER.md) | **Feature & Roadmap Tracker** | **লাইভ অগ্রগতি ট্র্যাকার (কোন কাজগুলো হয়েছে ও কোনটি বাকি)** |
| [01_PROJECT_OVERVIEW.md](./docs/01_PROJECT_OVERVIEW.md) | **Project Overview & Strategy** | Core strategy, tech stack, budget principles, and deliverables. |
| [02_FEATURE_SPECIFICATIONS.md](./docs/02_FEATURE_SPECIFICATIONS.md) | **23 Feature Modules Spec** | Full specifications for all 23 survey CAD and plot management tools. |
| [03_SYSTEM_ARCHITECTURE.md](./docs/03_SYSTEM_ARCHITECTURE.md) | **System Architecture & Sync** | Monorepo structure, offline SQLite queue, and PostGIS sync engine. |
| [04_BANGLADESH_SURVEY_MATH_UNITS.md](./docs/04_BANGLADESH_SURVEY_MATH_UNITS.md) | **Bangladesh Survey Math & Units** | Exact formulas for শতক, কাঠা, বিঘা, একর, গান্টার চেইন/লিংক & ১৬"/৩২"/৬৪"/৮০" স্কেল। |
| [05_DATABASE_SCHEMA_AND_API.md](./docs/05_DATABASE_SCHEMA_AND_API.md) | **Database Schema & APIs** | 20+ PostgreSQL/PostGIS tables, SQLite client schema, and REST endpoints. |
| [06_ROADMAP_6_MONTH_PLAN.md](./docs/06_ROADMAP_6_MONTH_PLAN.md) | **6-Month Development Roadmap** | Month-by-month milestone plan, tasks, and QA release criteria. |

---

## 🚀 Live Preview & Testing

- **Web CAD Workspace**: [http://localhost:5050](http://localhost:5050)
- **Desktop Electron App**: `npm start --workspace=@land-survey/desktop`
