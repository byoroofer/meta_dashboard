# Session Handoff

- Last updated: 2026-04-04T12:00:00-05:00
- Branch: `main`
- HEAD: `b8bfb06`
- Worktree status: clean. 11 commits ahead of origin/main (not pushed to remote git — deployed via Vercel CLI directly).

---

## What Is This Project

Meta Dashboard is a private internal business portal for Elite Cleaning. It runs at `https://tjware.me/meta-dashboard/`. Stack: Next.js App Router, TypeScript, Supabase (project `gnxznznucmrcbriohqdl`), Tailwind, deployed on Vercel.

It covers:
- Unified inbox (Facebook Page + Instagram DMs)
- Lead pipeline (Meta lead forms → CRM)
- Ad account reporting (campaigns, ad sets, ads, insights)
- CRM contacts
- Raw webhook archive and preservation
- Portal command dispatch (scaffolded, not live)
- Connected accounts / Meta asset sync

---

## What Was Completed This Session

### Meta Integration — Now Working

The dashboard is now successfully importing live Meta business data. Key commits:

- `665d47a` — Direct-asset fallback: when `/me/businesses` returns empty (system user has asset access but not business portfolio membership), use `/me/accounts` and `/me/adaccounts` to fetch pages and ad accounts directly. Creates a synthetic `direct_asset_access` business entry.
- `fd036c8` — Removed `tasks` field from `/me/accounts` (not supported without business context).
- `8dbccb5` — Use page access token (returned by `/me/accounts`) for `leadgen_forms` calls since system user token cannot call page-scoped endpoints.
- `f79c51b` — Use page token for leads fetch too.
- `f67d240` — Normalize `act_` prefix from ad account IDs; better error messages including endpoint URL and Meta error body.
- `b8bfb06` — Skip lead forms/leads gracefully when `leads_retrieval` permission returns 403, so the rest of the import (pages, IG accounts, ad account, campaigns, insights) completes successfully.
- `4dd352d` — Fix MetaSyncButton fetch paths to use `withBasePath()` for production `/meta-dashboard/` prefix.

### UI Upgrade — Completed Previous Session

- `044500a` — Full premium UI upgrade: MetricCard with trend indicators, DataTable empty-state rows, EmptyState with icon slot, AppSidebar with left accent bar + session dot, AppHeader compact layout, AccountSwitcher with scope context label, FilterBar with active filter state, Card/Badge polish.
- `8083917` — All dates formatted in `America/Chicago` (Dallas CT) using `Intl.DateTimeFormat`.

### Meta Diagnostic Surface

- `/api/meta/status` route returns config health, last sync job with counts, and a verdict enum.
- `MetaSyncButton` shows integration health panel with per-variable config rows, verdict badge, last sync detail, and targeted guidance.

---

## Current Live State

- **Import works.** Pages, Instagram accounts, ad account (Elite Cleaning Main), campaigns, ad sets, ads, and insights import successfully.
- **Leads are skipped** with a graceful catch — `leads_retrieval` permission needs to be added to the Meta app to unlock lead form data.
- **Business entry** is stored as `direct_asset_access` (synthetic) since system user is not a business portfolio member. Everything hangs off it correctly.
- **Date/time** — all timestamps display in Dallas Central Time.

---

## Active Open Issues

### Leads blocked — needs leads_retrieval permission
- The Meta app needs `leads_retrieval` in app review or the system user token needs to be generated with that scope.
- In Meta for Developers → App → Permissions, request `leads_retrieval`. Once granted, re-sync and leads will import.

### System user not a business portfolio member
- `/me/businesses` returns empty. The direct-asset fallback handles this correctly.
- Long-term: in Meta Business Settings, add the system user to the Elite Cleaning business as an Employee. After that, remove the fallback path or keep both.

### Auth/MFA incomplete
- Current access control is a password gate only. See `lib/auth/session.ts`.

