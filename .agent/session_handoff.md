# Session Handoff

- Last updated: 2026-04-06T10:55:13.2914491-05:00
- Branch: `main`
- HEAD: `b42360b3314007e3ab3e431f455a4296cf3df5be`
- Worktree status: dirty with multiple in-progress tasks.
  - Modified: `.agent/open_issues.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`, `.agent/work_log.md`, `app/api/archive/messages/route.ts`, `components/archive/archive-workspace.tsx`, `lib/meta/client.ts`, `lib/meta/message-preservation.ts`, `lib/meta/sync-service.ts`, `lib/repositories/dashboard-repository.ts`, `lib/services/archive-service.ts`, `types/database.ts`, `types/domain.ts`
  - Also modified in this pass: `.env.example`, `lib/config/env.ts`
  - Also modified in this pass: `README.md`, `components/app-shell/app-sidebar.tsx`, `lib/navigation.ts`, `.agent/project_overview.md`
  - New: `app/api/connected-assets/[assetId]/logs/route.ts`, `lib/archive/communication-archive.ts`, `lib/services/connected-asset-logs-service.ts`, `supabase/migrations/0011_immutable_communication_archive.sql`
  - New in this pass: `app/(dashboard)/marketplace-deals/**`, `app/api/marketplace-deals/**`, `components/marketplace/**`, `lib/marketplace/**`, `lib/repositories/marketplace-deals-repository.ts`, `lib/services/marketplace-deals-service.ts`, `supabase/migrations/0012_marketplace_deals.sql`, `types/marketplace.ts`
  - Also modified in this pass: `components/inbox/inbox-workspace.tsx`, `components/meta/meta-sync-button.tsx`
  - Also modified in this pass: `app/api/meta/import/route.ts`, `components/leads/leads-workspace.tsx`
  - Also added in this pass: `automation/__init__.py`, `automation/social_engagement_bot/**`, `.gitignore`, `README.md`, `.agent/project_overview.md`

---

## Current Project State

Meta Dashboard is the Elite Cleaning internal business dashboard running at `https://tjware.me/meta-dashboard/`. Stack: Next.js App Router, TypeScript, Tailwind, Supabase, Vercel.

