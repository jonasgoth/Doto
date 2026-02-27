# FocusDay — Personal Life Management App
## Project Specification

---

## Overview

A personal productivity app for daily focus, habit rituals, and life planning. Built for one user. Accessible via a web browser and a native iOS app, with all data synced in real time through Supabase.

The core philosophy: each day is a clean slate with intentional focus on what actually matters, supported by rituals and a backlog for everything else.

---

## Build Sequence

The project is split into two distinct steps. Step 1 must be fully complete before starting Step 2.

### Step 1 — Web App (Next.js)
Get all functionality working in the browser first. This is the primary build phase. Supabase is set up here and all data logic is established. The web app is the source of truth for the data model.

### Step 2 — Mobile App (Expo / React Native)
Rebuild the UI in React Native, connecting to the same Supabase project. Add mobile-specific features (notifications, widget) as a final layer. The Supabase queries are identical to the web app — only the UI layer changes.

---

## Tech Stack

### Shared
- **Database & Backend:** Supabase (Postgres, real-time subscriptions, free tier)
- **Language:** TypeScript throughout

### Step 1 — Web
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Supabase client:** `@supabase/supabase-js`
- **Deployment:** Vercel (free tier, personal use)

### Step 2 — Mobile
- **Framework:** Expo (React Native), bare workflow
- **Navigation:** Expo Router with tab layout
- **Supabase client:** `@supabase/supabase-js` (same as web)
- **Notifications:** expo-notifications (local, scheduled)
- **Widget:** expo-widgets (Expo SDK ALPHA)
- **Deployment:** EAS Build → AltStore sideload (no Apple Developer account needed)

---

## Navigation Structure

Four sections, consistent across web and mobile:

| Section | Icon | Description |
|---|---|---|
| **Today** | Calendar | Daily focus todos grouped by time of day |
| **Backlog** | Checklist | Long-term todo list with priority grouping |
| **Rituals** | Face/smiley | Fixed morning and evening routines |
| **Plans** | Event/flag | Upcoming events and family commitments |

On web: sidebar or top navigation. On mobile: bottom tab bar.

---

## Section 1: Today

### Purpose
A daily-wiped list of things to do today. Encourages focus by surfacing the 1–2 most important tasks.

### Header
- Large serif font displaying the day name (e.g. **"Thursday"**)
- Subtitle with full date (e.g. "January 15th, 2026")
- Left/right arrows to navigate to previous days (read-only log view for past days)

### Sections
Tasks are grouped by time of day. Each section is collapsible with a pill header showing icon + label + count:

- **⏰ ANYTIME** — tasks with no specific time
- **🌅 MORNING** — tasks for the morning
- **☀️ AFTERNOON** — tasks for the afternoon
- **🌙 EVENING** — tasks for the evening

Each section has a **+** button on the right to add a task directly to that section.

### Task Row
- Emoji icon on the left (user picks from a set, or auto-assigned)
- Task title
- Optional duration label below title (e.g. "30m", "5m")
- Optional sub-task progress indicator (e.g. "0/4") with expand toggle
- Circle checkbox on the right — tap/click to complete
- Completed tasks show with strikethrough and fade

### Focus Prompt
When the Today view has more than 3 tasks:
- Show a subtle prompt: **"What's most important today?"**
- User taps/clicks 1–2 tasks to mark as **focus** — these get a visual highlight (soft colored left border)
- Focus tasks appear pinned at the top regardless of section

### Daily Wipe
- At midnight, today's tasks are archived to a daily log in Supabase and the list resets
- Incomplete tasks are NOT automatically moved to backlog — user gets a prompt: **"Clear"** or **"Move to Backlog"**

### Log
- Navigating to a past date shows a read-only archived view of that day
- Shows completed and incomplete tasks, nothing editable

### Add Task
- **+** FAB (mobile) or **+ Add task** button (web)
- Quick-add modal: task title, time-of-day section, optional duration, optional emoji
- Option to "Add to Backlog instead"

---

## Section 2: Backlog

### Purpose
A persistent list of things to do eventually. Not day-specific. Organized by priority.

### Header
- Large title: **"To-do"**

### Sections
Tasks grouped by priority, each collapsible with a colored pill header:

- **🔺 HIGH** — red/salmon pill
- **🟠 MEDIUM** — orange pill
- **🔽 LOW** — purple/muted pill
- **📋 TO-DO** (no priority set) — neutral

Each section shows count and has a **+** button.

### Task Row
- Emoji icon left
- Task title
- Circle checkbox right
- Hover (web) or swipe/long-press (mobile) to reveal: **"Add to Today"**, **"Change Priority"**, **"Delete"**
- Completed tasks appear in a collapsed "Completed" section at the bottom

### Quick Actions
- From any backlog task → push to Today (choose time-of-day section)
- From Today's add modal → send to backlog instead
- From Today's task → long-press/hover to move to backlog

---

## Section 3: Rituals

### Purpose
Fixed recurring checklists for morning and evening. These never wipe — they reset daily but the tasks themselves are permanent until deleted. Think of them as habits, not todos.

### Sections
Two sections, not collapsible:
- **🌅 Morning Rituals**
- **🌙 Evening Rituals**

### Task Row
Same as Today — emoji, title, optional duration, checkbox. Completion state resets at midnight daily.

### Management
- Click/long-press a ritual to edit or delete
- **+** button to add a new ritual to morning or evening
- Rituals are completely separate from Today and Backlog — they never appear there

---

## Section 4: Plans

### Purpose
High-level upcoming commitments — not daily todos but things to be aware of across the coming weeks.

