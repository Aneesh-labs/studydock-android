# StudyDock — Storage Architecture & Persistence Decision

**Document Version:** 1.0.0  
**Date:** 2026-10-10  
**Author:** Antigravity Engineering  

---

## 1. Context & Requirements

StudyDock is a 100% offline-first, zero-sign-in student companion combining daily study journaling and deadline milestone tracking. The storage architecture must satisfy the following core requirements:

1. **Zero-Cloud Dependency:** All data must be stored locally on the user's Android device without any external database, cloud service, telemetry, or user authentication.
2. **Offline-First Reliability:** Every operation (adding/editing/deleting notes, marking deadlines completed, tracking streaks, updating settings) must execute synchronously or near-instantaneously without network access.
3. **Large Dataset Capacity:** Unlike `localStorage` (capped at ~5MB and vulnerable to browser eviction), student journals spanning semesters with Markdown notes and tags require a persistent, transactional database.
4. **WebView Data Safety:** Android WebViews run inside isolated app sandboxes (`/data/data/com.studydock.app/app_webview/Default/IndexedDB`). Data is persistent across app launches, OS reboots, and app updates when using the same application ID and signing key.
5. **Bidirectional Migration & Interoperability:** Data must easily export to and import from the legacy Python formats (`notes/YYYY-MM-DD.md` and `deadlines.json`).

---

## 2. Technology Selection: Dexie.js (IndexedDB)

After evaluating SQLite via native Capacitor plugins vs. IndexedDB via Dexie.js:

| Criteria | LocalStorage | SQLite Native Plugin | IndexedDB (Dexie.js) | Decision |
|---|---|---|---|---|
| **Storage Limit** | ~5 MB | Unlimited (disk) | > 1 GB (IndexedDB quota) | IndexedDB / SQLite |
| **Indexing & Query Speed** | Poor (JSON parse) | Fast (SQL indexes) | Fast (B-Tree indexes) | IndexedDB / SQLite |
| **Browser & Test Portability**| High | Low (Mock required for web) | High (fake-indexeddb for Vitest) | **IndexedDB (Dexie.js)** |
| **Type Safety & DX** | None | Raw strings / SQL | Fully typed TypeScript tables | **IndexedDB (Dexie.js)** |
| **Android WebView Durability**| Low (eviction risk) | High | High (Sandboxed App Storage) | **IndexedDB (Dexie.js)** |

**Decision:** We selected **Dexie.js v4** on top of the native Android WebView IndexedDB engine. Dexie provides:
- Fully typed schemas (`JournalEntry`, `Deadline`, `AppSettings`, `ReminderRecord`).
- ACID transactions.
- Fast multi-key compound indexes (e.g. `[studyDate+timeStr]`, `[status+dueAt]`, `tags`).
- Seamless execution in both Vitest Node test environments (via `fake-indexeddb`) and production Android WebViews.

---

## 3. Database Schema (`StudyDockDB`)

Database Name: `StudyDockDB`  
Current Version: `1`

```typescript
export class StudyDockDB extends Dexie {
  journalEntries!: Table<JournalEntry, string>;
  deadlines!: Table<Deadline, string>;
  settings!: Table<AppSettings, string>;
  reminders!: Table<ReminderRecord, string>;

  constructor() {
    super('StudyDockDB');
    this.version(1).stores({
      journalEntries: 'id, studyDate, subject, priority, createdAt, *tags',
      deadlines: 'id, dueAt, status, category, priority, subject, createdAt',
      settings: 'id',
      reminders: 'id, deadlineId, triggerAt, milestone, status',
    });
  }
}
```

### Table Definitions

1. **`journalEntries`**:
   - `id` (PK, UUID string)
   - `studyDate` (Indexed: `YYYY-MM-DD`)
   - `timeStr` (`HH:MM`)
   - `body` (Markdown text)
   - `tags` (Multi-entry indexed array: `*tags`)
   - `subject` (Optional subject tag)
   - `priority` (`low` | `medium` | `high`)
   - `createdAt`, `updatedAt` (ISO 8601 strings)

2. **`deadlines`**:
   - `id` (PK, string)
   - `title` (string)
   - `subject` (string)
   - `category` (`homework` | `assignment` | `exam` | `quiz` | `lab` | `project` | `other`)
   - `dueAt` (Indexed: `YYYY-MM-DDTHH:mm:ss.sss`)
   - `priority` (`low` | `medium` | `high`)
   - `notes` (Optional string)
   - `submissionUrl` (Optional URL)
   - `status` (Indexed: `active` | `completed` | `archived`)
   - `createdAt`, `updatedAt` (ISO 8601 strings)

3. **`settings`**:
   - Singleton record with `id: 'app_settings'`
   - Theme (`dark` | `light` | `system`), accent palette, notification milestone preferences, user name.

4. **`reminders`**:
   - Scheduled local notification mapping and state tracking.

---

## 4. WebView Sandbox & Data Preservation

- **Location:** Android stores the IndexedDB files in `/data/data/com.studydock.app/app_webview/Default/IndexedDB/` which is protected by Linux user-id isolation. No other app can read or tamper with StudyDock data.
- **Overdue Task Safety:** StudyDock **never** auto-deletes overdue deadlines. Overdue deadlines transition to an explicit `overdue` urgency state while remaining `status: 'active'`, preserving history until the user marks them complete or explicitly deletes them.
- **Data Portability:** Full JSON and Markdown export/import flows allow users to back up data at any time or move notes to their PC.
