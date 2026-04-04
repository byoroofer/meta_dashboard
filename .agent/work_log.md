# Work Log

Purpose: durable, searchable record of meaningful technical work. Keep newest entries first. Summarize noisy command output instead of pasting raw terminal spam.

## 2026-04-03T02:30:00-05:00 | UI premium upgrade and Meta integration diagnostics

- Task: Upgrade the dashboard interface to look premium/production-grade; add Meta integration health diagnostics so operators know exactly what's blocking live data.
- Context: Prior session confirmed the backend import path is structurally sound but returns zero businesses. This session focused on visual quality and adding operator-facing diagnostic surfaces.
- Files changed:
  - `app/globals.css` — richer CSS tokens (shadow-card, shadow-panel, accent-subtle, metric tone classes, stronger nav-active left-bar, radial gradient background)
  - `components/shared/metric-card.tsx` — tone-aware colored top borders + trend icons (TrendingUp/Down/Minus) and tinted delta text
  - `components/shared/data-table.tsx` — centered empty-state row when no data, instead of blank table
  - `components/shared/empty-state.tsx` — icon slot with icon-in-ring visual, centered layout
  - `components/shared/filter-bar.tsx` — interactive active-filter highlight state
  - `components/shared/page-header.tsx` — bolder eyebrow, tighter spacing
  - `components/app-shell/app-sidebar.tsx` — gradient brand header, active-nav left accent bar + filled dot, secondary-nav with icons, session indicator dot on user card
  - `components/app-shell/app-header.tsx` — compact single-row layout, icon buttons for Bell/Help, loading spinner in scope switcher
  - `components/app-shell/account-switcher.tsx` — context label shows current scope vs. all vs. no-data warning, active scope tinted, per-select chevron icons
  - `components/app-shell/logout-button.tsx` — smaller/lighter to fit compact header
  - `components/ui/card.tsx` — shadow-card upgrade, CardTitle bold/sm, CardDescription tighter
  - `components/ui/badge.tsx` — rounded-md style, bolder tracking
  - `components/inbox/inbox-workspace.tsx` — EmptyState icon (MessageSquare)
  - `components/leads/leads-workspace.tsx` — EmptyState icon (UserRound)
  - `components/meta/meta-sync-button.tsx` — full integration health panel: per-variable config rows, verdict badge, last-sync detail, targeted guidance for no_businesses case
  - `lib/config/env.ts` — add hasMetaSystemUser flag and getConfigStatus() without leaking secret values
  - `lib/meta/sync-service.ts` — persist import counts into sync_jobs.metadata column
  - `app/api/meta/status/route.ts` (new) — GET endpoint returning config status, last sync job, and verdict enum (ready / no_businesses / missing_config / never_run)
- Commands run: `npx tsc --noEmit` (0 errors); `npx eslint .` (0 errors); `git add -A && git commit`
- Errors encountered: None.
- Fix or decision: All changes landed cleanly. Typecheck and lint pass. Committed as `044500a`.
- Rationale: The dashboard needed to feel trustworthy and production-grade to be useful as an internal business tool. The diagnostic surface was critical for the next operator to self-diagnose the Meta connection blockage without reading code.
- Rollback plan: `git revert 044500a` or `git reset --hard 548819c` to return to the pre-session baseline checkpoint.
- Next steps: Fix Meta system user business/asset assignment in Meta Business Settings, then re-sync from the Connected Accounts page using the upgraded sync button.

## 2026-04-03T00:20:18-05:00 | Link Supabase CLI, push remote schema, and rerun live Meta import

