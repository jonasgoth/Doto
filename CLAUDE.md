# Slate

Personal productivity web app — daily todos, backlog, and upcoming plans. Single user, no auth. Ultra-minimal UI.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Key Files

- `SPEC.md` — full feature spec, component specs, design system, database schema, interaction patterns. **Read this before building any feature.**
- `docs/REFERENCE.jsx` — interactive prototype showing exact component styling and behavior. Match this.

## Architecture Rules

- **Components never call Supabase directly.** All data access goes through custom hooks in `hooks/` (useTodos, useBacklog, usePlans).
- **Use date-fns** for all date formatting and comparison. Never use raw Date methods for display.
- **Clean up real-time subscriptions** in useEffect cleanup functions. Supabase subscriptions leak if not unsubscribed.
- **Use framer-motion sparingly** — only for delete transitions and hover reveals. No page transitions.

## Gotchas

- The database has NO Row Level Security and NO auth — this is intentional (single user app). Don't add auth.
- Backlog is a flat list. No priorities, no categories, no grouping.
- Completed tasks stay in place — never move them to a separate section on the Today page.
- The "→ Today" action on backlog items must INSERT into day_todos AND DELETE from backlog_todos — it's a move, not a copy.
- Daily wipe is client-side: check for stale day_todos on app load, not via cron or server function.
