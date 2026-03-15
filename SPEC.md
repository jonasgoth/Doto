# Slate — Personal Productivity App
## Project Specification

---

## Overview

A personal productivity app for daily focus and life planning. Built for one user. Accessible via a web browser and a native iOS app, with all data synced in real time through Supabase.

The core philosophy: each day is a clean slate. No categories, no priorities, no complexity — just a short list of things that matter today, a backlog for everything else, and a view of what's coming up.

---

## Build Sequence

The project is split into two steps. Step 1 must be fully complete before starting Step 2.

### Step 1 — Web App (Next.js)
Get all functionality working in the browser first. This is the primary build phase. Supabase is set up here and all data logic is established. The web app is the source of truth for the data model.

### Step 2 — Mobile App (Expo / React Native)
Rebuild the UI in React Native, connecting to the same Supabase project. Add mobile-specific features (notifications, widget) as a final layer. Supabase queries are identical — only the UI layer changes.

---

## Tech Stack

### Shared
- **Database & Backend:** Supabase (Postgres, real-time subscriptions, free tier)
- **Language:** TypeScript throughout
- **Package manager:** npm
- **Date handling:** date-fns

### Step 1 — Web
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Animations:** framer-motion (minimal — only for delete transitions and hover reveals)
- **Supabase client:** `@supabase/supabase-js`
- **Deployment:** Vercel (free tier, personal use)
- **No UI component library** — all components built from scratch with Tailwind
- **No testing required in v1**

### Step 2 — Mobile
- **Framework:** Expo (React Native), bare workflow
- **Navigation:** Expo Router with tab layout
- **Supabase client:** `@supabase/supabase-js` (same as web)
- **Notifications:** expo-notifications (local, scheduled)
- **Widget:** expo-widgets (Expo SDK ALPHA)
- **Deployment:** EAS Build → AltStore sideload (no Apple Developer account needed)

---

## Project Structure (Step 1 — Web)

```
app/
├── layout.tsx              # Root layout with sidebar
├── page.tsx                # Redirects to /today
├── today/page.tsx
├── backlog/page.tsx
└── plans/page.tsx
components/
├── Sidebar.tsx
├── TaskCard.tsx            # Shared card: checkbox + editable title + hover actions
├── PlanCard.tsx            # Plan-specific card with emoji, date badge, tooltip
├── EditableText.tsx        # Click-to-edit inline text component
├── Checkbox.tsx
├── DeleteButton.tsx        # Subtle ✕ button, shown on hover
├── AddButton.tsx           # "+ Add" with subtle hover background
├── SectionLabel.tsx        # Light gray section label text
├── AddTaskModal.tsx        # Modal with today/backlog toggle
└── AddPlanModal.tsx        # Modal with title + date picker
lib/
├── supabase.ts             # Supabase client init (single instance)
└── queries/
    ├── todos.ts            # day_todos CRUD + real-time subscription
    ├── backlog.ts          # backlog_todos CRUD + real-time subscription
    └── plans.ts            # plans CRUD + real-time subscription
hooks/
├── useTodos.ts             # Custom hook for today's todos
├── useBacklog.ts
└── usePlans.ts
types/
└── index.ts                # Shared TypeScript types
```

---

## Navigation

Three sections. No other nav items, no logo, no settings icon in the sidebar.

| Section | Icon | Description |
|---|---|---|
| **Today** | Circle checkmark | Daily focus list |
| **Backlog** | Rounded square with lines | Persistent todo list |
| **Plans** | Calendar | Upcoming events |

### Web Sidebar
- Left-aligned, ~200px wide, white background
- Each nav item: icon + label + count (right-aligned, muted)
- Active state: black text, medium weight. Inactive: muted gray, normal weight
- No logo, no branding, no settings gear
- Counts show incomplete items (Today, Backlog) or total items (Plans)

### Mobile
- Bottom tab bar, white background, subtle top border
- Active: filled icon + black label. Inactive: outline icon + gray label