Live data status:
- Meta import works for pages, Instagram accounts, ad accounts, campaigns, ad sets, ads, and insights.
- Lead forms/leads are still blocked by missing Meta `leads_retrieval` permission and are skipped gracefully during import.
- Historical inbox import and immutable archive retention are implemented in the current worktree and have been deployed to production.
- The archive page now exposes a browseable immutable communication ledger backed by the append-only archive tables.
- A new API path now exists to retrieve message and lead logs for a single connected asset.
- A fresh live sync was run against production in this session and still returned `0` conversations, `0` messages, and `inboxHistorySkipped: 1`.
- Production `META_SYSTEM_USER_ACCESS_TOKEN` was rotated and production redeployed in this session; the inbox-import result still did not change.
- The importer no longer hardcodes optimistic messaging/lead scopes into stored dashboard state.
- The importer now preserves exact inbox-history skip reasons in sync metadata instead of only incrementing `inboxHistorySkipped`.
- A new live sync on April 5, 2026 captured the exact Meta error for inbox history: `(#200) Requires permission: pages_messaging or User associated with the Page access token does not have an appropriate role on the Page.`
- A new upload-ready `DASH` app icon asset now exists in `public/brand/` as SVG source plus PNG/JPG exports.
- A public Meta data deletion callback route and status page now exist locally, but they are not deployed yet.
- The Meta data deletion callback route is now deployed and verified live on `https://tjware.me/api/meta/data-deletion`.
- A clean root privacy policy URL is now deployed and verified live on `https://tjware.me/privacy`.
- Production now supports a multi-page messaging override map and live config reports `metaMessagingPageOverrideCount: 2`.
- The importer now includes a configured-page fallback path so page IDs present in the token map can be imported even if the system-user discovery path does not enumerate them.
- A fresh production import on April 5, 2026 timed out at Vercel with `FUNCTION_INVOCATION_TIMEOUT` before the multi-page sync completed, so TJ Ware for Congress is not yet confirmed as persisted in connected assets.
- Inbox and Leads now support asset-scoped Meta sync from the current header selection, so operators can populate a selected business/Page/Instagram asset without running the full importer.
- The scoped sync path was further narrowed so an Instagram asset sync only backfills Instagram conversations and a Page asset sync stays Page-specific; the sync button now shows plain-text backend/platform errors instead of crashing on non-JSON responses.
- The Meta client now uses lighter conversation-message fields and lower per-page limits, which fixed the live `Brooke Vinson` IG scoped sync.
- Historical inbox import is now split into four lighter Meta request phases and stores richer thread/profile context in both contact records and archive snapshots.
- Sync jobs and audit logs now persist per-source `conversationSourceDiagnostics`, including requested node ID, raw conversation count, page-count/paging data, imported thread count, imported message count, and raw error text.
- The first live diagnostics run exposed that the IG importer had regressed to the direct `/{ig-business-account-id}/conversations` edge, which Meta rejected with capability error `(#3)`.
- Production now uses the Page-backed Instagram conversations edge again. After redeploy on April 6, 2026, the `Brooke Vinson` scoped inbox moved from `1` to `2` conversations; connected-asset logs now show `2` conversations and `109` messages total, with a second zero-message thread (`tjwareforcongress conversation`) still needing investigation.
- A new local `/marketplace-deals` workflow now exists with saved search presets, manual scans, comparable-listing selection, OpenAI-assisted fair-value estimation, score/risk breakdowns, CSV export, scan history, and operator status/notes.
- The marketplace-deals stack is wired to a new Supabase migration `0012_marketplace_deals.sql`, but the currently enabled source adapters are intentionally demo-only and the feature has not been deployed to production in this session.

---

## What Changed This Session

### Marketplace-deals page, API surface, and Supabase schema
- Added the new dashboard pages:
  - `app/(dashboard)/marketplace-deals/page.tsx`
  - `app/(dashboard)/marketplace-deals/[listingId]/page.tsx`
- Added new marketplace API routes for:
  - saved searches
  - trigger scan
  - fetch results
  - fetch listing detail
  - update listing status/notes
  - export CSV
- Added a new modular marketplace engine under `lib/marketplace/` covering:
  - adapter definitions
  - demo source feeds
  - normalization and dedupe keys
  - comparable-set selection
  - transparent deal scoring
  - OpenAI-assisted pricing analysis with heuristic fallback
  - CSV export
- Added `lib/repositories/marketplace-deals-repository.ts` with:
  - Supabase persistence for saved searches, scan runs, listings, scan results, AI analysis, comparable listings, listing status, and source errors
  - in-memory fallback storage when Supabase admin config is absent
- Added `lib/services/marketplace-deals-service.ts` to orchestrate scans and page-level data loading.
- Added `supabase/migrations/0012_marketplace_deals.sql`.
- Updated `.env.example`, `lib/config/env.ts`, `README.md`, `lib/navigation.ts`, `components/app-shell/app-sidebar.tsx`, and `.agent/project_overview.md` for the new feature.
- Build follow-up:
  - `/marketplace-deals` and `/marketplace-deals/[listingId]` were switched to `dynamic = "force-dynamic"` after the first build showed the page being treated as static output.
- Important limitation:
  - the enabled adapters are demo-only by design; no live marketplace crawling was turned on in this pass.

### Conversation-source diagnostics and Page-backed IG request-node fix
- `lib/meta/client.ts` now exposes paged collection diagnostics for conversation index reads.
- `lib/meta/sync-service.ts` now records `conversationSourceDiagnostics` in both `sync_jobs.metadata` and `audit_logs.metadata` for success and failure cases.
- The diagnostic payload includes:
  - `requestedNodeId`
  - `assetExternalId`
  - `platform`
  - raw conversation count
  - index page count / paging presence
  - imported thread count
  - skipped thread count
  - imported message count
  - raw error text
