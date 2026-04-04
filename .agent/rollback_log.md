# Rollback Log

Purpose: make changes reversible. Record changed files, state-changing commands, and explicit reversal steps. Keep newest entries first.

## 2026-04-03T00:20:18-05:00 | Supabase remote migration push and production import retry

- Change summary: Logged the Supabase CLI in with a personal access token, linked the workspace to the remote project, fixed the helper-function migration to use `extensions.digest(...)`, pushed the remaining migrations to the live database, and confirmed the production Meta import now runs successfully but returns zero businesses.
- Files changed: `supabase/migrations/0003_views_and_helper_functions.sql`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- State-changing commands: `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c npx supabase login --token ...`; `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c npx supabase link --project-ref gnxznznucmrcbriohqdl --yes`; `$env:npm_config_cache='D:\\Meta Dashboard\\.npm-cache'; cmd /c "echo y | npx supabase db push --linked"`; `cmd /c curl.exe ... /api/meta/import`
- Reversal steps:
  1. If the helper-function change is undesirable, apply a corrective migration that redefines `public.compute_sha256` in the preferred way rather than editing remote history in place.
  2. If the remote schema should be rolled back, use explicit rollback SQL for the affected objects or restore from database backups; do not assume `db push` is trivially reversible.
  3. Rotate the Supabase CLI access token if it should not remain valid after this session.
  4. Revert the `.agent/` memory-file edits if this record is wrong.
- Notes: The backend path is now healthy enough to import, but the configured Meta system user token currently sees zero businesses/assets.

## 2026-04-02T23:41:50-05:00 | Production env population, forced redeploy, and import diagnosis

- Change summary: Added the user-provided Meta and Supabase admin env vars to Vercel production, forced a fresh production deploy, and confirmed the live import is now blocked by missing Supabase schema tables rather than missing Meta credentials.
- Files changed: `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_WEBHOOK_APP_SECRET production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_APP_ID production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_APP_SECRET production --value ... --yes --sensitive --force`; `cmd /c npx vercel env add META_SYSTEM_USER_ACCESS_TOKEN production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes --force`
- Reversal steps:
  1. Remove or rotate the affected Vercel production env vars if they should be replaced.
  2. Redeploy the Vercel project so any env change takes effect.
  3. Apply the correct Supabase migrations to restore runtime schema if the production project is still meant to back this app.
  4. Revert the `.agent/` memory-file edits if this record is wrong.
- Notes: A direct REST check against Supabase returned `PGRST205` for `public.sync_jobs`, which aligns with the importer failure and indicates the production database schema is incomplete.

## 2026-04-02T18:44:50-05:00 | Remove mock fallback data and redeploy