### Portal target adapters scaffolded, not live
- `lib/services/portal-service.ts` and `app/api/portal/**` return mock/placeholder data.

### README migration docs lag
- README only documents migrations 0001–0006. Actual schema runs through 0010.

---

## Future UI Improvements — Handoff to Codex

The following UI work is ready to be implemented. The design system is in place (CSS tokens in `globals.css`, shared components in `components/shared/`, `components/ui/`).

### High priority
1. **Inbox conversation list** — replace DataTable with a proper conversation list UI: avatar, contact name, last message preview, unread dot, timestamp in right gutter. Similar to iMessage/WhatsApp style list.
2. **Message thread** — the chat bubble layout exists but bubbles need better max-width, avatar on inbound, and a proper reply composer with character count.
3. **Leads pipeline** — replace the DataTable list with a kanban-style column view (New → Qualified → Proposal → Won/Lost) or at minimum a richer list card with lead source badge and campaign name.
4. **Ad reporting** — the Ads page needs a sparkline or mini chart for spend/impressions trend. Consider using `recharts` (already likely in package.json or easy to add).
5. **Overview metrics** — the 4 metric cards are functional but the overview page has too many empty DataTables when there's no data. Replace with a better empty state per section.

### Medium priority
6. **Connected accounts health** — the asset inventory table should show a colored health dot per asset (green/amber/red) based on sync status + webhook health, not just text badges.
7. **Mobile sidebar** — the sidebar is hidden on mobile (`xl:grid-cols-[300px_...]`). Add a slide-out drawer with a hamburger toggle.
8. **Settings page** — currently very sparse. Add grouped sections: Account, Meta Integration, Notifications, Danger Zone.
9. **Audit log** — the audit table needs monospace font for action/target fields and color-coded outcome (success=green, error=red).
10. **Loading skeletons** — replace the `animate-pulse` placeholder in AccountSwitcher with proper skeleton loaders on the main page content areas (especially overview and leads).

### Low priority / polish
11. **Page transitions** — add subtle fade-in on route change using Next.js layout animations.
12. **Toast notifications** — `sonner` is already installed (see `app/layout.tsx`). Wire success/error toasts on form submissions and sync operations.
13. **Dark mode** — CSS tokens are already structured in `:root` making dark mode straightforward to add.

---

## Key File Map

| Area | Files |
|---|---|
| Shell | `components/app-shell/app-sidebar.tsx`, `app-header.tsx`, `account-switcher.tsx` |
| Design tokens | `app/globals.css` |
| Shared UI | `components/shared/metric-card.tsx`, `data-table.tsx`, `empty-state.tsx`, `filter-bar.tsx`, `page-header.tsx`, `status-badge.tsx` |
| Meta sync | `lib/meta/sync-service.ts`, `lib/meta/client.ts`, `app/api/meta/import/route.ts`, `app/api/meta/status/route.ts` |
| Data layer | `lib/repositories/dashboard-repository.ts`, `lib/services/*-service.ts` |
| Auth | `lib/auth/session.ts`, `app/api/auth/**` |
| Migrations | `supabase/migrations/0001` through `0010` |
| Config | `lib/config/env.ts` (getConfigStatus), `lib/config/base-path.ts` (withBasePath — required for all client-side fetch calls) |

---

## Resume Checklist for Next Agent

1. Read `AGENTS.md` and this file.
2. Run `git log --oneline -12` to orient.
3. The Meta import is working. The UI needs the improvements listed above.
4. **Always use `withBasePath()` from `lib/config/base-path.ts` for any client-side `fetch()` call** — the app runs under `/meta-dashboard/` in production and bare `/api/...` paths will 404.
5. Do not touch `lib/meta/sync-service.ts` unless fixing the leads permission issue.
6. Run `npx tsc --noEmit` and `npx eslint .` before committing.
7. Deploy with `npx vercel deploy --prod --yes` from `d:/Meta Dashboard`.