---

## Section 1: Today

### Purpose
A daily list of things to focus on. No categories, no time-of-day grouping. Just tasks.

### Header
- Large serif font displaying the day name (e.g. **"Friday"**)
- Subtitle with date in format: **"February 28"** (no year, no ordinal suffix)
- No day navigation arrows — Today always shows today

### Layout
The Today view has two sections, displayed vertically:

1. **Focus** — the user's tasks for today
2. **Plans** — a preview of upcoming plans (pulled from the Plans tab)

### Focus Section
- Section label: "Focus" in light gray text
- A flat list of tasks, no sub-grouping
- Each task is a `TaskCard` (see Component Specs below)
- Completed tasks stay in place (not duplicated, not moved) — they show with strikethrough and reduced opacity
- **"+ Add"** button below the task list, right-aligned, with subtle hover background

### Plans Preview
- Section label: "Plans" in light gray text
- Shows the first 3 upcoming plans as `PlanCard` components
- **"+ Add"** button below, right-aligned — clicking navigates to the Plans tab

### Daily Wipe
- Triggered client-side: on app load, if `day_todos` contains rows where `date < today`, run the archive-and-prompt flow
- Incomplete tasks trigger a prompt: **"You have X incomplete tasks from yesterday"** with two actions: **"Clear"** (delete them) or **"Move to Backlog"** (transfer to backlog_todos, then delete from day_todos)
- Completed tasks are archived to `day_logs` as a JSON snapshot, then deleted from `day_todos`

### Empty State
- When no tasks exist, show the "Focus" label and the "+ Add" button only
- No placeholder illustration or motivational text

---

## Section 2: Backlog

### Purpose
A persistent flat list of things to do eventually. No priorities, no categories, no grouping.

### Header
- Large serif title: **"Backlog"**