- The first live deployment of this diagnostics path showed the scoped IG importer was still calling the direct `/{ig-business-account-id}/conversations` edge and failing with `(#3) Application does not have the capability to make this API call.`
- `lib/meta/sync-service.ts` was then corrected so Instagram history requests use the Facebook Page node with `platform=instagram`, while preserving the IG asset external ID for stored thread attribution and diagnostics.
- Production deploys completed:
  - `https://meta-dashboard-3j602ntvx-byoroofers-projects.vercel.app`
  - `https://meta-dashboard-qbbls1h8z-byoroofers-projects.vercel.app`
  both aliased to `https://tjware.me`
- Live verification after the fix:
  - production Brooke Vinson scoped inbox now returns `2` conversations (up from `1`)
  - connected-asset logs for Brooke Vinson now return `2` conversations and `109` messages total
  - the original `brookevinson conversation` still contains the `109` imported messages
  - a second thread, `tjwareforcongress conversation`, currently exists with `0` imported messages

### Standalone Python social engagement bot
- Added `automation/social_engagement_bot/` as an isolated Python package with:
  - env-based configuration and runtime paths
  - keyword matching and reply eligibility filters
  - OpenAI Responses API reply generation
  - Reddit polling/reply support via PRAW
  - Facebook Page post/comment polling and reply posting via Graph API
  - local file-based state and draft logging
  - lightweight `unittest` coverage for keyword matching and prompt construction
- Hardened the bot with:
  - `BOT_ENV_FILE` support for dedicated local env files
  - `BOT_ONE_SHOT` support for safe single-cycle validation
  - `BOT_REQUIRE_QUESTION_OR_INTENT` gating so non-request chatter is skipped
  - draft `status` metadata for simple review tracking
- Added `automation/__init__.py` so the package runs cleanly with `python -m automation.social_engagement_bot.bot`.
- Updated `.gitignore`, `README.md`, and `.agent/project_overview.md` for Python bot setup, run, and test commands.

### Multi-page Meta messaging support
- Added `META_MESSAGING_PAGE_TOKEN_MAP` to `.env.example`.
- `lib/config/env.ts` now resolves per-page messaging tokens from either strict JSON or the relaxed `pageId:token,pageId:token` format, while preserving the legacy single-page env fallback.
- `lib/meta/sync-service.ts` now tracks imported page IDs and will bootstrap configured pages under a synthetic `Configured Page Access` business if they are missing from the system-user discovery path.
- Production Vercel config now includes a two-page token map for Elite Cleaning (`584942724697024`) and TJ Ware for Congress (`285876691277627`).
- Verified live:
  - Elite Cleaning Page token is valid and can read conversations.
  - TJ Ware for Congress Page token is valid and can read conversations.
  - `GET /api/meta/status` now returns `metaMessagingPageOverrideCount: 2`.
- Attempted a fresh production `POST /api/meta/import`, but the request timed out at Vercel (`FUNCTION_INVOCATION_TIMEOUT`) before completion. `GET /api/connected-accounts` afterward still showed only Elite Cleaning assets, so the second page has not yet been confirmed as imported.

### Scoped Meta sync for selected business or asset
- `lib/meta/sync-service.ts` now supports a scoped sync path for the selected connected business or selected Page/Instagram asset. It reuses the page/IG conversation and lead import logic but skips the heavier ad-account, campaign, ad set, ad, and insight phases that push the full import into Vercel timeouts.
- `app/api/meta/import/route.ts` now accepts optional `businessId` and `assetId` values in the request body and dispatches to the scoped path automatically.
- `components/meta/meta-sync-button.tsx` now reads the current URL scope and relabels itself as `Sync selected business` or `Sync selected asset` when applicable.
- `components/leads/leads-workspace.tsx` now exposes the same sync control as Inbox, so both message and lead operators can populate the currently selected asset scope.
- Production was deployed to `https://meta-dashboard-8xhlo0zy6-byoroofers-projects.vercel.app` and aliased to `https://tjware.me`.