- Task: Authenticate the Supabase CLI with the provided personal access token, link the workspace to project `gnxznznucmrcbriohqdl`, apply the repo migrations remotely, and retry the production Meta import.
- Context: The user insisted the schema changes should be applied directly. Earlier attempts were blocked because the machine lacked either a valid `sbp_...` token or a real Postgres password.
- Files changed: `supabase/migrations/0003_views_and_helper_functions.sql`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- Commands run: `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c npx supabase login --token ...`; `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c npx supabase link --project-ref gnxznznucmrcbriohqdl --yes`; `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c npx supabase db push --linked`; `Get-Content supabase\\migrations\\0003_views_and_helper_functions.sql`; `rg -n "digest\\(|compute_sha256|pgcrypto" supabase\\migrations -S`; `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c "echo y | npx supabase db push --linked"`; `Invoke-WebRequest https://gnxznznucmrcbriohqdl.supabase.co/rest/v1/sync_jobs?select=id&limit=1 ...`; `cmd /c curl.exe ... /api/auth/login`; `cmd /c curl.exe ... /api/meta/import`; `Get-Date -Format o`; `git status --short`
- Errors encountered: The first remote migration attempt failed on `0003_views_and_helper_functions.sql` because `digest(text, unknown)` was not found in the default search path on Supabase. After patching the function to call `extensions.digest(...)`, the remote push succeeded. The subsequent production import succeeded structurally but returned zero imported businesses/assets/ads/leads.
- Fix or decision: Logged the Supabase CLI in, linked the workspace to the correct project, fixed the helper-function migration for Supabase's extension schema layout, applied migrations `0003` through `0010` remotely, verified `public.sync_jobs` now exists, and reran the production importer successfully.
- Rationale: The live production blocker had shifted from missing environment variables to missing database schema. Once the schema was applied, the remaining empty dashboard state had to be validated as a Meta access issue rather than a backend failure.
- Rollback plan: Revert `supabase/migrations/0003_views_and_helper_functions.sql` if the schema qualification is later standardized another way, apply a corrective migration if needed, and revert these `.agent/` records if the diagnosis is incorrect.
- Next steps: Fix the Meta system user's business/app/asset access so `GET /me/businesses` returns the Elite Cleaning business, then rerun the live import.

## 2026-04-02T23:41:50-05:00 | Populate production envs, redeploy, and diagnose live import failure

- Task: Set the remaining production Meta/Supabase admin env vars that the user provided, redeploy production, and try the live Meta import.
- Context: The user asked to set the webhook app secret in Vercel, deploy, connect the Meta accounts, and populate real data in the live dashboard.
- Files changed: `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- Commands run: `cmd /c npx vercel env ls`; `cmd /c npx vercel env add META_WEBHOOK_APP_SECRET production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_APP_ID production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_APP_SECRET production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_SYSTEM_USER_ACCESS_TOKEN production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes --force`; `Get-Content lib\\config\\env.ts`; `Get-Content lib\\db\\supabase\\admin.ts`; `Get-Content lib\\meta\\client.ts`; `Get-Content lib\\auth\\session.ts`; `Get-Content app\\api\\auth\\login\\route.ts`; `cmd /c curl.exe ... /api/auth/login`; `cmd /c curl.exe ... /api/meta/import`; `Invoke-WebRequest https://gnxznznucmrcbriohqdl.supabase.co/rest/v1/sync_jobs?select=id&limit=1 ...`; `Get-Date -Format o`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`
- Errors encountered: The live import endpoint returned `500 {"success":false,"error":"Meta import failed."}` without exposing the underlying cause. Direct Supabase API probing then showed `PGRST205 Could not find the table 'public.sync_jobs' in the schema cache`, confirming the production database is missing at least part of the required schema. Some initial CLI requests were also tripped up by PowerShell/`cmd` quoting and had to be retried with simpler request flows.
- Fix or decision: Added the known production env vars to Vercel, forced a fresh production deploy to `https://tjware.me`, verified password login still works, and narrowed the remaining blocker to unapplied Supabase migrations rather than missing Meta credentials.
- Rationale: It was necessary to separate env/config issues from runtime schema issues before claiming the live Meta connection path was ready.
- Rollback plan: Remove or rotate the newly set Vercel env vars (`SUPABASE_SERVICE_ROLE_KEY`, `META_APP_ID`, `META_APP_SECRET`, `META_SYSTEM_USER_ACCESS_TOKEN`, `META_WEBHOOK_APP_SECRET`) if needed, redeploy production, and revert these `.agent/` entries if the diagnosis is incorrect.
- Next steps: Apply the required Supabase schema to the `gnxznznucmrcbriohqdl` project, then re-run the production import endpoint and verify Elite Cleaning businesses/assets/ad accounts/leads appear in the dashboard.

## 2026-04-02T18:44:50-05:00 | Remove generated dashboard fallback data and redeploy