- Change summary: Removed the remaining generated-data fallbacks from `dashboard-repository.ts` so the dashboard now shows only live persisted data or empty results, then redeployed production.
- Files changed: `lib/repositories/dashboard-repository.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Restore the `mock-data` imports and fallback collections in `lib/repositories/dashboard-repository.ts`.
  2. Redeploy the Vercel project.
  3. Revert the `.agent/` memory-file edits if the recorded state is wrong.
- Notes: After this change, empty dashboards indicate missing live data rather than hidden fallback sample data.

## 2026-04-02T15:53:58-05:00 | Password gate and live auth deployment

- Change summary: Added a simple password-based admin gate with login/logout routes, session-cookie validation, protected proxy enforcement for dashboard pages and internal APIs, set the production password env var, and redeployed.
- Files changed: `.env.example`; `lib/config/env.ts`; `lib/auth/session.ts`; `app/(auth)/login/page.tsx`; `app/api/auth/login/route.ts`; `app/api/auth/logout/route.ts`; `components/auth/login-form.tsx`; `components/app-shell/logout-button.tsx`; `components/app-shell/app-header.tsx`; `proxy.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel env add DASHBOARD_ADMIN_PASSWORD production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Remove `DASHBOARD_ADMIN_PASSWORD` from the Vercel production environment.
  2. Remove `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `components/auth/login-form.tsx`, `components/app-shell/logout-button.tsx`, and `proxy.ts`.
  3. Restore the prior scaffold-only `lib/auth/session.ts` and login page.
  4. Redeploy the Vercel project.
  5. Revert the `.agent/` memory-file edits if the recorded state is wrong.
- Notes: The password value was intentionally not written into repo memory files.

## 2026-04-02T14:04:42-05:00 | Shared ad-account links, Meta import route, and live redeploy

- Change summary: Added a shared ad-account link table, implemented a Graph API importer with a new `/api/meta/import` route, updated the ads/connected-accounts UI to show linked assets and run imports, and redeployed production.
- Files changed: `.env.example`; `types/domain.ts`; `types/database.ts`; `supabase/migrations/0010_shared_ad_account_links.sql`; `lib/config/env.ts`; `lib/meta/client.ts`; `lib/meta/sync-service.ts`; `app/api/meta/import/route.ts`; `components/meta/meta-sync-button.tsx`; `components/ads/ads-workspace.tsx`; `components/connected-accounts/accounts-workspace.tsx`; `components/app-shell/account-switcher.tsx`; `lib/repositories/dashboard-repository.ts`; `lib/services/connected-accounts-service.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel env ls production`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Remove or revert `supabase/migrations/0010_shared_ad_account_links.sql`.
  2. Remove `app/api/meta/import/route.ts`, `lib/meta/sync-service.ts`, and `components/meta/meta-sync-button.tsx`.
  3. Restore the prior one-to-one ad-account repository/UI behavior in `lib/repositories/dashboard-repository.ts`, `components/ads/ads-workspace.tsx`, and `components/connected-accounts/accounts-workspace.tsx`.
  4. Redeploy the Vercel project.
  5. Revert the `.agent/` memory-file edits if needed.
- Notes: The production deploy succeeded and is live on `tjware.me`, but the import route is still blocked by missing production env vars.

## 2026-04-02T13:51:22-05:00 | Live dashboard scope and Supabase-backed reads

- Change summary: Replaced the dashboard's mock-first repository reads with Supabase-backed reads plus mock fallback, added URL-scoped business/ad-account filtering, and introduced a header account switcher that persists scope across pages.
- Files changed: `app/(dashboard)/**/page.tsx`; `app/api/ads/route.ts`; `app/api/ads/insights/route.ts`; `app/api/archive/events/route.ts`; `app/api/archive/messages/route.ts`; `app/api/connected-accounts/route.ts`; `app/api/inbox/conversations/route.ts`; `app/api/inbox/conversations/[conversationId]/route.ts`; `app/api/leads/route.ts`; `app/api/leads/[leadId]/route.ts`; `app/api/portal/commands/route.ts`; `app/api/portal/targets/route.ts`; `components/app-shell/account-switcher.tsx`; `components/app-shell/app-header.tsx`; `components/contacts/contacts-workspace.tsx`; `components/inbox/inbox-workspace.tsx`; `components/leads/leads-workspace.tsx`; `lib/dashboard/scope.ts`; `lib/repositories/dashboard-repository.ts`; `lib/services/ads-service.ts`; `lib/services/archive-service.ts`; `lib/services/connected-accounts-service.ts`; `lib/services/contacts-service.ts`; `lib/services/inbox-service.ts`; `lib/services/leads-service.ts`; `lib/services/overview-service.ts`; `lib/services/portal-service.ts`; `lib/services/settings-service.ts`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/project_overview.md`; `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run typecheck`, `cmd /c npm run lint`, and `cmd /c npm run build`
- Reversal steps:
  1. Remove `components/app-shell/account-switcher.tsx` and `lib/dashboard/scope.ts`.
  2. Restore the previous `components/app-shell/app-header.tsx` and `app/(dashboard)/layout.tsx` without the scoped selector.
  3. Revert `lib/repositories/dashboard-repository.ts` to the prior mock-only adapter.
  4. Revert the page, API, and service signature changes that thread `DashboardScope`.
  5. Revert the `.agent/` memory-file edits if the recorded state is wrong.
- Notes: Build verification passed after wrapping the selector in `Suspense`; no deploy or database mutation was performed in this task.

## 2026-04-02T13:12:14-05:00 | Base-path deployment to /meta-dashboard with webhook compatibility

