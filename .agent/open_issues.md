# Open Issues

## OPEN-2026-04-06-18 | Marketplace live adapters require API keys and explicit enablement

- Status: open
- Area: marketplace ingestion / legal review
- Summary: Official API adapters now exist for eBay Browse and SerpApi Google Shopping, but they are gated behind env vars (`EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_MARKETPLACE_ID`, `SERPAPI_API_KEY`). Without these keys, scans fall back to demo-only data.
- Impact: The UI and pipeline are ready, but live comparable coverage is still limited until API keys are configured and rate limits/terms are reviewed per source.
- Next action: Add the required API keys in the target environment, confirm the intended marketplaces/regions, and run a manual scan to validate live data ingestion and pricing analysis.

## OPEN-2026-04-06-17 | Scheduled scans and alerts are manual-run only

- Status: resolved 2026-04-06T18:34:20-05:00
- Area: marketplace automation
- Summary: Added a Vercel cron entry to call `POST /meta-dashboard/api/marketplace-deals/schedules/run` hourly.
- Impact: Saved searches can now execute on schedule once the cron is active in the project.
- Next action: Monitor the alert inbox to confirm scheduled runs are firing as expected.

## OPEN-2026-04-06-15 | Brooke Vinson IG history still appears incomplete after the Page-backed fix

- Status: open
- Area: Instagram history completeness
- Summary: On April 6, 2026, scoped syncs gained `conversationSourceDiagnostics` metadata and the first live run exposed that the IG importer had regressed to the direct `/{ig-business-account-id}/conversations` edge, which Meta rejected with capability error `(#3)`. After switching back to the Page-backed Instagram conversations edge and redeploying production, `Brooke Vinson` moved from `1` to `2` conversations and connected-asset logs now show `109` messages total. One of those new threads (`tjwareforcongress conversation`) currently has `0` imported messages, and the new diagnostics are not yet visible through a normal dashboard API/UI surface.
- Impact: The importer is healthier and no longer fails immediately on the IG capability error, but Instagram history completeness is still unresolved and operators cannot yet inspect the raw conversation-source diagnostics without database access.
- Next action: Read the latest `sync_jobs.metadata.conversationSourceDiagnostics` for the Brooke asset, confirm Meta's returned conversation/page counts for that job, and determine whether the zero-message `tjwareforcongress` thread is empty on Meta or still missing message-page import coverage.

## OPEN-2026-04-05-14 | Full Meta import now times out on Vercel with multi-page messaging backfill

- Status: open
- Area: runtime / Meta importer
- Summary: Production now supports a multi-page messaging token map and a fallback import path for configured pages that are not discovered through the system-user business listing. On April 5, 2026, production `GET /api/meta/status` confirmed `metaMessagingPageOverrideCount: 2` for Elite Cleaning and TJ Ware for Congress. A fresh live `POST /api/meta/import` still timed out at the Vercel function layer with `FUNCTION_INVOCATION_TIMEOUT`, so a scoped sync path was shipped later on April 5, 2026 for selected businesses/assets. On April 6, 2026, Brooke Vinson scoped sync was revalidated successfully after the IG request-node fix and now shows `2` conversations in production, but the full cross-page import path still exceeds the request runtime budget.
- Impact: Full one-shot production sync is still unreliable. Scoped sync is now the confirmed production workaround for Brooke Vinson, but TJ Ware for Congress and any broader cross-page refresh still depend on splitting the importer further or moving the job off the request runtime.
- Next action: Keep using scoped sync for individual inbox assets, then split the remaining full import into smaller runtime-safe phases or move it to an asynchronous/background execution path before expecting multi-page production refreshes to finish reliably.

## OPEN-2026-04-05-13 | Social engagement bot is standalone and not operator-reviewed in-app

- Status: open
- Area: automation
- Summary: The new Python social engagement bot under `automation/social_engagement_bot` stores dedupe state and drafted replies in local files only. It now has a safer dry-run and intent-gated workflow, but it is still not connected to dashboard auth, Supabase persistence, or an in-app approval queue.
- Impact: The bot is usable as a local standalone service, but operators cannot review drafts, audit reply history, or manage configuration from the dashboard UI yet.
- Next action: Decide whether to keep the bot local-only or add a shared persistence and approval workflow before enabling live auto-posting in production.