- Task: Remove the remaining fake/generated dashboard data so the app only shows real persisted records, then redeploy production.
- Context: The user explicitly asked to remove all fake data before connecting the real Elite Cleaning Meta account.
- Files changed: `lib/repositories/dashboard-repository.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- Commands run: `rg -n ...`; `Get-Content -Raw lib\\repositories\\dashboard-repository.ts`; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered: Initial `lint` and `build` attempts hit the tool timeout and had to be rerun with a higher timeout; they passed once allowed to finish.
- Fix or decision: Replaced all mock fallback collections in `dashboard-repository.ts` with empty arrays so every dashboard surface now returns only live Supabase data or empty results, never generated sample rows. Redeployed production to `https://tjware.me`.
- Rationale: Connecting the real Elite Cleaning Meta account is materially harder to validate if the UI can still silently fall back to fabricated records.
- Rollback plan: Restore the prior mock-data imports and fallback behavior in `dashboard-repository.ts`, then redeploy production.
- Next steps: Finish the missing production Meta/Supabase admin env vars, then run the live importer so Elite Cleaning data actually appears instead of empty states.

## 2026-04-02T15:53:58-05:00 | Add simple password gate and deploy it live

- Task: Add a simple password gate to the dashboard and make the live site require it before allowing access.
- Context: The user requested a single admin password gate for the Meta Dashboard. The repo previously had no real auth, only a scaffolded demo session that auto-admitted all dashboard traffic.
- Files changed: `.env.example`; `lib/config/env.ts`; `lib/auth/session.ts`; `app/(auth)/login/page.tsx`; `app/api/auth/login/route.ts`; `app/api/auth/logout/route.ts`; `components/auth/login-form.tsx`; `components/app-shell/logout-button.tsx`; `components/app-shell/app-header.tsx`; `proxy.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- Commands run: `Get-Content -Raw ...` across auth, login, layout, and UI files; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npx vercel env add DASHBOARD_ADMIN_PASSWORD production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`; `git status --short --branch`
- Errors encountered: Next 16 route typing rejected base-path-computed form actions and redirects, so the login/logout flow had to move into small client components using `fetch` instead of typed JSX form action strings.
- Fix or decision: Replaced the demo session with a cookie-backed password session, added working login/logout endpoints and UI, enforced the gate across dashboard pages and internal API routes through `proxy.ts`, set the production password env var, and redeployed production. The secret value itself was not recorded in repo memory.
- Rationale: A simple password gate is sufficient for the current requirement, but it still needed to protect both server-rendered pages and internal JSON endpoints, not just the visible login page.
- Rollback plan: Remove the password env var from Vercel, delete the auth routes/components and `proxy.ts`, restore the prior demo-only `lib/auth/session.ts`, and redeploy.
- Next steps: Confirm the live login flow behaves as expected on `tjware.me/meta-dashboard`, then continue filling the remaining production Meta and Supabase env vars so the importer can be activated behind the new password gate.

## 2026-04-02T14:04:42-05:00 | Add shared ad-account links, live Meta importer, and redeploy production

- Task: Support one ad account linking to multiple Facebook/Instagram assets, update the UI to show those live relationships, add a real Meta import path, and redeploy the live dashboard.
- Context: The user clarified that a single ad account is connected to Brooke Vinson Facebook/Instagram and Elite Cleaning Facebook/Instagram, then asked for the UI, data import path, and live deployment to be updated accordingly.
- Files changed: `.env.example`; `types/domain.ts`; `types/database.ts`; `supabase/migrations/0010_shared_ad_account_links.sql`; `lib/config/env.ts`; `lib/meta/client.ts`; `lib/meta/sync-service.ts`; `app/api/meta/import/route.ts`; `components/meta/meta-sync-button.tsx`; `components/ads/ads-workspace.tsx`; `components/connected-accounts/accounts-workspace.tsx`; `components/app-shell/account-switcher.tsx`; `lib/repositories/dashboard-repository.ts`; `lib/services/connected-accounts-service.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- Commands run: `rg -n ...`; `Get-Content -Raw ...` across Meta, ads, connected-accounts, env, and migration files; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npx vercel env ls production`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`; `git status --short --branch`
- Errors encountered: The local workspace had no Meta or Supabase admin env vars set, so the importer could not be executed locally. Vercel production environment inspection showed that `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_ID`, `META_APP_SECRET`, and `META_SYSTEM_USER_ACCESS_TOKEN` are still missing in production, which blocks the live import route from succeeding even though the code is deployed.
- Fix or decision: Added a join table for shared ad-account-to-asset relationships, updated the repository/UI to surface those links, implemented a real Meta sync service and `/api/meta/import` route, added sync buttons to the ads and connected-accounts views, and redeployed production to `https://tjware.me`.
- Rationale: Shared ad-account ownership has to exist in the schema first; otherwise the importer and UI will continue flattening multi-brand access into a false one-account-one-asset model.
- Rollback plan: Revert `0010_shared_ad_account_links.sql`, remove the importer route/service and sync button components, restore the prior ad-account repository/UI assumptions, and redeploy production.
- Next steps: Add the missing production env vars (`SUPABASE_SERVICE_ROLE_KEY`, `META_APP_ID`, `META_APP_SECRET`, `META_SYSTEM_USER_ACCESS_TOKEN`), then run `/meta-dashboard/api/meta/import` against production and verify imported businesses, assets, ad accounts, campaigns, ad sets, ads, insights, lead forms, and leads.