### Task List
- A single flat list of `TaskCard` components
- Each card shows hover actions: **"→ Today"** button and **delete ✕**
- **"→ Today"** moves the item to `day_todos` (with today's date) and removes it from `backlog_todos`
- Completed tasks appear in a "Completed" section at the bottom with a section label
- **"+ Add"** button below the active task list, right-aligned

### Add Task Modal
- Same modal as Today, with a toggle between "Today" and "Backlog" destination
- Modal fields: task title only (single text input)
- Submit on Enter key or click "Add" button

### Empty State
- Show the "+ Add" button only

---

## Section 3: Plans

### Purpose
Upcoming events and commitments with dates. Not todos — just things to be aware of.

### Header
- Large serif title: **"Plans"**

### Plan List
- A flat list of `PlanCard` components, sorted by date (earliest first)
- Each plan shows: emoji (😊 default) + title + days-until badge + delete ✕ on hover
- Hovering near the date area shows a tooltip with the full date (e.g. "April 17")
- **"+ Add"** button below, right-aligned

### Add Plan Modal
- Fields: title (text input) + date (date picker)
- No emoji picker in v1 — all plans use the default emoji

### Empty State
- Show the "+ Add" button only

---

## Component Specs

### TaskCard
Used in Today and Backlog. Consistent appearance across both.

```
┌─────────────────────────────────────────────────┐
│  ○  Task title here                          ✕  │
└─────────────────────────────────────────────────┘
```

- White background, 1px border `#EDEDE8`, border-radius 12px
- Padding: 15px vertical, 18px horizontal
- **Checkbox** on the left (22px circle, 1.5px border `#E5E5E0`)
- **Title** is an inline-editable text field — click to edit, Enter to save, Escape to cancel
- **Delete ✕** appears on hover (right side) — only when task is completed (Today) or always (Backlog)
- Completed state: green checkbox `#49EA8B` with white checkmark, title gets strikethrough + reduced opacity

### PlanCard
Used in Plans tab and the Today plans preview.

```
┌─────────────────────────────────────────────────┐
│  😊  Plan title here                   ✕ 48 days │
└─────────────────────────────────────────────────┘
```

- Same card style as TaskCard (white, border, 12px radius)
- No checkbox — plans are not completable
- **Emoji** on the left (default: 😊)
- **Title** is inline-editable
- **Delete ✕** slides in from left of the date on hover, pushing the date badge right (animated with 0.2s ease transition)
- **Days-until badge** on the right in muted text (e.g. "48 days", "Tomorrow", "Today")
- **Date tooltip** appears only when hovering in proximity of the date area — dark background, white text, shows full date (e.g. "April 17")

### Checkbox
- 22px circle
- Unchecked: 1.5px border `#E5E5E0`, transparent fill
- Checked: `#49EA8B` fill (green), white checkmark SVG
- Transition: 0.2s ease on all properties

### DeleteButton
- 22px circle, no border, transparent background
- Contains a small ✕ icon in muted gray
- Hover: subtle background `#F0EDED`
- Transition: 0.15s ease

### AddButton
- Right-aligned text: "+ Add" in muted gray
- Padding: 6px 12px, border-radius 8px
- Hover: subtle background `rgba(0,0,0,0.04)`
- Transition: background-color 0.15s ease

### EditableText
- Default: renders as a regular `<span>` with cursor: text
- Click activates an `<input>` in place — no border, no background, same font/size
- Enter: commits the change. Escape: reverts. Blur: commits.
- Completed tasks: strikethrough + opacity 0.45

### SectionLabel
- Font size: 14px, font weight: 400, color: muted gray `#B5B5B0`
- Margin bottom: 12px
- No icons, no pills, no backgrounds — just text

### AddTaskModal
- Backdrop: `rgba(0,0,0,0.18)` with `backdrop-filter: blur(3px)`
- Card: white, border-radius 16px, padding 28px, max-width 380px
- Title: "New task" in serif font
- Single text input with placeholder "Task name"
- Toggle buttons: "Today" / "Backlog" — active state is dark fill with white text
- Submit button: full-width, dark background, white text, "Add"
- Keyboard: Enter submits, Escape closes

### AddPlanModal
- Same style as AddTaskModal
- Title: "New plan"
- Fields: title input ("What's coming up?") + date input
- Submit button: "Add"

---

## Interaction Patterns

### Hover Actions (Web)
- **Today tasks (completed):** delete ✕ appears on right
- **Backlog tasks:** "→ Today" button + delete ✕ appear on right. "→ Today" has hover background effect
- **Plans:** delete ✕ slides in from left of date badge, pushing date right

### Inline Editing
- All task titles and plan titles are editable by clicking the text directly
- No edit modal, no separate edit mode — just click and type

### Push to Today
- From Backlog: click "→ Today" on hover → creates a new `day_todo` with today's date, deletes the `backlog_todo`
- From Add Task Modal: toggle destination to "Today" or "Backlog"

### Completed Task Behavior
- Tasks stay in their original position when completed (no reordering, no duplication)
- Completed tasks show with green checkbox, strikethrough, and reduced opacity
- Delete ✕ appears on hover for completed tasks

---

## Database Schema (Supabase)

All tables are single-user — no auth, no user_id. Row Level Security disabled.

```sql
-- Daily todos
create table day_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_completed boolean default false,
  position integer default 0,
  date date not null,
  created_at timestamptz default now()
);

-- Backlog todos (persistent, no date)
create table backlog_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_completed boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

-- Plans (upcoming events with dates)
create table plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  created_at timestamptz default now()
);

-- Archived day logs (written during daily wipe)
create table day_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  completed_count integer default 0,
  incomplete_count integer default 0,
  todos jsonb,
  archived_at timestamptz default now()
);
```

### What was removed from the schema
- `emoji`, `section`, `duration`, `is_focus` columns from `day_todos` — the UI no longer uses these
- `sub_tasks` table — removed, not in v1
- `rituals` and `ritual_completions` tables — Rituals section was removed entirely
- `emoji`, `priority` columns from `backlog_todos` — backlog is now a flat list
- `emoji`, `type` columns from `plans` — simplified to title + date only

### Real-time
Enable Supabase real-time on `day_todos`, `backlog_todos`, and `plans` so web and mobile stay in sync.

---

## Data Flow

```
Web App (Next.js)  ←→  Supabase (Postgres)  ←→  Mobile App (Expo)
```

- Both clients use `@supabase/supabase-js`
- Both subscribe to real-time changes on relevant tables
- Write from one client → other client updates within ~1 second
- No offline support in v1

### Query Patterns
Use custom React hooks that wrap Supabase queries and real-time subscriptions:

```typescript
// Example: useTodos hook
function useTodos(date: string) {
  // 1. Fetch initial data with supabase.from('day_todos').select('*').eq('date', date)
  // 2. Subscribe to real-time changes on day_todos filtered by date
  // 3. Return { todos, addTodo, updateTodo, deleteTodo, loading }
}
```

Each hook handles CRUD operations and real-time sync. Components never call Supabase directly.

---

## Design System

### Philosophy
Ultra-minimal. Every element earns its place. No decorative elements, no colored pills, no emoji circles, no icons in section headers. The design relies on typography, whitespace, and subtle borders.

### Typography
- **Page titles (day name, "Backlog", "Plans"):** Georgia or system serif, ~44px, font-weight 400 (not bold)
- **Section labels ("Focus", "Plans", "Completed"):** System sans-serif, 14px, font-weight 400, muted color
- **Task/plan titles:** System sans-serif, 15px, font-weight 400
- **Date badges / counts:** System sans-serif, 13px, font-weight 400, muted color

### Colors
- **Background (content area):** `#F5F5F3`
- **Background (sidebar / cards):** `#FFFFFF`
- **Text primary:** `#1A1A1A`
- **Text muted:** `#B5B5B0`
- **Card border:** `#EDEDE8`
- **Input/section border:** `#E5E5E0`
- **Checkbox checked:** `#49EA8B` (green)
- **Delete hover:** `#F0EDED`
- **Destructive text:** `#D4736C`

### Layout
- Sidebar: ~200px, white background, no border-right (content area border-left creates separation)
- Content area: max-width 640px, padding 40px 48px, light gray background
- Card gap: 8px between cards
- Section gap: 32px between sections (e.g. between Focus and Plans on Today)

### Transitions
- All hover effects: 0.15s ease
- Checkbox state change: 0.2s ease
- Plan delete button slide-in: 0.2s ease (width + opacity)
- Modal backdrop: no transition (instant)

---

## Notifications (Step 2 — Mobile only)

Two local push notifications per day (rituals notification removed). Defaults adjustable in settings:

| Time | Message |
|---|---|
| **08:00** | "God morgen — hvad er dit fokus i dag?" |
| **20:00** | "Aften — har du nået det hele?" |

- All notifications are local (no server push)
- Configured via `expo-notifications`
- Each can be toggled on/off and time-adjusted in settings

---

## Home Screen Widget (Step 2 — Mobile only)

Built with `expo-widgets` (Expo SDK ALPHA).

### Widget content (systemMedium — 4x2):
- Day label at top (e.g. "Friday")
- First 2 tasks from today with title and completion state
- Tapping opens the app to the Today tab

### Update trigger:
- `updateWidgetSnapshot` on app open or task completion

---

## Settings

Minimal settings, accessible from a small gear icon or a dedicated route (not in the main nav).

- Notification times — toggle + time picker (Step 2 only)
- "Clear completed tasks" — removes all completed items from today and backlog
- "View log" — read-only archive of past days

---

## Out of Scope (v1)

- Auth / login (single user, no account needed)
- Multiple users or sharing
- Android support
- Server-side push notifications
- Recurring todos
- Calendar integration
- Offline support
- iCloud sync
- Drag-to-reorder tasks
- Task priorities or categories
- Emoji picker for tasks
- Task duration / time estimates
- Sub-tasks
- Rituals / habits section