## OPEN-2026-04-04-12 | Call/video-call coverage depends on Meta webhook payload availability

- Status: open
- Area: Meta event coverage
- Summary: The new immutable communication archive now preserves raw webhooks, normalized message copies, outbound sends, and historical message imports in separate append-only tables. Call/video-call retention depends on whether Meta delivers those events through the connected webhook/API payloads for the linked assets.
- Impact: Message retention is materially improved now, but guaranteed call/video-call archival cannot be claimed until live payloads are observed and normalized from the connected Meta assets.
- Next action: Trigger real Messenger/Instagram call and video-call activity on a connected asset, inspect the archived raw webhook payloads, and extend event classification if Meta exposes richer call states than the current generic raw archive capture.

## OPEN-2026-04-04-11 | Historical inbox import depends on page-level messaging access

- Status: open
- Area: Meta permissions
- Summary: The importer now includes historical inbox backfill, but those reads still depend on a usable page access token and the relevant messaging permissions for Page/Instagram conversation history. Live production syncs on April 4-5, 2026 still returned `conversations=0`, `messages=0`, and `inboxHistorySkipped=1`. Meta's token debugger confirmed the current system-user token is valid but does not include `pages_messaging` or `instagram_manage_messages`, and the April 5, 2026 production sync returned the exact Meta error `(#200) Requires permission: pages_messaging or User associated with the Page access token does not have an appropriate role on the Page.`
- Impact: Ads and account data can import successfully while inbox history remains partially or fully empty for assets that lack message-history access.
- Next action: Publish the app, obtain a token that actually includes `pages_messaging` and `instagram_manage_messages`, and verify the Page token's associated user has an appropriate role on the Page, then rerun the import.

## OPEN-2026-04-04-09 | leads_retrieval permission not granted on Meta app

- Status: open
- Area: Meta permissions
- Summary: The Meta app does not have `leads_retrieval` approved. Lead forms and leads are skipped gracefully during import (403 is caught, import continues). Meta's token debugger on 2026-04-04 also confirmed the current production token does not include `leads_retrieval`. No leads appear in the dashboard until this is resolved.
- Impact: Lead pipeline page will be empty even after a successful sync.
- Next action: In Meta for Developers → App Dashboard → App Review → Permissions, request `leads_retrieval`. Once approved, re-sync and leads will populate.

## OPEN-2026-04-04-10 | System user not a business portfolio member

- Status: open
- Area: Meta access
- Summary: System user has direct asset access but is not a member of the Elite Cleaning business portfolio. The import uses a direct-asset fallback (`/me/accounts`, `/me/adaccounts`) which works correctly. Long-term this is cleaner through the proper business path.
- Impact: None currently — fallback works. If more businesses are added later, they won't be auto-discovered.
- Next action: In Meta Business Settings, add the system user to Elite Cleaning business as Employee.

## OPEN-2026-04-03-08 | README migration list is behind actual migration state

- Status: resolved 2026-04-06T16:12:41-05:00
- Area: documentation
- Summary: The README migration list now includes `0001` through `0013`, including marketplace migrations and alerts/scheduling.
- Impact: Fresh environments can follow README without missing marketplace tables.
- Next action: None.



Purpose: track unresolved technical risks, bugs, debt, and documentation drift. Mark items resolved in place instead of deleting them.

## OPEN-2026-04-02-06 | Production Supabase schema is missing importer tables

- Status: resolved 2026-04-03T00:20:18-05:00
- Area: database
- Summary: The remote schema gap was resolved by linking the Supabase CLI to project `gnxznznucmrcbriohqdl` and pushing migrations through `0010`. `public.sync_jobs` now exists and the production importer endpoint returns success.
- Impact: Database schema is no longer the hard blocker for production import.
- Next action: None for this issue. Follow the active Meta-access issue below instead.

## OPEN-2026-04-03-07 | Production Meta import succeeds but returns zero connected businesses

- Status: resolved 2026-04-04T12:00:00-05:00 via direct-asset fallback (commit 665d47a). Import now populates live data using /me/accounts and /me/adaccounts.
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

- Status: resolved 2026-04-06T16:12:41-05:00
- Area: documentation
- Summary: The README now lists migrations `0001` through `0013`.
- Impact: Documentation is aligned with the repo migration set.
- Next action: None.