## 2026-04-02T13:51:22-05:00 | Replace mock-first dashboard reads with scoped Supabase reads and account switching

- Task: Populate the dashboard with real Supabase-backed data where available and add a persistent business/ad-account switcher for operators moving across connected accounts.
- Context: The user confirmed the current UI was mostly mock-backed and asked for real account data plus the ability to switch between connected accounts, especially ad accounts, as the dashboard grows.
- Files changed: `app/(dashboard)/ads/page.tsx`; `app/(dashboard)/ads/campaigns/page.tsx`; `app/(dashboard)/ads/adsets/page.tsx`; `app/(dashboard)/ads/ads/page.tsx`; `app/(dashboard)/archive/page.tsx`; `app/(dashboard)/archive/events/page.tsx`; `app/(dashboard)/archive/messages/page.tsx`; `app/(dashboard)/connected-accounts/page.tsx`; `app/(dashboard)/contacts/page.tsx`; `app/(dashboard)/contacts/[contactId]/page.tsx`; `app/(dashboard)/inbox/page.tsx`; `app/(dashboard)/inbox/[conversationId]/page.tsx`; `app/(dashboard)/layout.tsx`; `app/(dashboard)/leads/page.tsx`; `app/(dashboard)/leads/[leadId]/page.tsx`; `app/(dashboard)/overview/page.tsx`; `app/(dashboard)/settings/page.tsx`; `app/(dashboard)/settings/audit/page.tsx`; `app/(dashboard)/settings/security/page.tsx`; `app/api/ads/route.ts`; `app/api/ads/insights/route.ts`; `app/api/archive/events/route.ts`; `app/api/archive/messages/route.ts`; `app/api/connected-accounts/route.ts`; `app/api/inbox/conversations/route.ts`; `app/api/inbox/conversations/[conversationId]/route.ts`; `app/api/leads/route.ts`; `app/api/leads/[leadId]/route.ts`; `app/api/portal/commands/route.ts`; `app/api/portal/targets/route.ts`; `components/app-shell/account-switcher.tsx`; `components/app-shell/app-header.tsx`; `components/contacts/contacts-workspace.tsx`; `components/inbox/inbox-workspace.tsx`; `components/leads/leads-workspace.tsx`; `lib/dashboard/scope.ts`; `lib/repositories/dashboard-repository.ts`; `lib/services/ads-service.ts`; `lib/services/archive-service.ts`; `lib/services/connected-accounts-service.ts`; `lib/services/contacts-service.ts`; `lib/services/inbox-service.ts`; `lib/services/leads-service.ts`; `lib/services/overview-service.ts`; `lib/services/portal-service.ts`; `lib/services/settings-service.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- Commands run: `Get-Content -Raw README.md`; `Get-Content -Raw .agent/project_overview.md`; `Get-Content -Raw .agent/session_handoff.md`; `Get-Content -Raw .agent/open_issues.md`; `Get-Content -Raw .agent/decisions.md`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `rg -n ...`; `Get-Content -Raw ...` across `app/`, `components/`, `lib/`, `types/`, and `supabase/migrations/`; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `Get-Date -Format o`; `git status --short --branch`
- Errors encountered: The first repository rewrite patch exceeded the Windows command-size limit for `apply_patch`, so the file had to be recreated in smaller chunks. `next build` initially failed because the new `useSearchParams`-based account switcher needed a `Suspense` boundary in the app header.
- Fix or decision: Added a shared dashboard scope model backed by `businessId` and `adAccountId` URL params, rewired dashboard services and API routes to accept that scope, replaced mock-first service reads with Supabase admin reads plus fallback behavior, and added a header account switcher that persists scope across server-rendered routes. Wrapped the switcher in `Suspense` to satisfy App Router build requirements.
- Rationale: Real account visibility needs one consistent scoping model across UI pages and API routes; otherwise each surface drifts into its own filter behavior and account switching becomes unreliable.
- Rollback plan: Revert the scoped page/API signature changes, remove `components/app-shell/account-switcher.tsx` and `lib/dashboard/scope.ts`, restore the prior mock-only `lib/repositories/dashboard-repository.ts`, and revert the `.agent/` updates.
- Next steps: Wire scheduled or on-demand Meta sync jobs so `connected_businesses`, `connected_assets`, `ad_accounts`, ads insights, inbox records, and lead tables stay current without manual database seeding. Add UI for switching other asset classes if operators need per-page or per-Instagram/Page granularity beyond business and ad-account scope.

## 2026-04-02T13:12:14-05:00 | Deploy dashboard under /meta-dashboard while preserving root webhook

- Task: Move the live dashboard to `https://tjware.me/meta-dashboard`, keep the existing Meta callback URL working, and redeploy production.
- Context: The user wanted the dashboard served under a path on the apex domain instead of the root. The repo had no existing `basePath`, so serving under `/meta-dashboard` required app-level routing changes plus a compatibility layer for the already-verified webhook callback at `/api/meta/webhooks`.
- Files changed: `next.config.ts`; `vercel.json`; `lib/config/base-path.ts`; `components/privacy/tracking-provider.tsx`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/session_handoff.md`
- Commands run: `Get-Content next.config.ts`; `Get-Content vercel.json`; `rg -n ...`; `Get-Content app\\page.tsx`; `Get-Content components\\privacy\\tracking-provider.tsx`; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npx vercel env add NEXT_PUBLIC_APP_URL production --value https://tjware.me/meta-dashboard --yes --force`; `cmd /c npx vercel deploy --prod --yes`; `node -` (HTTPS checks for `/`, `/meta-dashboard`, `/api/meta/webhooks`, and `/meta-dashboard/api/meta/webhooks`); `Get-Date -Format o`; `git status --short --branch`; `Get-Content .agent/...`
- Errors encountered: The Vercel CLI still required escalated execution for production env/deploy operations. Root-relative client API calls in the privacy tracking provider would have broken under a `basePath` and needed explicit patching.
- Fix or decision: Added `basePath: "/meta-dashboard"` in Next.js, introduced a shared base-path helper for client-side API posts, redirected `/` to `/meta-dashboard` in Vercel, and added a Vercel rewrite so the existing root webhook callback continues to resolve to the new internal route. Updated Vercel production `NEXT_PUBLIC_APP_URL` to `https://tjware.me/meta-dashboard` and redeployed.
- Rationale: This preserves the already-validated Meta callback URL while moving the operator UI under the requested path without requiring a second domain or a Meta re-verification cycle.
- Rollback plan: Remove the Next.js base path and Vercel redirect/rewrite changes, restore the previous `NEXT_PUBLIC_APP_URL`, redeploy production, and revert the `.agent/` memory edits if needed.
- Next steps: Populate the remaining Vercel env vars for full Meta/Supabase integration, then test the live app and webhook POST flow end to end under the new path layout.

