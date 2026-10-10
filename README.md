# StudyDock Android

> **Unified Offline-First Student Companion**  
> StudyDock combines structured study journaling with proactive, milestone-based deadline and exam tracking into a private, zero-sign-in native Android mobile experience.

---

## 1. Project Overview

StudyDock is built to solve two daily student workflows in one calm, Cloud Glass workspace:
1. **Daily Study Journaling:** Capture timestamped notes, concepts reviewed, subject tags, and priority. Compatible with legacy `study-journaler` daily Markdown formats (`notes/YYYY-MM-DD.md`).
2. **Deadline & Exam Milestones:** Track homework, assignments, labs, projects, and exams with 4-tier milestone reminders (48h, 24h, 2h, and at due time). Overdue deadlines are never silently discarded.

### Core Principles
- **100% Offline-First:** Operates completely in Airplane mode. No account, no mandatory cloud backend, and zero telemetry.
- **Private by Default:** All journals, deadlines, settings, and stats live exclusively inside sandboxed on-device IndexedDB storage via Dexie.js.
- **Interoperability:** Bidirectional export/import supporting legacy `deadlines.json` and Markdown daily notes.
- **Cloud Glass Aesthetic:** Dark-first mobile interface featuring ambient depth, frosted glass surfaces, circular progress ring, and a 7-day focus calendar strip.

---

## 2. Tech Stack

- **Frontend & UI:** React 19, TypeScript 5.7, Vite 6, Tailwind CSS, Lucide React icons
- **Local Persistence:** Dexie.js v4 (IndexedDB)
- **Native Runtime:** Capacitor 7
- **Native Plugins:**
  - `@capacitor/local-notifications` (Milestone alarms)
  - `@capacitor/haptics` (Tactile feedback)
  - `@capacitor/status-bar` (Safe area insets and status bar styling)
  - `@capacitor/app` (App lifecycle state handling)
- **Unit Testing:** Vitest with `fake-indexeddb`

---

## 3. Prerequisites

- **Node.js:** v18+ (verified on Node v22.12.0 / npm v10.9.0)
- **JDK:** Eclipse Adoptium Temurin JDK 21 LTS (`jdk-21.0.12.101-hotspot`)
- **Android SDK:** Platforms 34 & 35, Build-Tools 34.0.0+, Platform-Tools

---

## 4. Setup & Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/Aneesh-labs/studydock-android.git
cd studydock-android
npm install
```

Run the development web server:

```bash
npm run dev
```

---

## 5. Automated Testing

Run the Vitest test suite covering markdown serialization/parsing, deadline milestone engines, study streak calculations, persistence, and legacy import/export:

```bash
npm test
```

Currently passing: **20/20 unit tests across 5 test suites**.

---

## 6. Building the Android Native APK

### Step 1 — Web Production Build
```bash
npm run build
```

### Step 2 — Sync Web Assets to Android Project
```bash
npx cap sync android
```

### Step 3 — Assemble Debug APK with Gradle & JDK 21
Ensure `JAVA_HOME` points to JDK 21:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
$env:ANDROID_HOME = "C:\Users\samos\AppData\Local\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

cd android
.\gradlew.bat assembleDebug
```

The output APK will be generated at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 7. Installing to an Android Device or Emulator

Ensure an Android device or emulator with USB debugging enabled is connected:

```bash
adb devices
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 8. Current Feature Status

- [x] **Home Dashboard:** Circular focus progress gauge, 7-day strip, nearest upcoming deadline cards, today's notes list, study streak pill.
- [x] **Study Journal:** Search and tag filtering (`#tag`), date grouping, priority badges, Markdown export/import.
- [x] **Deadlines & Exams:** Active / Overdue / Completed segmented tabs, countdown labels, category tags, submission URLs.
- [x] **Insights:** Study momentum tracker, streak calculation with grace period, 7-day activity bar chart, top study subjects.
- [x] **Settings & Backups:** 4 milestone notification toggles, test notification trigger, JSON & Markdown export/import, database reset.
- [x] **Offline Persistence:** Verified IndexedDB transactional storage via Dexie.js.
- [x] **Native Build:** Verified debug APK assembly on Android 15 (API 35) via Capacitor 7 and JDK 21.

---

## 9. License

Personal and Educational use. Built with privacy and offline reliability first.