- Change summary: Moved the live dashboard under `/meta-dashboard`, added compatibility routing so `/api/meta/webhooks` still works on the apex domain, updated `NEXT_PUBLIC_APP_URL`, and redeployed production.
- Files changed: `next.config.ts`; `vercel.json`; `lib/config/base-path.ts`; `components/privacy/tracking-provider.tsx`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel env add NEXT_PUBLIC_APP_URL production --value https://tjware.me/meta-dashboard --yes --force`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Remove `basePath: "/meta-dashboard"` from `next.config.ts`.
  2. Remove the Vercel redirect from `/` to `/meta-dashboard` and the rewrite from `/api/meta/webhooks` to `/meta-dashboard/api/meta/webhooks`.
  3. Remove `lib/config/base-path.ts` and revert the `components/privacy/tracking-provider.tsx` fetch-path updates.
  4. Restore the prior production `NEXT_PUBLIC_APP_URL` value in Vercel.
  5. Redeploy the Vercel project.
- Notes: Verification confirmed `/` redirects to `/meta-dashboard`, `/meta-dashboard` redirects into `/meta-dashboard/overview`, and both the root and base-path webhook URLs answer the Meta challenge correctly.

## 2026-04-02T13:06:25-05:00 | Vercel verify-token activation and successful webhook validation

- Change summary: Added `META_WEBHOOK_VERIFY_TOKEN` to Vercel production, redeployed the `meta-dashboard` project, and updated `.agent` memory to reflect successful Meta webhook verification on `tjware.me`.
- Files changed: `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel env add META_WEBHOOK_VERIFY_TOKEN production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Rotate or remove the Vercel production env var `META_WEBHOOK_VERIFY_TOKEN` if it should be replaced.
  2. Redeploy the Vercel project so the env-var change takes effect.
  3. Revert the `.agent/` memory-file edits if the success state was recorded incorrectly.
- Notes: Webhook verification is complete; remaining deployment work is now about signing secrets and data-layer credentials, not callback reachability.

## 2026-04-02T11:49:03-05:00 | Local Supabase CLI initialization

- Change summary: Initialized local Supabase CLI files for this repo and recorded the unsuccessful remote-link attempt plus credential blocker in `.agent` memory.
- Files changed: `supabase/.gitignore`; `supabase/config.toml`; `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx supabase init`
- Reversal steps:
  1. Remove `supabase/config.toml`.
  2. Remove `supabase/.gitignore`.
  3. Delete `D:\Meta Dashboard\.npm-cache\` if the temporary local npm cache is not wanted.
  4. Revert the `.agent/` memory-file edits if the recorded task details are wrong.
- Notes: The remote Supabase project was not linked because the provided credential was not a valid CLI token and no database password was available.

## 2026-04-02T11:45:38-05:00 | Vercel production deploy and domain attachment

- Change summary: Created a fresh production deployment for `meta-dashboard`, attached `tjware.me` and `www.tjware.me` to the Vercel project, and updated `.agent` memory files with deployment state and follow-up steps.
- Files changed: `.agent/work_log.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes`; `cmd /c npx vercel domains add tjware.me`; `cmd /c npx vercel domains add www.tjware.me`
- Reversal steps:
  1. Remove `tjware.me` and `www.tjware.me` from the `meta-dashboard` project in Vercel if the domain assignment should be undone.
  2. If the new production deployment should not remain active, use Vercel rollback/promote controls to point production back to the previous deployment.
  3. Delete `D:\Meta Dashboard\.npm-cache\` if the temporary local npm cache is not wanted in the workspace.
  4. Revert the `.agent/` memory-file edits if this session record is incorrect.
- Notes: No runtime source files were edited. DNS and environment configuration remain incomplete, so the custom-domain webhook is not ready for Meta validation yet.

## 2026-04-01T11:39:33-05:00 | Scaffold agent workflow files

- Change summary: Added `AGENTS.md` and initialized the tracked `.agent/` memory system.
- Files changed: `AGENTS.md`; `.agent/project_overview.md`; `.agent/architecture_notes.md`; `.agent/work_log.md`; `.agent/decisions.md`; `.agent/rollback_log.md`; `.agent/open_issues.md`; `.agent/session_handoff.md`
- State-changing commands: no install/build/test commands were run; file creation only
- Reversal steps:
  1. Review whether any later session added meaningful history that should be preserved.
  2. Remove `AGENTS.md`.
  3. Remove the `.agent/` directory.
  4. If the files were committed, prefer reverting the commit instead of manually deleting tracked history.
- Notes: This change is operational/documentation-only and does not alter runtime behavior.