## 2026-04-02T13:06:25-05:00 | Complete Meta webhook verification on tjware.me

- Task: Configure the production webhook verify token in Vercel, redeploy the project on the custom domain, and confirm the Meta verification handshake succeeds.
- Context: DNS had been updated to point `tjware.me` and `www.tjware.me` at Vercel, but Meta still reported callback validation failure. The next step was to set `META_WEBHOOK_VERIFY_TOKEN` in Vercel and prove the deployed GET handler returns the challenge correctly on the custom domain.
- Files changed: `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- Commands run: `cmd /c npx vercel env add --help`; `node -` (generate random token); `cmd /c npx vercel env add META_WEBHOOK_VERIFY_TOKEN production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes`; `node -` (HTTPS GET to `https://tjware.me/api/meta/webhooks?...`); `node -` (HTTPS GET to both `tjware.me` and `www.tjware.me`); `Get-Date -Format o`; `git status --short --branch`; `Get-Content .agent/...`
- Errors encountered: `npx vercel` continued to hit local npm-cache permission issues for some read-only CLI checks, so verification switched to direct Node HTTPS requests instead of PowerShell/curl or additional CLI inspection.
- Fix or decision: Generated a strong verify token, stored it in Vercel production as `META_WEBHOOK_VERIFY_TOKEN`, redeployed production, and confirmed the live webhook endpoint returns `200` with the exact challenge body on both `tjware.me` and `www.tjware.me`. The user then confirmed Meta accepted the webhook verification.
- Rationale: The webhook verify token must match between Meta and the deployed app, and validating the exact challenge flow removes ambiguity about route or domain behavior.
- Rollback plan: Remove or rotate the Vercel `META_WEBHOOK_VERIFY_TOKEN` value if it should not remain active, then redeploy production. Revert the `.agent/` memory edits if this record is incorrect.
- Next steps: Add the remaining production Vercel env vars for Meta signing and Supabase persistence, especially `META_WEBHOOK_APP_SECRET`, `META_APP_ID`, `META_APP_SECRET`, `META_SYSTEM_USER_ACCESS_TOKEN`, `SUPABASE_*`, and `ENCRYPTION_KEY`.

