# Open Issues

Purpose: track unresolved technical risks, bugs, debt, and documentation drift. Mark items resolved in place instead of deleting them.

## OPEN-2026-04-02-06 | Production Supabase schema is missing importer tables

- Status: resolved 2026-04-03T00:20:18-05:00
- Area: database
- Summary: The remote schema gap was resolved by linking the Supabase CLI to project `gnxznznucmrcbriohqdl` and pushing migrations through `0010`. `public.sync_jobs` now exists and the production importer endpoint returns success.
- Impact: Database schema is no longer the hard blocker for production import.
- Next action: None for this issue. Follow the active Meta-access issue below instead.

## OPEN-2026-04-03-07 | Production Meta import succeeds but returns zero connected businesses

- Status: open
- Area: Meta access
- Summary: After the production Supabase schema was fixed on April 3, 2026, `POST /meta-dashboard/api/meta/import` returned success with zero counts across businesses, assets, ad accounts, campaigns, ads, lead forms, and leads. This indicates the configured system user token is valid enough for the client to run but `GET /me/businesses` is returning no connected businesses.
- Impact: The dashboard backend is healthy, but the live UI remains empty because the configured Meta token currently has no visible business scope to import.
- Next action: In Meta Business Settings, ensure the system user is attached to the correct business, has an app role on the developer app, and has the Elite Cleaning business assets assigned before rerunning the import.

## OPEN-2026-04-02-05 | Production env config remains incomplete after webhook verification

- Status: open
- Area: deployment
- Summary: `tjware.me` is live, the password gate is active, generated data has been removed, and the `/api/meta/import` route is deployed. The core Meta runtime env vars and `SUPABASE_SERVICE_ROLE_KEY` are now set in Vercel production, but some non-blocking envs such as `SUPABASE_DB_URL` and `ENCRYPTION_KEY` may still be absent.
- Impact: The importer is no longer blocked by the main Meta env contract, but other server features may still need the remaining envs and production configuration remains only partially complete.
- Next action: Finish any remaining production env setup from `.env.example`, but prioritize applying the missing Supabase schema because that is the current hard blocker for live import.

## OPEN-2026-04-01-04 | Auth and MFA remain unfinished

- Status: open
- Area: security
- Summary: `README.md` lists real admin auth and MFA enforcement as remaining work, so current access control assumptions should be treated as incomplete.
- Impact: Security-sensitive changes should confirm whether the current surface is still scaffolded or partially mocked before relying on it.
- Next action: Audit `lib/auth` and the dashboard route protections before making claims about production-ready admin access.

## OPEN-2026-04-01-03 | Portal target adapters are scaffolded, not fully integrated

- Status: open
- Area: portal
- Summary: Portal command surfaces and dispatch placeholders exist, but target-specific live integrations are not fully wired.
- Impact: UI and route behavior may present capabilities that are not yet backed by real external execution.
- Next action: Trace `app/api/portal/**` and `lib/services/portal-service.ts` before extending portal features.

## OPEN-2026-04-01-02 | Live dashboard reads still depend on Supabase population and incomplete sync pipelines

- Status: open
- Area: data integration
- Summary: Primary dashboard services now read from Supabase when admin config and table data are present, but they still fall back to mock data when live tables are empty or unavailable, and the external Meta sync layer that should keep those tables current is not finished.
- Impact: Operators can now scope the UI to real connected businesses and ad accounts, but production usefulness still depends on backfilling and continuously syncing the underlying Supabase tables.
- Next action: Implement the actual sync/refresh paths for connected businesses/assets, ad accounts and insights, leads, and inbox history so the new scoped reads stay current without manual database seeding.

## OPEN-2026-04-01-01 | README migration list is behind the repo state

- Status: open
- Area: documentation
- Summary: `README.md` tells operators to apply migrations `0001` through `0006`, but the repo currently contains `0007`, `0008`, and `0009` as well.
- Impact: Fresh environments following only the README may miss schema required by current code or future work.
- Next action: Reconcile the documented migration sequence with the full contents of `supabase/migrations/`.