### IG-only scoped sync narrowing and sync-button hardening
- The first live `brookevinson` Instagram scoped-sync attempt did not populate rows immediately and the UI surfaced `Unexpected token 'A' ...` because `MetaSyncButton` assumed failed responses were JSON.
- `lib/meta/sync-service.ts` now narrows Instagram asset scoped sync to Instagram conversations only and keeps Page asset scoped sync Page-specific instead of backfilling both surfaces together.
- `components/meta/meta-sync-button.tsx` now reads the response body as text first, only JSON-parses when possible, and shows the actual backend/platform error string when Vercel returns non-JSON output.
- Production follow-up deploys completed:
  - `https://meta-dashboard-nbsl6ic9y-byoroofers-projects.vercel.app`
  - `https://meta-dashboard-dfmjy7yyt-byoroofers-projects.vercel.app`
  both aliased to `https://tjware.me`.

### Lighter IG message-history fetch
- Meta returned a live `500` with code `1` on the IG thread `/messages` edge asking us to reduce request size.
- `lib/meta/client.ts` now fetches lighter message payloads with fields `id,created_time,message,from,attachments{id,mime_type,file_url,name}` and lower per-page limits (`25` for Instagram, `100` for Facebook).
- `lib/meta/sync-service.ts` now passes the platform into `getConversationMessages(...)` and no longer stores the previously requested heavy attachment metadata for historical IG imports.
- Production was deployed to `https://meta-dashboard-edjc8sgki-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- A live scoped sync for asset `Brooke Vinson` (`446290ba-f47b-430c-b475-b3af54b58049`) then succeeded with:
  - `conversations: 1`
  - `messages: 109`
  - `inboxHistorySkipped: 0`
- Live `GET /api/inbox/conversations?assetId=446290ba-f47b-430c-b475-b3af54b58049` now returns one Instagram thread for `brookevinson`.

### Four-phase inbox import and richer archive enrichment
- `lib/meta/client.ts` now supports:
  - `getConversationDetails(...)`
  - `getParticipantProfile(...)`
  - message-page fetches that include recipients but stay on smaller field sets
- `lib/meta/sync-service.ts` now imports inbox history in four lighter request phases:
  1. thread index
  2. thread detail
  3. message pages
  4. participant profile
- Contact upserts now populate `first_name`, `last_name`, and richer `custom_attributes` from Meta participant/profile context.
- The archive layer now receives separate append-only events for:
  - `historical_thread_snapshot`
  - `historical_counterparty_profile_snapshot`
- Imported message archive payloads now include:
  - thread details
  - participant snapshot
  - participant profile
  - recipients
  - request-phase provenance
- Production was deployed to `https://meta-dashboard-repn042ig-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- A follow-up live `Brooke Vinson` scoped sync still succeeded with `1` conversation and `109` messages after this richer import path was deployed.