### Two sections:
- **📅 Upcoming** — appointments, events, deadlines with a specific date
- **👨‍👩‍👧 Familie denne uge** — family commitments for the current week, no date required

### Item Row
- Title
- Optional date/time
- Optional emoji or tag
- Click/tap to edit, swipe or hover to delete

---

## Notifications (Step 2 — Mobile only)

Three local scheduled push notifications per day. Defaults (user can adjust in settings):

| Time | Message |
|---|---|
| **08:00** | "God morgen — hvad er dit fokus i dag?" |
| **13:00** | "Middag — hvordan går det?" |
| **20:00** | "Aften — wrap up dine ritualer." |

- All notifications are **local** (no server push needed)
- Configured via `expo-notifications`
- Each can be toggled on/off and time-adjusted in settings

---

## Home Screen Widget (Step 2 — Mobile only)

Built with `expo-widgets` (Expo SDK ALPHA).

### Widget content (systemMedium — 4x2):
- Day label at top (e.g. "Thursday")
- Today's **focus tasks** (1–2 items) with title and completion state
- If no focus set: show first 2 tasks from Today
- Tapping opens the app to the Today tab

### Update trigger:
- Calls `updateWidgetSnapshot` whenever the app opens or a task is completed

---

## Database Schema (Supabase)

All tables have a single user — no auth required, no user_id column. Row Level Security disabled for personal use.

```sql
-- Daily todos (wiped each day, archived to logs)
create table day_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text default '📝',
  section text check (section in ('anytime', 'morning', 'afternoon', 'evening')) default 'anytime',
  duration text,                          -- e.g. "30m"
  is_focus boolean default false,
  is_completed boolean default false,
  date date not null,                     -- the day this todo belongs to
  created_at timestamptz default now()
);

-- Sub-tasks for day todos
create table sub_tasks (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid references day_todos(id) on delete cascade,
  title text not null,
  is_completed boolean default false,
  position integer default 0
);

-- Backlog todos (persistent, no date)
create table backlog_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text default '📝',
  priority text check (priority in ('high', 'medium', 'low', 'none')) default 'none',
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Rituals (permanent, completion tracked separately)
create table rituals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text default '✨',
  period text check (period in ('morning', 'evening')),
  duration text,
  position integer default 0,
  created_at timestamptz default now()
);

-- Daily ritual completions
create table ritual_completions (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid references rituals(id) on delete cascade,
  date date not null,
  unique(ritual_id, date)
);

-- Plans and family commitments
create table plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text,
  type text check (type in ('event', 'family')) default 'event',
  date date,                              -- optional for family type
  created_at timestamptz default now()
);

-- Archived day logs (written at midnight wipe)
create table day_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  completed_count integer default 0,
  incomplete_count integer default 0,
  todos jsonb,                            -- full snapshot of the day's todos
  archived_at timestamptz default now()
);
```

### Real-time
Enable Supabase real-time on `day_todos`, `backlog_todos`, `ritual_completions` so web and mobile stay in sync without polling.

---

## Data Flow

```
Web App (Next.js)  ←→  Supabase (Postgres)  ←→  Mobile App (Expo)
```

- Both clients use `@supabase/supabase-js`
- Both subscribe to real-time changes on relevant tables
- Write from one client → other client updates within ~1 second
- No offline support in v1 — requires internet connection

---

## Design System

Consistent across web and mobile. Web uses Tailwind utility classes, mobile uses React Native StyleSheet.

### Typography
- **Screen titles / day name:** Large serif font (Georgia or custom serif). ~40–48px. Not bold.
- **Section headers:** Small caps, 11–12px, semibold, letter-spaced, uppercase
- **Task titles:** 16px, medium weight
- **Subtitles / duration:** 12px, muted gray

### Colors
- **Background:** Pure white `#FFFFFF`
- **Surface / card:** Off-white `#F7F7F5`
- **Text primary:** Near-black `#1A1A1A`
- **Text secondary:** Medium gray `#9A9A9A`
- **HIGH priority pill:** `#FDDDD5` background, `#E05A3A` text
- **MEDIUM priority pill:** `#FDE8D0` background, `#D97706` text
- **LOW priority pill:** `#E8E4F0` background, `#7C5FC4` text
- **Focus highlight:** `#EEF4FF` background or soft blue left border
- **FAB / primary action:** Deep blue `#2563EB`
- **Checkbox unchecked:** 22px circle, 1.5px border `#D0D0D0`
- **Checkbox checked:** Filled `#1A1A1A`

### Section Pill Headers
- Rounded pill shape with light tinted background
- Small icon + label + count
- Chevron on right for collapse/expand toggle

### Task Cards
- Rounded rectangle, `border-radius: 12px`
- Background `#F7F7F5` or subtle shadow on white
- 16px horizontal padding, 14px vertical
- Emoji in a soft circle background (32x32px)
- 12px gap between cards, 20px gap between sections

### Navigation
- **Web:** Clean sidebar or top nav with section labels
- **Mobile:** Bottom tab bar, white background, subtle top border. Active: filled icon + black label. Inactive: outline icon + gray label.

---

## Settings

Accessible from a gear icon.

- Notification times — toggle + time picker (Step 2 only)
- "Clear today's completed tasks"
- "View full log"

---

## Out of Scope (v1)

- Auth / login (single user, no account needed)
- Multiple users or sharing
- Android support
- Server-side push notifications
- Recurring todos (rituals handle this)
- Calendar integration
- Offline support
- iCloud sync