## 2026-04-02T11:49:03-05:00 | Initialize local Supabase config and assess remote link blocker

- Task: Set up the local Supabase CLI project structure and attempt to authenticate/link the workspace to the remote Supabase project.
- Context: The user provided Supabase project identifiers and connection details for the Meta Dashboard project and asked to run the Supabase setup flow. The repo already had `supabase/migrations/` but no local CLI config files.
- Files changed: `supabase/.gitignore`; `supabase/config.toml`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/session_handoff.md`
- Commands run: `where.exe supabase`; `supabase --version`; `Get-ChildItem supabase -Force`; `git status --short --branch`; `cmd /c npx supabase --version`; `cmd /c npx supabase link --help`; `cmd /c npx supabase login --help`; `cmd /c npx supabase login --token ...`; `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c npx supabase login --token ...`; `cmd /c npx supabase init`; `Get-ChildItem supabase -Force`; `Get-Content supabase\\config.toml`; `cmd /c npx supabase link --project-ref gnxznznucmrcbriohqdl --yes`; `Get-Date -Format o`; `git status --short --branch`
- Errors encountered: There is no globally installed `supabase` CLI, so the workflow depended on `npx supabase`. The default npm cache and then sandboxed process spawning both triggered Windows `EPERM` errors until `supabase init` was rerun with escalation. The provided token failed CLI validation because it was not in Supabase access-token (`sbp_...`) format. The remote link step could not proceed because a valid Supabase access token or the remote Postgres password was not available.
- Fix or decision: Initialized the local Supabase project with `supabase init`, which created `supabase/config.toml` and `supabase/.gitignore`. Did not store any provided credentials in repo files. Stopped before remote linking because the credentials were insufficient for a safe non-interactive link.
- Rationale: Local CLI config is useful immediately for migrations and later `supabase` workflows, but remote linking should only be done with valid CLI auth or the actual database password.
- Rollback plan: Remove `supabase/config.toml` and `supabase/.gitignore` if local Supabase CLI scaffolding is not wanted. Delete the temporary workspace-local `.npm-cache/` directory if it should not remain in the worktree.
- Next steps: Obtain either a valid Supabase CLI access token in `sbp_...` format or the real remote Postgres password, then rerun `supabase link --project-ref gnxznznucmrcbriohqdl`.

## 2026-04-02T11:45:38-05:00 | Deploy Meta dashboard and attach tjware.me in Vercel

- Task: Identify the production webhook callback path, deploy the linked Vercel project, attach `tjware.me` and `www.tjware.me`, and document the remaining activation steps.
- Context: The user needed a live Meta webhook callback URL for validation and wanted to use `tjware.me` with the existing GitHub, Vercel, and Supabase setup. The repo already contained a linked Vercel project under `.vercel/project.json` and a webhook route at `app/api/meta/webhooks/route.ts`.
- Files changed: `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- Commands run: `Get-Content .env.example`; `rg -n "webhook|META_WEBHOOK|verify" app lib types`; `git remote -v`; `Get-ChildItem supabase\\migrations | Sort-Object Name | Select-Object -ExpandProperty Name`; `Get-Content app\\api\\meta\\webhooks\\route.ts`; `Get-Content lib\\config\\env.ts`; `git rev-parse HEAD`; `Get-ChildItem -Recurse .vercel`; `Get-Content .vercel\\project.json`; `where.exe vercel`; `cmd /c npx vercel --version`; `cmd /c npx vercel deploy --prod --yes`; `Invoke-WebRequest .../api/meta/webhooks`; `curl.exe -I .../api/meta/webhooks`; `cmd /c npx vercel alias ls`; `cmd /c npx vercel --help`; `cmd /c npx vercel project ls`; `cmd /c npx vercel domains ls`; `cmd /c npx vercel domains add tjware.me`; `cmd /c npx vercel domains add www.tjware.me`; `Get-Date -Format o`; `git branch --show-current`; `git rev-parse --short HEAD`; `git status --short --branch`
- Errors encountered: Local HTTP checks from this machine failed with TLS/Schannel credential errors, so endpoint reachability could not be confirmed from the desktop client. `npx vercel domains ...` initially failed with Windows `EPERM` errors in the default npm cache and then with sandbox-related process-spawn restrictions until rerun with escalated permission.
- Fix or decision: Used the linked Vercel project to create a live production deployment at `https://meta-dashboard-three.vercel.app`, confirmed the project is active in the `byoroofers-projects` scope, and added `tjware.me` plus `www.tjware.me` to that project in Vercel. Recorded the DNS targets Vercel requested and the remaining environment-variable requirement for Meta webhook verification.
- Rationale: Meta webhook validation requires a public HTTPS callback URL. Deploying first and attaching the intended domain avoids guessing routes and gives the next step a stable target.
- Rollback plan: Remove `tjware.me` and `www.tjware.me` from the `meta-dashboard` Vercel project if the domain assignment is wrong, then redeploy or re-alias as needed. Delete the workspace-local `.npm-cache/` directory if it is not needed for later CLI use.
- Next steps: Create the DNS records Vercel requested for `tjware.me`, set the required Vercel environment variables including `META_WEBHOOK_VERIFY_TOKEN` and `META_WEBHOOK_APP_SECRET`, then validate the webhook against `https://tjware.me/api/meta/webhooks`.