### IG external-ID fix and direct Meta validation
- `lib/meta/sync-service.ts` no longer uses the internal connected-asset UUID when building IG Graph requests; it now keeps internal IDs for database relations and external Meta IDs for API calls.
- Production was deployed to `https://meta-dashboard-omuhvywsx-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- The user supplied a broader user token for `TJ Ware`. Direct Meta validation with that token confirmed it can see:
  - Elite Cleaning Page `584942724697024` with linked IG `brookevinson` (`17841402289129554`)
  - TJ Ware for Congress Page `285876691277627` with linked IG `tjwareforcongress` (`17841440541760120`)
- Direct Meta conversation tests with that token showed:
  - `/{page-id}/conversations?platform=instagram` returns exactly `1` conversation for Elite Cleaning / `brookevinson`
  - direct `/{ig-business-account-id}/conversations` is rejected with `(#3) Application does not have the capability to make this API call.`
- Conclusion from direct Meta evidence: the remaining “missing dozens of IG conversations” issue is upstream of the dashboard importer once the corrected Graph calls still return only one IG thread.

### Connected-asset log retrieval
- Added `GET /api/connected-assets/[assetId]/logs`.
- Added `lib/services/connected-asset-logs-service.ts` to assemble one connected asset plus its conversations/messages and leads/lead activities.
- Extended `lib/repositories/dashboard-repository.ts` with asset lookup, per-asset conversation reads, and per-asset lead reads.
- Added shared `ConnectedAssetLogs` payload types in `types/domain.ts`.

### Immutable archive visibility
- The archive API/service path now returns `communicationArchive` records sourced from the immutable archive tables.
- Reworked `components/archive/archive-workspace.tsx` into a readable communication archive surface for retained inbound/outbound events, timestamps, and attachment counts.
- Production deploy completed for the browseable archive viewer.

### Archive message population
- Added `dashboardRepository.getMessages(scope)` to aggregate scoped message rows across conversations.
- `lib/services/archive-service.ts` now returns actual messages in the `messages` field.
- `GET /api/archive/messages` now returns populated `messages` together with `communicationArchive` and `messageArchive`.
- The archive messages screen now renders actual message copies instead of only snapshot metadata.

### Inbox population affordance
- Added `MetaSyncButton` directly to the inbox workspace so operators can pull current inbox history from the inbox page.
- Updated sync success feedback to include imported conversation and message counts.
- Updated the inbox empty-state copy so it points operators at the sync action when the dashboard has not been populated yet.

### Live sync verification
- Triggered the deployed `POST /api/meta/import` successfully after logging into production.
- Sync job `5ff0f7f9-a2b9-42f4-ae3c-43b81a3c5349` returned counts: `businesses=1`, `assets=3`, `conversations=0`, `messages=0`, `inboxHistorySkipped=1`, `adAccounts=1`, `campaigns=2`, `adsets=2`, `ads=2`, `insights=15`, `leadForms=3`, `leads=0`.
- Verified `GET /api/inbox/conversations` on production still returns `[]`.

### Token rotation verification
- Updated the production `META_SYSTEM_USER_ACCESS_TOKEN` in Vercel and redeployed production to `https://meta-dashboard-1cnw09g90-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- Triggered another live import after redeploy.
- New sync job `0a188e24-de01-451f-bfde-939420e912ee` still returned `conversations=0`, `messages=0`, and `inboxHistorySkipped=1`.
- Verified `GET /api/inbox/conversations` still returns `[]` after token rotation.

### Scope correctness fix
- Meta's live `debug_token` check confirmed the current production system-user token is valid but lacks `pages_messaging`, `instagram_manage_messages`, and `leads_retrieval`.
- `lib/meta/sync-service.ts` now stops persisting those scopes optimistically for businesses and Instagram assets.
- `.agent/open_issues.md` now records the exact missing-scope evidence instead of only the symptom.

### Inbox skip diagnostics
- `lib/meta/sync-service.ts` now records `inboxHistorySkips[]` with `pageId`, `pageAssetId`, `pageName`, and the exact Meta error message for each skipped inbox-history import.
- Successful syncs now store those diagnostics in `sync_jobs.metadata` and `audit_logs.metadata`.
- The sync detail string now includes the first skip reason for faster operator visibility.

### Latest production sync result
- Triggered another live import on April 5, 2026 while the app was still in Development mode.
- Sync job `0e1953b2-eeeb-42af-81c7-c52013bfd00f` returned `businesses=1`, `assets=3`, `conversations=0`, `messages=0`, `inboxHistorySkipped=1`, `adAccounts=1`, `campaigns=2`, `adsets=2`, `ads=2`, `insights=20`, `leadForms=3`, `leads=0`.
- `GET /api/inbox/conversations` still returned `[]`.
- `GET /api/meta/status` now surfaces the exact skip reason: `(#200) Requires permission: pages_messaging or User associated with the Page access token does not have an appropriate role on the Page.`

### App icon asset
- Added `public/brand/meta-dashboard-app-icon.svg` as the editable source.
- Exported `public/brand/meta-dashboard-app-icon.png` and `public/brand/meta-dashboard-app-icon.jpg` as upload-ready bitmap variants.
- Verified the PNG locally after export.

### Data deletion callback
- Added `app/api/meta/data-deletion/route.ts` for Meta's data deletion callback flow.
- Added `app/data-deletion-status/page.tsx` as the public status page returned by the callback.
- Updated `proxy.ts` to keep both paths public.
- Updated `vercel.json` with a root rewrite so the external callback URL can be `https://tjware.me/api/meta/data-deletion`.
- Deployed production to `https://meta-dashboard-a13rcuhd7-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- Verified `https://tjware.me/api/meta/data-deletion?confirmation_code=test-code` returns success JSON.

### Privacy policy URL
- Rewrote `app/privacy/page.tsx` into a Meta-facing privacy policy page.
- Added a Vercel root rewrite from `/privacy` to `/meta-dashboard/privacy`.
- Deployed production to `https://meta-dashboard-oeb9sh3zg-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- Verified `https://tjware.me/privacy` returns HTTP `200`.

### Existing in-progress work still in the worktree
- Historical inbox import, immutable archive retention, archive viewer, and connected-asset logs work all remain uncommitted in this machine state.
- Archive-related files currently dirty/new include `lib/meta/client.ts`, `lib/meta/message-preservation.ts`, `lib/meta/sync-service.ts`, `types/database.ts`, `lib/archive/communication-archive.ts`, `app/api/archive/messages/route.ts`, `components/archive/archive-workspace.tsx`, `lib/services/archive-service.ts`, and `supabase/migrations/0011_immutable_communication_archive.sql`.

---

## Verification

- `cmd /c npm run typecheck` after marketplace-deals buildout - passed
- `cmd /c npm run lint` after marketplace-deals buildout - passed
- `cmd /c npm run build` after marketplace-deals buildout - passed
- `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m unittest discover -s automation/social_engagement_bot/tests -p "test_*.py"` - passed
- `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m compileall automation/social_engagement_bot` - passed
- `cmd /c npm run typecheck` - passed
- `cmd /c npm run lint` - passed
- `cmd /c npm run build` - passed
- `cmd /c npx tsc --noEmit` - passed
- `cmd /c npx eslint .` - passed
- `cmd /c npx vercel deploy --prod --yes` - passed; deployment `https://meta-dashboard-bcht3f0ja-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Live production sync request - passed; returned sync job `5ff0f7f9-a2b9-42f4-ae3c-43b81a3c5349`
- Live production inbox API verification - passed; returned an empty conversations list
- Production token rotation and redeploy - passed; deployment `https://meta-dashboard-1cnw09g90-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Second live production sync request after token rotation - passed; returned sync job `0a188e24-de01-451f-bfde-939420e912ee`
- Third live production sync request on April 5, 2026 - passed; returned sync job `0e1953b2-eeeb-42af-81c7-c52013bfd00f`
- Local `cmd /c npm run lint` after multi-page support - passed
- Local `cmd /c npm run typecheck` after multi-page support - passed
- Local `cmd /c npm run build` after multi-page support - passed
- Production Vercel env update for `META_MESSAGING_PAGE_TOKEN_MAP` - passed after retrying with PowerShell-native quoting
- Production deploy for multi-page messaging support - passed; deployment `https://meta-dashboard-f725iqfzd-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Production deploy for relaxed token-map parser - passed; deployment `https://meta-dashboard-i32en0jnj-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Live `GET /api/meta/status` - passed; returned `metaMessagingPageOverrideCount: 2`
- Live `POST /api/meta/import` after enabling two-page support - failed at the platform layer with `FUNCTION_INVOCATION_TIMEOUT`
- Live `GET /api/connected-accounts` after the timeout - passed; still showed only Elite Cleaning assets
- Local `cmd /c npm run lint` after scoped sync changes - passed
- Local `cmd /c npm run typecheck` after scoped sync changes - passed
- Local `cmd /c npm run build` after scoped sync changes - passed
- Production deploy for scoped sync and leads-page sync control - passed; deployment `https://meta-dashboard-8xhlo0zy6-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Live production connected-accounts query with admin session - passed; current assets include `Brooke Vinson` (`instagram_professional`), `Elite Cleaning` (`facebook_page`), and `Elite Cleaning Main` (`ad_account`) under business `Direct Asset Access`
- Live production `brookevinson` scoped import attempt - did not return within the client timeout window; immediate post-check still showed `0` inbox conversations and `0` leads for that asset
- Local `cmd /c npm run lint` after IG-only scoped narrowing - passed
- Local `cmd /c npm run typecheck` after IG-only scoped narrowing - passed
- Local `cmd /c npm run build` after IG-only scoped narrowing - passed
- Production deploy for IG-only scoped sync narrowing - passed; deployment `https://meta-dashboard-nbsl6ic9y-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Local `cmd /c npm run lint` after sync-button error handling fix - passed
- Local `cmd /c npm run typecheck` after sync-button error handling fix - passed
- Local `cmd /c npm run build` after sync-button error handling fix - passed
- Production deploy for sync-button error handling fix - passed; deployment `https://meta-dashboard-dfmjy7yyt-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Local `cmd /c npm run lint` after lighter message fetch change - passed
- Local `cmd /c npm run typecheck` after lighter message fetch change - passed
- Local `cmd /c npm run build` after lighter message fetch change - passed
- Production deploy for lighter IG message fetch - passed; deployment `https://meta-dashboard-edjc8sgki-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Live production Brooke Vinson scoped import - passed; sync job `dcd4f40c-3d5a-4e22-950e-947aa4a434e1` returned `1` conversation and `109` messages
- Local `cmd /c npm run lint` after four-phase inbox enrichment - passed
- Local `cmd /c npm run typecheck` after four-phase inbox enrichment - passed
- Local `cmd /c npm run build` after four-phase inbox enrichment - passed
- Production deploy for four-phase inbox enrichment - passed; deployment `https://meta-dashboard-repn042ig-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Live production Brooke Vinson scoped import after four-phase enrichment - passed; returned `1` conversation and `109` messages
- Live connected-asset logs for Brooke Vinson - passed; returned one Instagram conversation log containing the imported message history
- Local `cmd /c npm run lint` after IG external-ID fix - passed
- Local `cmd /c npm run typecheck` after IG external-ID fix - passed
- Local `cmd /c npm run build` after IG external-ID fix - passed
- Production deploy for IG external-ID fix - passed; deployment `https://meta-dashboard-omuhvywsx-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Direct Meta validation with new TJ Ware user token - passed; Elite Cleaning Page-backed Instagram query still returned only `1` conversation, and direct IG `/conversations` returned capability error `(#3)`
- Local `cmd /c npm run typecheck` after conversation-source diagnostics - passed
- Local `cmd /c npm run lint` after conversation-source diagnostics - passed
- Local `cmd /c npm run build` after conversation-source diagnostics - passed
- Production deploy for conversation-source diagnostics - passed; deployment `https://meta-dashboard-3j602ntvx-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- First live Brooke Vinson scoped sync after diagnostics deploy - failed immediately with `(#3) Application does not have the capability to make this API call.` on direct `/{ig-business-account-id}/conversations`, which exposed the wrong request node in production
- Local `cmd /c npm run typecheck` after Page-backed IG request-node fix - passed
- Local `cmd /c npm run lint` after Page-backed IG request-node fix - passed
- Local `cmd /c npm run build` after Page-backed IG request-node fix - passed
- Production deploy for Page-backed IG request-node fix - passed; deployment `https://meta-dashboard-qbbls1h8z-byoroofers-projects.vercel.app` aliased to `https://tjware.me`
- Live production Brooke Vinson inbox query after the Page-backed IG fix - passed; scoped inbox now returns `2` conversations
- Live connected-asset logs for Brooke Vinson after the Page-backed IG fix - passed; returned `2` conversations and `109` messages total

Notes:
- PowerShell path expansion on bracketed route files still requires `-LiteralPath`.
- `cmd /c` remains the safer wrapper on this machine when script runners would otherwise hit PowerShell policy friction.
- If `typecheck` fails on `.next/types/validator.ts` route artifacts, rerun `cmd /c npm run build` first, then rerun `cmd /c npm run typecheck`.

---

## Active Risks And Open Questions

- No UI currently consumes the new connected-asset logs endpoint; it is API-only for now.
- The Python social engagement bot is local and standalone today; it does not have dashboard-backed approvals, audits, or credential management.
- The bot is still heuristic-driven and should stay in `DRY_RUN=true` until real platform samples confirm the keyword and intent filters are selective enough.
- Current inbox population still depends on an operator-triggered Meta sync and the existing Meta permissions/access state; this pass added the inbox-local trigger, not automatic sync.
- Production inboxes are still empty after a fresh live sync because page-level messaging history access is still failing and the importer skipped inbox history on one page.
- Rotating the system-user token did not resolve inbox history import, which makes a remaining Meta page-level permission/access issue more likely than a stale-token issue.
- Any dashboard scope badges or counts derived from `granted_scopes` will now be more conservative until Meta issues a token with the missing messaging/lead scopes.
- The exact production blocker is now confirmed by Meta: missing `pages_messaging` and/or missing Page role on the Page token's associated user.
- Multi-page messaging config is live, but the production importer is now too slow to complete within Vercel's runtime budget when multiple page inbox backfills are included.
- `Brooke Vinson` inbox import is now confirmed working, but leads remain dependent on actual Meta lead-form access and other assets should still be verified individually as they are added.
- The richer thread/profile archive events are being written, but the current archive UI and logs UI do not yet expose all of the new contact `custom_attributes` or every new archive event type explicitly.
- The remaining gap for older `brookevinson` IG conversations is no longer explained by local filtering or the previously wrong ID wiring; current direct Meta responses do not expose those older IG threads to this app.
- The new `conversationSourceDiagnostics` metadata is stored on sync jobs and audit logs, but no UI or API endpoint currently exposes it directly for operators.
- The new zero-message Brooke IG thread (`tjwareforcongress conversation`) may indicate either an empty Meta thread or a remaining message-page gap; the latest diagnostics metadata still needs to be inspected to separate those cases.
- The new icon asset is local only; it still needs to be uploaded manually in Meta.
- The data deletion callback route is live and ready to use in Meta.
- The privacy policy URL is live and ready to use in Meta.
- Leads page will still appear empty against live data until Meta grants `leads_retrieval`.
- Historical inbox import still depends on page-level messaging access and needs a fresh production sync run to confirm real backfill counts.
- The immutable archive now has a viewer, but call/video-call retention is still only guaranteed if Meta actually emits those events in webhook/API payloads for the connected assets.
- The system user is still using the direct-asset fallback path because it is not a business portfolio member.
- README migration docs are still behind the real migration set.
- Auth remains password-gated only; MFA is not implemented.
- Portal target adapters are still scaffolded placeholders.

---

## Recommended Next Action

Choose between these next steps before editing further:
1. Apply `supabase/migrations/0012_marketplace_deals.sql` in the target environment and verify the new marketplace tables exist before expecting persistent marketplace scan history outside the in-memory fallback.
2. Pick the first live marketplace source that is legally and technically acceptable, document its robots/terms/rate-limit boundary, and add it as a dedicated adapter instead of broadening the current demo-only source set.
3. If the user wants to continue the Meta investigation instead, read and surface the latest `conversationSourceDiagnostics` metadata for Brooke Vinson so the zero-message IG thread can be answered without direct database inspection.

Keep these constraints in mind:
1. Use `withBasePath()` from `lib/config/base-path.ts` for any client-side `fetch()` call.
2. Checkpoint for rollback on the importer/archive track is `b42360b3314007e3ab3e431f455a4296cf3df5be`.
3. Before any commit or deploy, rerun `cmd /c npm run typecheck`, `cmd /c npm run lint`, and `cmd /c npm run build`.