## 2026-04-01T11:39:33-05:00 | Initialize persistent agent workflow

- Task: Audit the repository for existing agent instructions and memory systems, then scaffold a durable agent workflow.
- Context: The repo already had `README.md` with product, architecture, and run/build guidance, but no `AGENTS.md`, no `.agent/` directory, and no structured cross-session memory files.
- Files changed: `AGENTS.md`; `.agent/project_overview.md`; `.agent/architecture_notes.md`; `.agent/work_log.md`; `.agent/decisions.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- Commands run: `Get-ChildItem -Force`; `rg --files --hidden ...`; `Get-Content README.md`; `Get-Content package.json`; `Get-Content .gitignore`; `Get-ChildItem app,components,lib,supabase,types -Recurse -File`; `Get-Date -Format o`; `git branch --show-current`; `git rev-parse --short HEAD`; `git status --short`
- Errors encountered: An initial `rg` audit query produced no useful hits and was replaced with a file-oriented scan. `git status --short` emitted environment-specific warnings while trying to read `C:\\Users\\warep/.config/git/ignore`.
- Fix or decision: Established tracked `.agent/` Markdown files as the canonical durable memory system and recorded the README migration-list drift as an open issue instead of copying stale assumptions into agent docs.
- Rationale: Future agents need repo-specific startup guidance, searchable work history, explicit rollback information, and reliable handoff state across sessions.
- Rollback plan: Remove `AGENTS.md` and the `.agent/` directory, or revert the commit that introduces them once committed.
- Next steps: Keep all `.agent/` files current after meaningful work. On a future docs pass, reconcile `README.md` with migrations `0007` through `0009`.
