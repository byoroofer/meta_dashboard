# Work Log

Purpose: durable, searchable record of meaningful technical work. Keep newest entries first. Summarize noisy command output instead of pasting raw terminal spam.

## 2026-04-06T18:36:28.2024046-05:00 | Deploy Vercel cron configuration

- Task: Deploy the Vercel cron config for marketplace schedules.
- Context: User asked for Vercel cron first before configuring live API keys and tests.
- Files changed: `vercel.json`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `git add vercel.json .agent/open_issues.md .agent/work_log.md .agent/rollback_log.md .agent/session_handoff.md`; `git commit -m "Add Vercel cron for marketplace schedules"`; `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered: None.
- Fix or decision: Cron now calls `/meta-dashboard/api/marketplace-deals/schedules/run` hourly.
- Rationale: Activates schedule runner without changing application logic.
- Rollback plan: Remove the `crons` block from `vercel.json`, redeploy, and log a correction if needed.
- Next steps: Configure live API keys in Vercel and run a scan to validate ingestion.

## 2026-04-06T18:34:20.9667282-05:00 | Add Vercel cron for marketplace schedules

- Task: Enable scheduled scans by wiring a Vercel cron to the marketplace schedule runner.
- Context: User asked to proceed with Vercel setup before configuring live API keys and testing scans.
- Files changed: `vercel.json`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Date -Format o`
- Errors encountered: None.
- Fix or decision: Added an hourly cron entry for `/meta-dashboard/api/marketplace-deals/schedules/run`.
- Rationale: Cron-ready schedule runner exists; adding the Vercel cron activates scheduled scans without new code.
- Rollback plan: Remove the `crons` block from `vercel.json`, redeploy, and update `.agent/` memory files with a correction if needed.
- Next steps: Deploy the Vercel config change, then add API keys and run a live scan to validate ingestion.

## 2026-04-06T18:27:32.8402188-05:00 | Fix marketplace alert typing and redeploy production

- Task: Resolve the production build failure on the marketplace alerts channel typing, then push and deploy the fix.
- Context: The Vercel production build failed because `channel` inferred as `string` did not satisfy `MarketplaceAlertChannel`.
- Files changed: `lib/services/marketplace-deals-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `git add .`; `git commit -m "Add live marketplace adapters and alerts"`; `git push origin codex/marketplace-deals` (initial attempt failed due to local-origin remote); `git remote set-url origin https://github.com/byoroofer/meta_dashboard.git`; `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`; `git add lib/services/marketplace-deals-service.ts`; `git commit -m "Fix marketplace alert channel typing"`; `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered:
  1. Vercel build failed with `Type 'string' is not assignable to type 'MarketplaceAlertChannel'` at `lib/services/marketplace-deals-service.ts`.
  2. Initial `git push` attempts failed because the clone's `origin` pointed to the local path (`D:\Meta Dashboard`) and Git bash could not create a signal pipe.
  3. The first `vercel deploy` timed out while the build was still running.
- Fix or decision:
  1. Typed `channels` as `MarketplaceAlertChannel[]` and redeployed.
  2. Repointed `origin` to `https://github.com/byoroofer/meta_dashboard.git` and pushed the branch.
  3. Re-ran `vercel deploy --prod --yes` with a longer timeout.
- Rationale: Production must compile cleanly; channel typing needs to match the `MarketplaceAlertChannel` union for alert persistence.
- Rollback plan: Revert commits `fbef02d` and `655e543`, redeploy the prior Vercel deployment, and update `.agent/` memory with a correction if the logged state is inaccurate.
- Next steps: Apply `0013_marketplace_alerts.sql` in the target database, configure API keys, and wire a cron to `POST /api/marketplace-deals/schedules/run`.

## 2026-04-06T15:59:58.7073187-05:00 | Add live marketplace adapters, alerts, and scheduled scans

- Task: Extend the marketplace-deals stack with live source adapters (official APIs), alerting, and schedule-ready scan orchestration while keeping AI pricing grounded in fetched comps.
- Context: The user asked to build the live search engine, enable auto searches and alerts, and use OpenAI only for structured reasoning over fetched listings.
- Files changed: `components/marketplace/marketplace-deals-workspace.tsx`, `components/marketplace/listing-detail-panel.tsx`, `lib/marketplace/adapters/index.ts`, `lib/marketplace/adapters/ebay-browse.ts`, `lib/marketplace/adapters/serpapi.ts`, `lib/marketplace/normalization.ts`, `lib/marketplace/schemas.ts`, `lib/services/marketplace-deals-service.ts`, `lib/repositories/marketplace-deals-repository.ts`, `lib/config/env.ts`, `app/api/marketplace-deals/alerts/route.ts`, `app/api/marketplace-deals/schedules/run/route.ts`, `types/marketplace.ts`, `types/database.ts`, `supabase/migrations/0013_marketplace_alerts.sql`, `.env.example`, `README.md`, plus `.agent/` memory files.
- Commands run: `Get-Date -Format o`; `git clone D:\Meta Dashboard D:\Meta Dashboard\_worktrees\marketplace-engine2`; `git checkout codex/marketplace-deals`; multiple `Get-Content` and `rg -n` inspections.
- Errors encountered:
  1. `apply_patch` hit the Windows command-length limit (`CreateProcessAsUserW failed: 206`), so large files were rebuilt in smaller patches.
  2. The initial git worktree attempt produced a missing directory, so work continued from a clean local clone.
- Fix or decision:
  1. Added official API adapters for eBay Browse and SerpApi Google Shopping, kept sources modular and opt-in based on env configuration.
  2. Added schedule fields and alert storage (`marketplace_alerts`) with a cron-ready runner route and webhook notification option.
  3. Expanded the marketplace UI with live search query, source toggles, schedule configuration, and alert inbox.
- Rationale: Live pricing must be derived from fetched listings and structured AI reasoning, not model memory. Using public APIs keeps access compliant while preserving extensibility for additional sources.
- Rollback plan: Remove the new adapters, alerts routes, and `0013_marketplace_alerts.sql`; restore the marketplace workspace to demo-only behavior; revert `.env.example`, `README.md`, and updated types; update `.agent/` files with a correction entry if needed.
- Next steps: Apply migration `0013_marketplace_alerts.sql` in the target Supabase environment, configure API keys and webhook URL in production, and wire a cron trigger to `POST /api/marketplace-deals/schedules/run`.

## 2026-04-06T12:18:15.2918088-05:00 | Continue live production sync attempts for Elite Cleaning and Brooke Vinson

- Task: Keep pushing the production importer forward by checking current live connected-account state, re-running scoped imports for the Elite Cleaning Page and Brooke Vinson Instagram asset, and verifying whether inbox counts or connected assets changed.
- Context: The user asked to continue trying to sync and import data. Production already had a stale full import stuck in `running` state, TJ Ware for Congress was still not materialized as a connected asset, and the known safe operator path was asset-scoped sync.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: Node HTTPS requests against `https://tjware.me/meta-dashboard/api/auth/login`, `/api/connected-accounts`, `/api/meta/status`, `/api/inbox/conversations`, `/api/meta/import`, and `/api/audit`; `Get-Date -Format o`
- Errors encountered:
  1. Both fresh scoped sync POSTs ended with client-side `ECONNRESET` after the server had already started work.
  2. The production `lastSync` status remains stuck on an earlier full import as `running`, so `/api/meta/status` is not a reliable source for the newest scoped sync counts.
- Fix or decision:
  1. Verified current live state before the new attempts:
     - `All inbox`: `50`
     - `Elite Cleaning`: `48`
     - `Brooke Vinson`: `2`
  2. Fired fresh scoped syncs for:
     - Brooke Vinson IG asset `446290ba-f47b-430c-b475-b3af54b58049`
     - Elite Cleaning Page asset `b0eb466b-1a3e-4324-acd2-68814a67db56`
  3. Confirmed at least one of those requests completed successfully on the server side via a new production audit row:
     - `2026-04-06T17:17:06.874371+00:00`
     - `meta.import_scoped`
     - `success`
  4. Confirmed the post-sync live state did not materially change:
     - `All inbox` stayed `50`
     - `Elite Cleaning` stayed `48`
     - `Brooke Vinson` stayed `2`
     - connected assets still stayed at `3`, so TJ Ware for Congress still is not imported into connected assets
- Rationale: This separated client transport resets from actual server behavior and confirmed the production importer is currently plateaued on the available data rather than simply failing to run.
- Rollback plan: No code rollback required. If this log entry is inaccurate, append a correction with the exact production timestamps and counts.
- Next steps: The next productive move is not another blind sync. It is to inspect live `sync_jobs.metadata.conversationSourceDiagnostics` and/or split the full configured-page import path further so TJ Ware for Congress can be materialized without relying on the stale full-import request path.

## 2026-04-06T12:07:44.9811072-05:00 | Populate inbox thread bodies from latest message or preserved Meta snippet

- Task: Make inbox threads show meaningful body text instead of a generic blank/no-body state when a conversation exists but imported `messages` rows are missing.
- Context: After the previous IG fixes, the Brooke Vinson asset had a second Instagram thread in production with zero imported messages. The inbox list and thread view were both driven by `conversation.subject`, so those threads still looked effectively empty even though a preserved Meta snippet existed at the conversation level.
- Files changed: `lib/repositories/dashboard-repository.ts`, `lib/services/inbox-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `rg -n "No body|preview|threadMessages|getInboxData|getConversations" components/inbox components lib/services lib/repositories app/api/inbox types`; `Get-Content components/inbox/inbox-workspace.tsx`; `Get-Content lib/services/inbox-service.ts`; `Get-Content -LiteralPath 'app/api/inbox/conversations/[conversationId]/route.ts'`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `cmd /c npx vercel deploy --prod --yes`; production Node HTTPS checks against inbox conversation list and thread APIs for Brooke Vinson; `Get-Date -Format o`
- Errors encountered:
  1. `typecheck` initially failed because `.next/types/link.d.ts` and `.next/types/validator.ts` were stale/missing; running `cmd /c npm run build` regenerated them and the follow-up `typecheck` passed.
  2. The live Brooke zero-message thread still had no real imported message rows, so only a snippet-level fallback could be shown in this pass.
- Fix or decision:
  1. `dashboardRepository.getConversations(...)` now derives `preview` from the latest real message body when available.
  2. If no message row exists, the repository now falls back to the latest relevant `communication_archive_events` payload snippet before falling back to the subject.
  3. `getInboxData(...)` now injects a single synthetic display-only fallback message when the selected thread has zero imported messages but does have a preserved preview/snippet.
  4. Deployed production and verified the Brooke zero-message thread now returns one non-empty fallback message body instead of `messages: []`.
- Rationale: Operators need the inbox to render usable thread text even when Meta only gave the app a thread-level snippet and no readable message rows. Using the newest imported message body first preserves correctness, and the snippet fallback avoids the dead empty-thread experience without pretending we imported more rows than we actually have.
- Rollback plan: Remove the conversation preview enrichment from `lib/repositories/dashboard-repository.ts`, remove the synthetic fallback message from `lib/services/inbox-service.ts`, redeploy production, and revert these `.agent/` memory-file updates if this record is incorrect.
- Next steps: Keep investigating why some IG threads still have zero imported message rows even after the Page-backed fix, because this pass improves display fidelity but does not manufacture missing Meta message history.

## 2026-04-06T12:02:22.4926547-05:00 | Commit marketplace-deals feature and deploy production from a clean snapshot

- Task: Commit the marketplace-deals feature, record the commit/deploy outcome in repo memory, and deploy production without shipping unrelated dirty files from the local worktree.
- Context: The user asked to commit the work, keep memory current, and deploy the site. The workspace still contained many unrelated in-progress files outside the marketplace-deals scope, so deploying directly from the live worktree would have been unsafe.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `git diff --name-only`; `git checkout -b codex/marketplace-deals`; `git add -- ...marketplace files...`; `git config user.name`; `git commit -m "Add marketplace deals workflow"`; `Get-Date -Format o`; escalated PowerShell command to clone branch `codex/marketplace-deals` into `D:\Temp\meta-dashboard-marketplace-deploy`, copy `.vercel`, and run `cmd /c npx vercel deploy --prod --yes`
- Errors encountered:
  1. The repo already had many unrelated dirty/untracked files, which made a direct production deploy from the working directory too risky.
  2. Deployment therefore had to be rerouted through a clean temporary clone of the committed branch.
- Fix or decision:
  1. Created branch `codex/marketplace-deals`.
  2. Staged only the marketplace-deals feature files and its associated docs/memory updates.
  3. Created commit `ff6cba6` with message `Add marketplace deals workflow`.
  4. Deployed production from a clean temporary clone of that branch.
  5. Vercel production deployment succeeded at `https://meta-dashboard-fesc197vl-byoroofers-projects.vercel.app` and aliased back to `https://tjware.me`.
- Rationale: This preserved the user-requested feature commit and deployment while preventing unrelated local work from being included in production.
- Rollback plan: Redeploy the prior Vercel production build if needed, then revert commit `ff6cba6` or its follow-up memory commit on `codex/marketplace-deals` rather than touching the unrelated dirty files still present in the worktree.
- Next steps: Push branch `codex/marketplace-deals` if the user wants the new commit preserved on the remote, then apply `0012_marketplace_deals.sql` in the target Supabase environment before relying on persistent marketplace scan history there.

## 2026-04-06T10:55:13.2914491-05:00 | Build marketplace-deals page, scan pipeline, and Supabase schema

- Task: Add a new `/marketplace-deals` dashboard surface with saved search presets, manual scans, comparable-listing analysis, OpenAI-powered fair-value estimation, CSV export, operator status tracking, and a Supabase schema for persisted scan history.
- Context: The user requested a production-ready marketplace-deals workflow inside the existing website, but also required strict legal and technical boundaries around crawling. The repository already had a Next.js App Router dashboard shell, Supabase access helpers, and route/service conventions, but no marketplace scanning stack or TypeScript-side OpenAI integration for pricing analysis.
- Files changed: `app/(dashboard)/marketplace-deals/page.tsx`, `app/(dashboard)/marketplace-deals/[listingId]/page.tsx`, `app/api/marketplace-deals/saved-searches/route.ts`, `app/api/marketplace-deals/scans/route.ts`, `app/api/marketplace-deals/results/route.ts`, `app/api/marketplace-deals/listings/[listingId]/route.ts`, `app/api/marketplace-deals/listings/[listingId]/status/route.ts`, `app/api/marketplace-deals/export/route.ts`, `components/app-shell/app-sidebar.tsx`, `components/marketplace/listing-detail-panel.tsx`, `components/marketplace/marketplace-deals-workspace.tsx`, `lib/config/env.ts`, `lib/navigation.ts`, `lib/marketplace/adapters/index.ts`, `lib/marketplace/ai.ts`, `lib/marketplace/comparison.ts`, `lib/marketplace/csv.ts`, `lib/marketplace/demo-data.ts`, `lib/marketplace/normalization.ts`, `lib/marketplace/schemas.ts`, `lib/repositories/marketplace-deals-repository.ts`, `lib/services/marketplace-deals-service.ts`, `supabase/migrations/0012_marketplace_deals.sql`, `types/database.ts`, `types/marketplace.ts`, `README.md`, `.env.example`, `.agent/project_overview.md`, `.agent/open_issues.md`, `.agent/decisions.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Location`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `Get-Content README.md`; `Get-Content .agent/project_overview.md`; `Get-Content .agent/session_handoff.md`; `Get-Content .agent/open_issues.md`; `Get-Content .agent/decisions.md`; multiple `Get-Content` and `rg --files`/`rg -n` inspections across `app`, `components`, `lib`, `types`, and `supabase/migrations`; `Get-Date -Format o`; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`
- Errors encountered:
  1. A large initial `apply_patch` call exceeded the Windows runner command-length limit (`CreateProcessAsUserW failed: 206`), so the implementation was split into smaller full-file patches.
  2. The first `typecheck` pass failed on Next route typing for the new `/marketplace-deals` links and on strict object casts in the new repository; these were fixed by explicit `Route` casts and safer `unknown`-bridge casts.
  3. The first `lint` pass reported one unused import in `components/marketplace/marketplace-deals-workspace.tsx`; the unused `Textarea` import was removed.
  4. The first successful `build` showed `/marketplace-deals` was being treated as static output; both marketplace pages were then switched to `dynamic = "force-dynamic"` so scan history and listing detail render fresh at request time.
- Fix or decision:
  1. Added a dedicated marketplace domain/type boundary in `types/marketplace.ts`.
  2. Added a new marketplace engine under `lib/marketplace/` for criteria schemas, modular adapters, normalization, comparable-set building, transparent deal scoring, CSV export, and OpenAI-assisted pricing analysis with heuristic fallback.
  3. Added a new repository/service layer for persisted saved searches, scan runs, canonical listings, scan results, AI analysis, comparable listings, source errors, and operator status notes, with an in-memory fallback store when Supabase admin config is absent.
  4. Added a new Supabase migration `0012_marketplace_deals.sql`.
  5. Added the `/marketplace-deals` page, `/marketplace-deals/[listingId]` detail page, and API routes for saved searches, scans, results, listing detail, listing status updates, and CSV export.
  6. Integrated the new page into the dashboard sidebar/navigation and updated README/env docs.
  7. Kept the initial enabled adapters demo-only and recorded that as an explicit architectural decision/open issue so live source work remains source-by-source and policy-safe.
- Rationale: This ships the full operator workflow now without violating the user’s no-shady-scraping requirement. The UI, storage, scoring, and AI reasoning are ready immediately, while live marketplace access remains an additive adapter task once a source is legally and technically approved.
- Rollback plan: Remove the `marketplace-deals` pages, API routes, `components/marketplace/`, `lib/marketplace/`, `lib/repositories/marketplace-deals-repository.ts`, `lib/services/marketplace-deals-service.ts`, `types/marketplace.ts`, revert the navigation/env/README/type changes, delete `supabase/migrations/0012_marketplace_deals.sql`, rerun `cmd /c npm run typecheck`, `cmd /c npm run lint`, and `cmd /c npm run build`, then correct these `.agent/` entries if this log is inaccurate.
- Next steps: Choose the first live marketplace source that is acceptable under robots/terms, add a dedicated adapter plus rate-limit policy, and verify end-to-end scans against real fetched comparables instead of the current curated demo feeds.

## 2026-04-06T08:18:27.6835584-05:00 | Add scoped Meta source diagnostics and restore Page-backed IG history reads

- Task: Persist raw per-source Meta conversation diagnostics for scoped/full sync jobs, then use the new production evidence to fix the Instagram history path back to the Page-backed conversations edge.
- Context: The user asked to continue the missing-Instagram-conversations investigation. The importer already stored coarse skip reasons, but not enough evidence to prove what Meta returned per source. After deploying the first diagnostics pass, the next live `Brooke Vinson` scoped sync immediately exposed that the IG branch was still calling `/{ig-business-account-id}/conversations`, which Meta rejects for this app with capability error `(#3)`.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/decisions.md`, `.agent/session_handoff.md`
- Commands run: `Get-Location; git branch --show-current; git rev-parse HEAD; git status --short`; `Get-Content README.md`; `Get-Content .agent/project_overview.md`; `Get-Content .agent/session_handoff.md`; `Get-Content .agent/open_issues.md`; `Get-Content .agent/decisions.md`; multiple `rg -n ... lib/meta/sync-service.ts lib/meta/client.ts`; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build` (twice); `cmd /c npx vercel deploy --prod --yes` (twice); Node HTTPS requests against production auth, scoped import, inbox conversations, and connected-asset logs; `Get-Date -Format o`
- Errors encountered:
  1. The first deployed diagnostics run surfaced the real IG failure in production: `Meta API request failed: 400 Bad Request — https://graph.facebook.com/v22.0/17841402289129554/conversations — (#3) Application does not have the capability to make this API call.`
  2. PowerShell `Invoke-WebRequest` and `curl.exe` both failed on this machine for the production request flow (`unexpected error occurred on a receive`, `schannel: AcquireCredentialsHandle failed`), so the live checks had to switch to a small Node HTTPS script.
  3. The first production sync retry over Node ended with `ECONNRESET`, so follow-up verification was done by querying the scoped inbox/log endpoints after redeploy.
- Fix or decision:
  1. Added paged collection diagnostics in `lib/meta/client.ts`.
  2. `lib/meta/sync-service.ts` now writes `conversationSourceDiagnostics` into `sync_jobs.metadata` and `audit_logs.metadata` for both success and failure cases, including:
     - requested node ID
     - platform
     - raw conversation count
     - index page count / paging presence
     - imported thread count
     - imported message count
     - skipped-thread count
     - raw error text
  3. Fixed the IG history source so it requests Instagram conversations through the Facebook Page node with `platform=instagram`, while keeping the IG asset external ID for stored asset/thread attribution.
  4. Deployed both the initial diagnostics patch and the follow-up IG request-node fix to production.
  5. Verified live after the fix:
     - `Brooke Vinson` inbox scope moved from `1` conversation to `2`
     - connected-asset logs now show `2` IG conversations and `109` messages total
     - the original `brookevinson conversation` still holds the `109` messages
     - a second thread, `tjwareforcongress conversation`, now exists with `0` imported messages
- Rationale: The missing-IG-history investigation needed hard evidence from the sync job itself, not another round of inference. Recording the raw Meta counts exposed one more request-node bug, and switching back to the Page-backed Instagram edge is the only live path this app currently has for Instagram conversation history.
- Rollback plan: Remove the `MetaPagedCollection` diagnostics helper and `conversationSourceDiagnostics` metadata writes, restore the previous IG request-node wiring in `lib/meta/sync-service.ts`, redeploy production, and revert these `.agent/` memory-file updates if this record is incorrect.
- Next steps: Read the latest `conversationSourceDiagnostics` metadata for the Brooke scoped sync, determine whether the new zero-message `tjwareforcongress` thread is empty on Meta or still missing message pages, and keep treating the Page-backed IG edge as the supported import path for this app.

## 2026-04-05T19:51:51.5891345-05:00 | Fix internal-vs-external IG ID usage and verify Meta still returns one IG thread

- Task: Correct the Instagram importer to use the real Meta IG business account ID on Graph API requests, then validate whether a broader user token exposes more Instagram conversations.
- Context: The user said all permissions were present. A live production failure revealed the importer was incorrectly calling `/{internal_asset_uuid}/conversations` for the IG branch. After fixing that, the remaining question was whether Meta would actually return more than one `brookevinson` IG conversation when queried correctly and with the new user token.
- Files changed: `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `rg -n "getConversations\\(|getConversationDetails\\(|getConversationMessages\\(" lib`; `Get-Content lib/meta/sync-service.ts`; `Get-Content lib/meta/client.ts`; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; live `Invoke-RestMethod` / `Invoke-WebRequest` calls against production scoped import and direct Meta Graph endpoints using the newly supplied user token; `Get-Date -Format o`
- Errors encountered:
  1. The IG importer initially used the internal dashboard asset UUID instead of the external Meta IG business account ID, which produced `400 Bad Request` / `Unsupported get request`.
  2. After fixing that bug, direct Meta testing with the new user token still returned only one Instagram conversation on the Page-backed Instagram path.
  3. Direct `/{ig-business-account-id}/conversations` testing with the new token returned `(#3) Application does not have the capability to make this API call.`
- Fix or decision:
  1. Corrected the importer so Graph API calls use the external IG business account ID while database relations continue using the internal connected-asset UUID.
  2. Deployed the fix to production.
  3. Validated the new user token and confirmed it can see the Elite Cleaning Page, the linked `brookevinson` IG business account, and the TJ Ware for Congress Page and linked IG.
  4. Direct Meta evidence now shows:
     - Page `/{page-id}/conversations?platform=instagram` returns exactly `1` conversation
     - direct `/{ig-business-account-id}/conversations` is rejected by Meta with capability error `(#3)`
- Rationale: This separates a real importer bug from an upstream Meta limitation. The dashboard needed the ID fix, but the remaining “missing dozens of IG convos” problem is not caused by local filtering once the Page-backed Instagram query itself still returns only one thread from Meta.
- Rollback plan: Restore the old IG ID wiring in `lib/meta/sync-service.ts`, redeploy production, and revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Treat the missing older IG conversations as a Meta API/capability issue rather than a dashboard storage issue. If the user wants, add explicit sync diagnostics that record raw IG conversation counts and Meta capability errors in scoped sync metadata for future proof.

## 2026-04-05T18:54:23.1561855-05:00 | Split inbox import into four low-volume request phases and enrich archives

- Task: Break the messaging import into four smaller Meta request phases, populate full sent/received inbox history, archive the extra Meta-side thread/profile context, and store more counterparty/user data on the contact record.
- Context: After the `Brooke Vinson` asset import was working again, the user asked to keep request volume low while still pulling all inbox records, richer archived context, and as much user data as possible from Meta for this account.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `rg -n "archiveCommunicationEvent|message_archive|raw_webhook_events|getConversationMessages|getConversations|contacts\\)|external_contact_key|rawPayload|canonicalPayload|attachments" lib types supabase app`; `Get-Content lib/meta/sync-service.ts`; `Get-Content lib/meta/client.ts`; `Get-Content lib/archive/communication-archive.ts`; `Get-Content lib/meta/message-preservation.ts`; `Get-Content types/database.ts`; `Get-Content supabase/migrations/0007_first_party_customer_data.sql`; `Get-Content types/domain.ts`; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; live `Invoke-RestMethod` / `Invoke-WebRequest` calls against production scoped import, connected-asset logs, and archive endpoints; `Get-Date -Format o`
- Errors encountered:
  1. TypeScript rejected a direct cast of the participant profile object to `Record<string, unknown>`; this was fixed by casting through `unknown`.
  2. The usual PowerShell login helper still throws a post-cookie `NullReferenceException`, but the authenticated follow-up production requests continue to work.
- Fix or decision:
  1. Added four lower-weight Meta request phases around historical inbox import:
     - thread index
     - thread detail
     - message pages
     - participant profile
  2. Added `getConversationDetails(...)` and `getParticipantProfile(...)` to the Meta client.
  3. Expanded message-page payloads just enough to include recipients while keeping the smaller request size.
  4. Enriched `resolveOrCreateContact(...)` so it now updates `first_name`, `last_name`, and `custom_attributes` with Meta participant/profile context.
  5. Added append-only archive events for:
     - `historical_thread_snapshot`
     - `historical_counterparty_profile_snapshot`
  6. Expanded each imported message archive payload to include the thread detail snapshot, participant snapshot, participant profile, recipients, and the request phases used.
  7. Deployed production and re-ran `Brooke Vinson` scoped sync successfully.
- Rationale: Smaller request shapes keep Meta’s message endpoints stable, while separate archive snapshots preserve additional thread/profile data without inflating every single `/messages` request or losing raw traceability.
- Rollback plan: Remove the new thread-detail and participant-profile fetches from `lib/meta/client.ts`, revert the contact enrichment and additional archive events in `lib/meta/sync-service.ts`, redeploy production, and revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Use the same scoped sync flow for other assets that need full inbox backfill, and if the user wants the richer user/profile metadata surfaced in the UI, extend the Contacts and Archive pages to render the new contact `custom_attributes` and thread/profile archive events.

## 2026-04-05T18:44:57.9687821-05:00 | Fix IG message-page size and verify Brooke Vinson live import

- Task: Reduce the Meta IG message-history request size enough for the `Brooke Vinson` scoped sync to succeed, then verify the production backfill.
- Context: The user surfaced a concrete Meta error from the live sync: `Please reduce the amount of data you're asking for, then retry your request` on the IG thread `/messages` edge. The current client was still requesting a very large message page with expensive attachment fields.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content lib/meta/client.ts`; `Get-Content lib/meta/sync-service.ts | Select-Object -Skip 360 -First 90`; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; live `Invoke-RestMethod` / `Invoke-WebRequest` calls against `https://tjware.me/meta-dashboard/api/meta/import` and `.../api/inbox/conversations?assetId=446290ba-f47b-430c-b475-b3af54b58049`; `Get-Date -Format o`
- Errors encountered:
  1. Meta returned `500 Internal Server Error` with code `1` and message `Please reduce the amount of data you're asking for, then retry your request` on the IG thread messages endpoint.
  2. The usual PowerShell `Invoke-WebRequest` login helper still throws a client-side `NullReferenceException` after cookies are set, but the authenticated follow-up requests continue to work.
- Fix or decision:
  1. Reduced conversation-message fields to `id,created_time,message,from,attachments{id,mime_type,file_url,name}`.
  2. Lowered per-page message limits from `500` to `100` for Facebook and `25` for Instagram.
  3. Passed the platform into `getConversationMessages(...)` so the lighter IG-specific request shape is used during import.
  4. Removed the now-unused heavy attachment metadata capture from the historical import path.
  5. Deployed production and reran the `Brooke Vinson` scoped import successfully.
- Rationale: The live Meta error already identified the failure mode. Reducing per-page message volume and trimming attachment fields is the minimal fix that preserves message history while staying within the endpoint’s payload tolerance.
- Rollback plan: Restore the previous `getConversationMessages(...)` fields/limits and the heavier attachment metadata mapping, redeploy production, and revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Treat `Select asset -> Sync selected asset` as the operator workflow for newly assigned messaging assets. Use the same flow for TJ or any future IG/Page asset and only fall back to full import when broader account data is needed.

## 2026-04-05T18:37:23.5738896-05:00 | Narrow IG scoped sync and harden sync-button error handling

- Task: Fix the two problems exposed by the first live scoped-sync rollout: Instagram asset sync was still broader than intended, and the UI crashed on non-JSON error responses.
- Context: After deploying scoped sync, a live attempt against the `Brooke Vinson` Instagram asset did not populate inbox rows and the browser surfaced `Unexpected token 'A', "An error o"... is not valid JSON`. That meant the client was trying to parse a plain-text/HTML platform error, and the IG-scoped path still needed to stay strictly on Instagram instead of importing the whole linked Page context.
- Files changed: `lib/meta/sync-service.ts`, `components/meta/meta-sync-button.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- Commands run: live PowerShell `Invoke-WebRequest` / `Invoke-RestMethod` calls against `https://tjware.me/meta-dashboard/api/auth/login`, `/api/connected-accounts`, `/api/meta/import`, `/api/inbox/conversations`, `/api/leads`, and `/api/audit`; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered:
  1. The first live scoped import for the `Brooke Vinson` Instagram asset did not return within the client timeout window, and the post-check still showed `0` conversations and `0` leads for that asset.
  2. The sync button assumed failed responses were JSON and threw a client-side parse exception when Vercel returned non-JSON error text.
  3. The first error-handling patch hit TypeScript nullability errors before a quick follow-up fix.
- Fix or decision:
  1. Narrowed the scoped sync path so an `instagram_professional` asset sync imports only Instagram conversations and skips Facebook-page history and lead-form work for that asset.
  2. Narrowed the Page-asset scoped path so it syncs only Page conversations plus page-owned leads instead of also backfilling linked IG by default.
  3. Updated `MetaSyncButton` to parse responses as text first and only JSON-decode when possible, so the real backend/platform error text is shown to the operator instead of a JSON parse crash.
  4. Redeployed production twice: once for the IG-only scoped sync narrowing and once for the sync-button error-handling fix.
- Rationale: Asset-scoped sync must respect the selected asset boundary, otherwise it loses the runtime advantage that justified the feature. Operators also need to see the actual platform failure text when Vercel or Meta returns a non-JSON response.
- Rollback plan: Remove the platform-specific scoped-sync narrowing from `lib/meta/sync-service.ts`, restore the previous `MetaSyncButton` JSON-only parsing behavior if necessary, redeploy production, and revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Retry the production `Brooke Vinson` scoped sync from the UI and capture the new plain-text error message if it still fails; that message should now be visible directly in the button status instead of being masked by the JSON parse exception.

## 2026-04-05T18:23:23.6479562-05:00 | Add scoped Meta sync for selected business or asset

- Task: Make the dashboard’s asset selector actually useful for inbox and leads by allowing operators to sync only the currently selected business or asset instead of always running the full Meta import.
- Context: The shared header already supported `assetId` scope for reads, but `MetaSyncButton` still posted to the full importer. That full import now times out on Vercel when multi-page inbox backfills run together, which blocked newly assigned accounts like the `brookevinson` Instagram asset from being populated quickly.
- Files changed: `lib/meta/sync-service.ts`, `app/api/meta/import/route.ts`, `components/meta/meta-sync-button.tsx`, `components/leads/leads-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- Commands run: `Get-Location`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `Get-Content README.md`; `Get-Content .agent/project_overview.md`; `Get-Content .agent/session_handoff.md`; `Get-Content .agent/open_issues.md`; `Get-Content .agent/decisions.md`; `rg -n "assetId|scopeToQueryString|resolveDashboardScope|getScopeOptions" lib components app`; `Get-Content lib/dashboard/scope.ts`; `Get-Content components/app-shell/account-switcher.tsx`; `Get-Content components/inbox/inbox-workspace.tsx`; `Get-Content lib/repositories/dashboard-repository.ts`; `Get-Content lib/meta/sync-service.ts`; `Get-Content -LiteralPath 'app\\(dashboard)\\inbox\\page.tsx'`; `Get-Content -LiteralPath 'app\\(dashboard)\\leads\\page.tsx'`; `Get-Content lib/services/inbox-service.ts`; `Get-Content lib/services/leads-service.ts`; `Get-Content components/meta/meta-sync-button.tsx`; `Get-Content app/api/meta/import/route.ts`; `Get-Content components/leads/leads-workspace.tsx`; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`
- Errors encountered:
  1. `Get-Content app\(dashboard)\...` failed until the path was re-run with `-LiteralPath` because PowerShell treated the parentheses as syntax.
  2. The app already had asset-scoped reads, but the sync action ignored that scope and always hit the full importer.
- Fix or decision:
  1. Added a new scoped sync path in `lib/meta/sync-service.ts` that can import only the selected business or selected Page/Instagram asset, reusing the page/IG message-and-lead import logic without the ad-account/insights work that causes the full timeout.
  2. Updated `app/api/meta/import/route.ts` to accept optional `businessId` and `assetId` in the request body.
  3. Updated `MetaSyncButton` so it automatically posts the current URL scope and relabels itself as `Sync selected asset` or `Sync selected business` when appropriate.
  4. Added the same sync control to the Leads page so inbox and leads both support scoped population from the shared header scope.
  5. Deployed production to `https://meta-dashboard-8xhlo0zy6-byoroofers-projects.vercel.app`, aliased to `https://tjware.me`.
- Rationale: Newly assigned inbox assets should not require a full cross-business import to appear. A scoped sync lets operators populate a specific business/Page/IG path within Vercel’s runtime budget while keeping the full importer available for broad refreshes.
- Rollback plan: Remove the scoped sync helper path from `lib/meta/sync-service.ts`, restore `app/api/meta/import/route.ts` to the no-body full-import-only behavior, revert the `MetaSyncButton` and leads page changes, redeploy production, and revert these `.agent/` memory updates if this record is incorrect.
- Next steps: On production, select Elite Cleaning or the `brookevinson` Instagram asset from the header, use the new scoped sync button from Inbox or Leads, and verify that the selected asset’s conversations and lead forms populate without the old full-import timeout.

## 2026-04-05T15:31:59.2269525-05:00 | Add multi-page Meta messaging token support

- Task: Replace the single-page messaging override with multi-page support so the dashboard can operate Elite Cleaning and TJ Ware for Congress simultaneously for messaging-related imports.
- Context: Production already had a working Elite Cleaning Page-token override for inbox history, but the runtime only supported one `META_MESSAGING_PAGE_ID` plus one token. The user then supplied a second valid Page token for TJ Ware for Congress and required both pages to be supported together.
- Files changed: `.env.example`, `lib/config/env.ts`, `lib/meta/sync-service.ts`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content README.md`; `Get-Content .agent/project_overview.md`; `Get-Content .agent/session_handoff.md`; `Get-Content .agent/open_issues.md`; `Get-Content .agent/decisions.md`; `git status --short --branch`; `Get-Content .env.example`; `Get-Content lib/config/env.ts`; `Get-Content lib/meta/sync-service.ts`; `rg -n "META_MESSAGING_PAGE|metaMessagingPageOverride|messagingPageToken" -S .`; `rg -n "withPageToken|getPageDetails\\(|getConversations\\(|getConversationMessages\\(|sendMessage|auto-respond|autoresponder|lead-destination|META_SYSTEM_USER_ACCESS_TOKEN|connected_assets" lib app components -S`; `Get-Content lib/meta/client.ts`; `Get-Content app/api/messages/send/route.ts`; `Get-Content lib/services/settings-service.ts`; `Get-Content lib/services/inbox-service.ts`; `Get-Content app/api/auth/login/route.ts`; `Get-Content lib/auth/session.ts`; `Get-Content app/api/connected-accounts/route.ts`; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; Meta Graph token validation calls for Elite Cleaning and TJ Ware for Congress; `npx vercel env add META_MESSAGING_PAGE_TOKEN_MAP production --value ...`; `cmd /c npx vercel deploy --prod --yes --force`; `cmd /c npx vercel env pull .tmp-vercel.env --environment production --yes`; live `curl.exe` calls to `https://tjware.me/meta-dashboard/api/meta/status`, `.../api/meta/import`, and `.../api/connected-accounts`; `Get-Date -Format o`
- Errors encountered:
  1. The first Vercel env add attempt mangled the JSON and stored a relaxed `{pageId:token,pageId:token}` string instead of strict JSON.
  2. The initial helper type used `ReturnType<typeof getSupabaseAdminClient>` and hit TypeScript errors because that type is nullable.
  3. A fresh production `POST /api/meta/import` timed out with `FUNCTION_INVOCATION_TIMEOUT` after the multi-page support was deployed.
- Fix or decision:
  1. Added `META_MESSAGING_PAGE_TOKEN_MAP` to the env contract.
  2. Added config helpers that resolve per-page messaging tokens and report the number of configured overrides.
  3. Preserved the legacy single-page env pair as a backward-compatible fallback.
  4. Added a configured-page fallback path so pages in the token map can be imported even if the system-user discovery path does not list them.
  5. Extended the parser to accept both strict JSON and the relaxed `pageId:token,pageId:token` format that Vercel ended up storing.
  6. Deployed production and verified `GET /api/meta/status` now reports `metaMessagingPageOverrideCount: 2`.
- Rationale: Multi-page messaging selection requires the runtime to resolve the correct page token by asset ID instead of assuming there is only one special-case page. Backward compatibility matters because production already had a single-page override in place.
- Rollback plan: Remove `META_MESSAGING_PAGE_TOKEN_MAP` support from `.env.example`, `lib/config/env.ts`, and `lib/meta/sync-service.ts`, rely only on the old single-page env pair again, redeploy production, and revert the `.agent/` updates if this record is incorrect.
- Next steps: Reduce or split the production importer so a full sync with multiple page inbox backfills can complete within Vercel runtime limits, then rerun sync and verify both Elite Cleaning and TJ Ware for Congress appear in connected assets and inbox data.

## 2026-04-05T15:28:01.9399370-05:00 | Harden Python bot runtime with safer execution controls

- Task: Continue the standalone social engagement bot by adding safer runtime controls and reply gating for real-world use.
- Context: The initial scaffold worked, but it still needed a cleaner local env workflow, a one-shot execution path for dry runs, and stronger eligibility checks to reduce low-quality or accidental replies.
- Files changed: `automation/social_engagement_bot/.env.social-bot.example`, `automation/social_engagement_bot/README.md`, `automation/social_engagement_bot/bot.py`, `automation/social_engagement_bot/config.py`, `automation/social_engagement_bot/facebook_client.py`, `automation/social_engagement_bot/filters.py`, `automation/social_engagement_bot/models.py`, `automation/social_engagement_bot/reddit_client.py`, `automation/social_engagement_bot/requirements.txt`, `automation/social_engagement_bot/state.py`, `automation/social_engagement_bot/tests/test_filters.py`, `README.md`, `.agent/project_overview.md`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m unittest discover -s automation/social_engagement_bot/tests -p "test_*.py"`; `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m compileall automation/social_engagement_bot`; `Get-Date -Format o`
- Errors encountered: None after the initial scaffold's launcher-access issue had already been handled.
- Fix or decision:
  1. Added `BOT_ENV_FILE` support so the bot can load a dedicated env file without relying on the shell session alone.
  2. Added `BOT_ONE_SHOT` support so the bot can poll once and exit for safer setup validation.
  3. Added `BOT_REQUIRE_QUESTION_OR_INTENT` so generic chatter is skipped unless the content looks like an actual question or buying/help request.
  4. Expanded the draft log shape to include a review `status`.
  5. Tightened default blocked-author handling for low-signal Reddit/Facebook authors.
  6. Expanded test coverage for the new intent-gating logic.
- Rationale: A bot that can post publicly needs stronger defaults than simple keyword matching. One-shot dry runs and intent filters reduce the chance of noisy or spammy engagement.
- Rollback plan: Revert the updated bot files, restore the earlier README and `.agent/` notes, and remove the new bot env/runtime flags if this record is incorrect.
- Next steps: Run the bot with `BOT_ONE_SHOT=true` and `DRY_RUN=true` against real credentials, inspect `runtime/drafts.jsonl`, and only then decide whether live posting should be enabled.

## 2026-04-05T15:20:30.5104131-05:00 | Add standalone Python social engagement bot scaffold

- Task: Build a Python bot that monitors Reddit and Facebook for configured keywords, uses OpenAI to generate replies, and nudges users toward direct messages in a natural way.
- Context: The repository is primarily a Next.js Meta dashboard, but the user requested a separate automation flow using Python plus the Reddit, Facebook, and OpenAI APIs. The worktree was already dirty from unrelated dashboard tasks, so the bot needed to be isolated from those changes.
- Files changed: `automation/__init__.py`, `automation/social_engagement_bot/.gitignore`, `automation/social_engagement_bot/.env.social-bot.example`, `automation/social_engagement_bot/README.md`, `automation/social_engagement_bot/__init__.py`, `automation/social_engagement_bot/bot.py`, `automation/social_engagement_bot/config.py`, `automation/social_engagement_bot/facebook_client.py`, `automation/social_engagement_bot/filters.py`, `automation/social_engagement_bot/models.py`, `automation/social_engagement_bot/openai_client.py`, `automation/social_engagement_bot/prompting.py`, `automation/social_engagement_bot/reddit_client.py`, `automation/social_engagement_bot/requirements.txt`, `automation/social_engagement_bot/state.py`, `automation/social_engagement_bot/tests/test_filters.py`, `automation/social_engagement_bot/tests/test_prompting.py`, `.gitignore`, `README.md`, `.agent/project_overview.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/decisions.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- Commands run: `Get-Location`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `Get-Content README.md`; `Get-Content .agent/project_overview.md`; `Get-Content .agent/session_handoff.md`; `Get-Content .agent/open_issues.md`; `Get-Content .agent/decisions.md`; `Get-ChildItem -Force`; `Get-Content package.json`; `where.exe py`; `Get-Date -Format o`; `Get-Content .gitignore`; `rg -n "python|bot|automation" README.md .agent package.json`; official-doc web lookups for the OpenAI Responses API and PRAW stream docs; `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m unittest discover -s automation/social_engagement_bot/tests -p "test_*.py"`; `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m compileall automation/social_engagement_bot`
- Errors encountered:
  1. `py -m unittest ...` and `py -m compileall ...` failed because `py` was not available on the current PowerShell `PATH`.
  2. Directly invoking the resolved `py.exe` path failed inside the sandbox with `Access is denied`.
- Fix or decision:
  1. Implemented the bot as a standalone Python package under `automation/social_engagement_bot`.
  2. Added environment-based configuration, keyword/relevance filters, local state/draft persistence, Reddit and Facebook polling clients, and an OpenAI Responses API wrapper.
  3. Defaulted the bot to `DRY_RUN=true` so it drafts replies before any live posting.
  4. Added lightweight `unittest` coverage for keyword matching and prompt construction.
  5. Documented setup, run, and test commands in both `README.md` and `.agent/project_overview.md`.
  6. Reran Python verification with the explicit launcher path outside the sandbox after approval.
- Rationale: A separate Python service is the lowest-risk way to add this automation without entangling it with the existing Next.js runtime or the unrelated dirty dashboard worktree.
- Rollback plan: Remove the `automation/social_engagement_bot` package and `automation/__init__.py`, revert the Python-related additions in `.gitignore`, `README.md`, and `.agent/project_overview.md`, then revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Populate `automation/social_engagement_bot/.env.social-bot.example` values in a real env file, run in `DRY_RUN=true`, review `runtime/drafts.jsonl`, and only then consider enabling live posting per platform.

## 2026-04-05T09:02:38.6804244-05:00 | Publish clean root privacy policy URL for Meta

- Task: Replace the placeholder privacy page with a Meta-facing privacy policy and publish it at a clean root URL for Meta app settings.
- Context: The repo already had a `/privacy` page behind the Next.js base path, but it read like an internal placeholder and did not have a root rewrite. Meta needs a stable public privacy policy link.
- Files changed: `app/privacy/page.tsx`, `vercel.json`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content` across privacy/proxy/vercel files; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `cmd /c npx vercel deploy --prod --yes --force`; `Invoke-WebRequest https://tjware.me/privacy`; `Get-Date -Format o`
- Errors encountered:
  1. The first `typecheck` run hit the familiar stale `.next/types/validator.ts` route-artifact issue before a fresh build.
  2. After `cmd /c npm run build`, the follow-up `cmd /c npm run typecheck` passed.
- Fix or decision:
  1. Rewrote `app/privacy/page.tsx` into a public-facing privacy policy for Meta Dashboard.
  2. Added a Vercel root rewrite from `/privacy` to `/meta-dashboard/privacy`.
  3. Deployed production and verified `https://tjware.me/privacy` returns `200`.
- Rationale: Meta app settings need a clean public privacy-policy URL, and a root URL is safer than expecting Meta to understand the app base path.
- Rollback plan: Restore the previous privacy page content, remove the `/privacy` rewrite from `vercel.json`, redeploy production, and revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Use `https://tjware.me/privacy` as the privacy policy URL in Meta.

## 2026-04-05T08:57:38.4793892-05:00 | Deploy Meta data deletion callback and verify live endpoint

- Task: Deploy the new Meta data deletion callback route to production and verify it responds correctly on `tjware.me`.
- Context: The callback route and status page had been implemented locally, but Meta needed a live production URL before the setting could be completed in the App Dashboard.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `cmd /c npx vercel deploy --prod --yes --force`; `Invoke-WebRequest https://tjware.me/api/meta/data-deletion?confirmation_code=test-code`; `Get-Date -Format o`
- Errors encountered: None. Deployment and post-deploy verification both succeeded.
- Fix or decision:
  1. Deployed production to `https://meta-dashboard-a13rcuhd7-byoroofers-projects.vercel.app`.
  2. Confirmed it was aliased to `https://tjware.me`.
  3. Verified the live root callback URL returns the expected JSON response.
- Rationale: Meta needs the callback to be live on the production domain, not just present in the local codebase.
- Rollback plan: Redeploy a prior production build if this route should be removed, or revert the callback-route commit set and redeploy. Revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Use `https://tjware.me/api/meta/data-deletion` as the Meta data deletion callback URL in the app settings.

## 2026-04-05T08:53:18.1336930-05:00 | Add public Meta data deletion callback URL

- Task: Add a public data deletion callback endpoint and status page so Meta has a valid data deletion callback URL for the app configuration.
- Context: The app already had webhook handling and a privacy page, but no public data deletion callback route. Because the app uses a `/meta-dashboard` base path, a root rewrite was also needed so Meta can call a stable root URL.
- Files changed: `app/api/meta/data-deletion/route.ts`, `app/data-deletion-status/page.tsx`, `proxy.ts`, `vercel.json`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `rg -n "data deletion|privacy"`; `Get-Content vercel.json`; `Get-Content next.config.ts`; `Get-Content proxy.ts`; `Get-Content app/privacy/page.tsx`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `Get-Date -Format o`
- Errors encountered: None. The main requirement was making the callback public and root-addressable despite the app base path.
- Fix or decision:
  1. Added `POST /api/meta/data-deletion` to return a confirmation code and status URL.
  2. Added `GET /api/meta/data-deletion` as a simple health/confirmation response.
  3. Added a public `/data-deletion-status` page for the status URL returned by the callback.
  4. Updated `proxy.ts` so both the callback and status page are public.
  5. Added a Vercel rewrite from `/api/meta/data-deletion` to `/meta-dashboard/api/meta/data-deletion`.
- Rationale: Meta needs a stable public callback URL, and external services should not need to know about the internal Next.js `basePath`.
- Rollback plan: Delete `app/api/meta/data-deletion/route.ts` and `app/data-deletion-status/page.tsx`, revert the `proxy.ts` public-path addition and the `vercel.json` rewrite, then revert these `.agent/` memory updates.
- Next steps: Deploy production, then use `https://tjware.me/api/meta/data-deletion` as the Meta data deletion callback URL.

## 2026-04-05T08:50:04.7160947-05:00 | Create upload-ready DASH app icon asset

- Task: Create a small branded `DASH` app icon asset suitable for uploading to Meta.
- Context: The user needed a simple Dashboard app icon and specifically said it must be uploaded to Meta. The built-in image generation tool was not available in this environment, so the asset had to be created deterministically in-workspace instead.
- Files changed: `public/brand/meta-dashboard-app-icon.svg`, `public/brand/meta-dashboard-app-icon.png`, `public/brand/meta-dashboard-app-icon.jpg`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content C:\\Users\\warep\\.codex\\skills\\.system\\imagegen\\SKILL.md`; `Get-ChildItem ... icon|logo|favicon`; PowerShell `System.Drawing` export commands; `view_image` for local verification; `Get-Date -Format o`
- Errors encountered:
  1. The first PNG/JPG export failed before drawing text because the `System.Drawing.Font` constructor arguments were passed incorrectly.
  2. The export was rerun with explicit `-ArgumentList` usage and completed successfully.
- Fix or decision:
  1. Added an editable SVG source for the icon.
  2. Exported ready-to-upload `1024x1024` PNG and JPG variants.
  3. Verified the PNG visually after export.
- Rationale: A deterministic local asset was faster and more reliable here than waiting on unavailable built-in image-generation tooling, and Meta app icon upload does not require a generative workflow for a simple text mark.
- Rollback plan: Delete `public/brand/meta-dashboard-app-icon.svg`, `public/brand/meta-dashboard-app-icon.png`, and `public/brand/meta-dashboard-app-icon.jpg`, then revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Upload the PNG to Meta. If Meta rejects the sizing or readability, adjust the SVG source and re-export a tighter variant.

## 2026-04-05T08:39:41.3968720-05:00 | Rerun live sync and capture exact Meta inbox permission error

- Task: Retry the live production Meta sync after the user updated app permissions and verify the exact inbox-import outcome.
- Context: The app is still in Development mode, but the user asked to try syncing again after changing permissions. The importer had already been updated to surface the first inbox-history skip reason in `lastSync.detail` and `sync_jobs.metadata`.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- Commands run: `Invoke-WebRequest https://tjware.me/meta-dashboard/api/auth/login -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/import -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/inbox/conversations`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/status`; `Get-Date -Format o`
- Errors encountered: No transport/runtime failures. The sync itself succeeded, but Meta still denied inbox-history access.
- Fix or decision:
  1. Reran the live sync successfully on April 5, 2026.
  2. Confirmed the deployed inbox API still returns `[]`.
  3. Captured the exact Meta error from production: `(#200) Requires permission: pages_messaging or User associated with the Page access token does not have an appropriate role on the Page.`
- Rationale: This resolves the remaining ambiguity. The production blocker is now explicitly identified by Meta rather than inferred from counts or scopes alone.
- Rollback plan: No code or schema changed. Revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Publish the app, obtain a token with `pages_messaging`, and/or fix the Page role assignment for the user associated with the Page token, then rerun sync.

## 2026-04-04T21:26:53.2633957-05:00 | Persist exact inbox-history skip reasons in sync metadata

- Task: Stop hiding the exact Meta error behind `inboxHistorySkipped` so production syncs reveal why inbox history was skipped.
- Context: We already proved via Meta's token debugger that the current token lacks `pages_messaging` and `instagram_manage_messages`, but the importer still only surfaced `inboxHistorySkipped=1` instead of the actual Meta error string that caused the skip.
- Files changed: `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content` across `lib/meta/sync-service.ts`; `rg -n "sync_jobs|metadata|inboxHistorySkipped"`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `Get-Date -Format o`
- Errors encountered: None. The existing code already had the right catch boundary; it just discarded the useful Meta error details.
- Fix or decision:
  1. Added `inboxHistorySkips[]` capture in `lib/meta/sync-service.ts`.
  2. Each skipped page now records `pageId`, `pageAssetId`, `pageName`, and the exact Meta error message.
  3. Successful syncs now store that structure in `sync_jobs.metadata` and `audit_logs.metadata`.
  4. The sync detail string now includes the first skip reason for fast operator visibility.
- Rationale: The next production sync should tell us the exact Meta-side reason for the inbox skip without needing another code audit or guesswork.
- Rollback plan: Remove the `inboxHistorySkips` collection and restore the previous `sync_jobs`/`audit_logs` metadata payloads in `lib/meta/sync-service.ts`, then revert these `.agent/` memory updates.
- Next steps: Deploy this change, rerun the live sync, and inspect the updated `lastSync.detail` / `sync_jobs.metadata.inboxHistorySkips` for the precise Meta error.

## 2026-04-04T21:25:03.6177924-05:00 | Stop overstating Meta messaging scopes in imported dashboard state

- Task: Remove hardcoded messaging/lead scopes from the importer so the dashboard stops implying inbox access that the live token does not actually have.
- Context: Meta's live token debugger confirmed the current production system-user token is valid but lacks `pages_messaging`, `instagram_manage_messages`, and `leads_retrieval`. The importer was still persisting optimistic `granted_scopes` values for businesses and Instagram assets, which made the dashboard state misleading.
- Files changed: `lib/meta/sync-service.ts`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content` across sync/import files and open issues; `rg -n "granted_scopes"`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `Get-Date -Format o`
- Errors encountered: None during code verification. The main blocker was conceptual: the repo had to stop treating assumed permissions as observed permissions.
- Fix or decision:
  1. Removed hardcoded business-level `pages_messaging`, `instagram_manage_messages`, and `leads_retrieval` scope claims from `lib/meta/sync-service.ts`.
  2. Removed hardcoded Instagram-asset `instagram_manage_messages` scope claims from `lib/meta/sync-service.ts`.
  3. Updated `.agent/open_issues.md` with the live debugger evidence that the current token lacks the required messaging and lead scopes.
- Rationale: The dashboard should not tell operators messaging access exists when the token debugger and production sync results prove otherwise.
- Rollback plan: Restore the previous hardcoded `granted_scopes` arrays in `lib/meta/sync-service.ts` and revert the `.agent/` memory updates, though that would knowingly reintroduce false capability signals.
- Next steps: After Meta issues a token with the required scopes, rerun sync so `granted_scopes` and inbox history reflect real access instead of placeholders.

## 2026-04-04T21:06:24.1720898-05:00 | Rotate production Meta token, redeploy, and rerun live sync

- Task: Replace the production `META_SYSTEM_USER_ACCESS_TOKEN`, redeploy production, and rerun the live Meta sync to see whether inbox history would finally populate.
- Context: A fresh production sync had already succeeded structurally but still returned `0` conversations and `0` messages with `inboxHistorySkipped: 1`. The user then supplied a new token to test whether the blocker was just stale credentials.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `cmd /c npx vercel env add META_SYSTEM_USER_ACCESS_TOKEN production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes --force`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/auth/login -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/import -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/inbox/conversations`; `Get-Date -Format o`
- Errors encountered: No command failures occurred after the token was supplied; however, the new token did not change the inbox-import outcome.
- Fix or decision:
  1. Updated the production Vercel environment with the new Meta system-user token.
  2. Redeployed production so the token was active.
  3. Reran the live sync and verified the production inbox API immediately afterward.
  4. Confirmed the result is still `conversations=0`, `messages=0`, `inboxHistorySkipped=1`, and `GET /api/inbox/conversations` still returns `[]`.
- Rationale: Rotating the token was the fastest real-world test to separate an expired/incorrect token problem from a remaining Meta permissions/access problem.
- Rollback plan: Reapply the previous production token in Vercel if needed and redeploy. No repo code changed beyond memory updates.
- Next steps: Focus on Meta page-level messaging-history permissions/access assignment. The remaining blocker is not solved by token rotation alone.

## 2026-04-04T20:18:41.5299047-05:00 | Trigger live production Meta sync and verify inbox state

- Task: Use the deployed dashboard to run a full live Meta sync and verify whether inbox conversations/messages populate in production.
- Context: The user requested that all data be synced. Local execution was not possible because no app was listening on `localhost:3000` and this shell did not have `DASHBOARD_ADMIN_PASSWORD` in environment, so the sync had to be triggered against the deployed dashboard after the user supplied the admin password.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content lib/auth/session.ts`; `Get-Content lib/config/env.ts`; `Get-Content .env.local`; `Get-Process ...`; `Get-Content app/api/meta/status/route.ts`; `Invoke-WebRequest http://localhost:3000/api/meta/status`; `Invoke-WebRequest http://localhost:3000/api/meta/import -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/login`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/auth/login -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/import -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/inbox/conversations`; `Get-Content .agent/...`
- Errors encountered:
  1. There is no local `.env.local` and no local app listening on `localhost:3000`, so local sync execution was unavailable.
  2. The deployed sync route is admin-gated, so the live sync could not be run until the user supplied the dashboard admin password.
- Fix or decision:
  1. Logged into the deployed dashboard and triggered the live Meta sync successfully.
  2. Verified the deployed inbox API immediately afterward.
  3. Recorded that the sync imported ads/account/form data but still imported `0` conversations and `0` messages, with `inboxHistorySkipped: 1`.
- Rationale: The cleanest way to answer whether the dashboard can populate current inboxes is to run the real production sync and inspect the production inbox API immediately after.
- Rollback plan: No repo code or schema changed. If the remote sync job result must be superseded, rerun the sync after fixing Meta page-level messaging access. Revert these `.agent/` memory updates if this record is incorrect.
- Next steps: Fix the page-level messaging access/token issue in Meta so historical inbox reads stop skipping the page, then rerun the production sync.

## 2026-04-04T20:18:41.5299047-05:00 | Add inbox-side Meta sync control for current inbox population

- Task: Make it possible to populate current Facebook and Instagram inbox history from the inbox page itself.
- Context: The Meta import pipeline already backfills conversations and messages, but the inbox workspace had no direct sync control and the sync success message did not report conversation/message counts. Operators had to leave the inbox page to trigger population and had no inbox-specific confirmation.
- Files changed: `components/inbox/inbox-workspace.tsx`, `components/meta/meta-sync-button.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content` across inbox pages, inbox workspace, sync route, sync button, and Meta client/service files; `rg -n ...` across inbox and Meta import paths; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `Get-Date -Format o`
- Errors encountered:
  1. The first `typecheck` run failed on stale `.next/types/validator.ts` route artifacts before a fresh build regenerated them.
  2. `components/meta/meta-sync-button.tsx` contained encoding-corrupted text from prior edits, so the cleanest safe fix was to replace the file with a normalized ASCII version while preserving behavior.
- Fix or decision:
  1. Added `MetaSyncButton` directly to the inbox page header actions.
  2. Updated the inbox empty-state copy to tell operators to sync Meta data to import current inbox history.
  3. Expanded the sync success message to include imported conversation and message counts, not just businesses/ad accounts/leads.
- Rationale: The existing Meta sync already populates inbox history; the missing piece was an inbox-local trigger and visible confirmation that current inboxes were imported.
- Rollback plan: Remove `MetaSyncButton` from `components/inbox/inbox-workspace.tsx`, restore the previous empty-state copy, revert `components/meta/meta-sync-button.tsx` to the prior summary string and markup, and revert the `.agent/` memory updates.
- Next steps: If the user wants this fully automatic, the next change would be auto-prompting or auto-triggering sync when the inbox is empty and the Meta integration is healthy.

## 2026-04-04T20:11:58.3626442-05:00 | Populate archive messages with real message rows

- Task: Populate the archive messages surface and API with actual scoped message rows instead of only archive-event summaries.
- Context: The archive service was returning conversations in its `messages` slot, and `GET /api/archive/messages` was returning only communication archive events. This left the "messages" archive surface under-populated even when real messages existed.
- Files changed: `lib/repositories/dashboard-repository.ts`, `lib/services/archive-service.ts`, `app/api/archive/messages/route.ts`, `components/archive/archive-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content` across archive service, archive API, archive workspace, and route pages; `rg -n ...` across archive and message-loading paths; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `Get-Date -Format o`
- Errors encountered:
  1. The first `typecheck` run failed with `.next/types/validator.ts` missing `./routes.js`, which indicates stale generated Next route types before a fresh build.
  2. After `cmd /c npm run build`, the generated types were refreshed and the follow-up `cmd /c npm run typecheck` passed cleanly.
- Fix or decision:
  1. Added `dashboardRepository.getMessages(scope)` to populate all scoped messages across conversations.
  2. Updated `getArchiveData()` to load actual messages instead of conversations in the `messages` field.
  3. Updated `GET /api/archive/messages` to return populated `messages` along with `communicationArchive` and `messageArchive`.
  4. Updated the archive workspace message mode to render actual archived message rows and keep canonical snapshot metadata as a separate section.
- Rationale: A route and UI labeled "archive messages" should expose real message copies, not only archive-event rows or conversation shells.
- Rollback plan: Remove `getMessages(scope)` from `lib/repositories/dashboard-repository.ts`, restore the prior `getArchiveData()` message source in `lib/services/archive-service.ts`, revert `app/api/archive/messages/route.ts` to the prior response shape, revert the message-mode rendering changes in `components/archive/archive-workspace.tsx`, and revert the `.agent/` memory updates.
- Next steps: If the user wants broader operator visibility, add filtering by asset, direction, and status on the archive messages surface now that the full message rows are populated.

## 2026-04-04T20:03:29.5818340-05:00 | Add browseable immutable archive viewer and deploy production

- Task: Make the immutable communication archive easily viewable in the dashboard so sent and received records remain inspectable even if the operational inbox changes later.
- Context: The archive tables and write-path retention were already in place, but the archive UI still exposed the older message archive shape and did not present the append-only communication ledger clearly enough for operational review.
- Files changed: `components/archive/archive-workspace.tsx`, `app/api/archive/messages/route.ts`, `lib/services/archive-service.ts`, `lib/repositories/dashboard-repository.ts`, `types/domain.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content` across archive repository/service/UI files; `cmd /c npx tsc --noEmit`; `cmd /c npx eslint .`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered:
  1. The existing handoff state still described archive/import work as only dirty local changes, so memory had to be corrected to reflect that the archive viewer is now deployed and browseable.
  2. The archive route and service still returned the older archive payload shape, so the UI and server boundary needed to be updated together to avoid mismatched data contracts.
- Fix or decision:
  1. Reworked the archive workspace to render a readable immutable communication ledger with retained inbound/outbound records and event metadata.
  2. Updated the archive API/service/repository path to return `communicationArchive` records backed by the immutable archive tables.
  3. Deployed the updated archive viewer to production and aliased it to `https://tjware.me`.
- Rationale: A durable archive is not useful operationally unless staff can inspect it directly without depending on the mutable inbox tables or raw database access.
- Rollback plan: Revert the archive UI/API/service/repository/type changes and redeploy, or reset to checkpoint `b42360b3314007e3ab3e431f455a4296cf3df5be` if the entire importer/archive track must be abandoned.
- Next steps: Validate live production archive rows after new message activity and confirm whether Messenger/Instagram call-style events appear in the retained raw payload stream.

## 2026-04-04T20:00:37.5998814-05:00 | Add connected-asset message and lead log retrieval endpoint

- Task: Add a server-side retrieval path for message and lead logs scoped to a single connected asset.
- Context: The repo already exposed scoped inbox and lead endpoints, but there was no way to retrieve the combined message-thread and lead activity history for one connected Meta asset in a single API call.
- Files changed: `types/domain.ts`, `lib/repositories/dashboard-repository.ts`, `lib/services/connected-asset-logs-service.ts`, `app/api/connected-assets/[assetId]/logs/route.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content README.md`; `Get-Content .agent/project_overview.md`; `Get-Content .agent/session_handoff.md`; `Get-Content .agent/open_issues.md`; `Get-Content .agent/decisions.md`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `rg -n ...` across `app`, `components`, `lib`, and `types`; `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`; `Get-Date -Format o`
- Errors encountered:
  1. PowerShell path expansion failed on bracketed route paths until files were reread with `-LiteralPath`.
  2. The first `lint` run hit the tool timeout even though the process was healthy, so it was rerun with a longer timeout and completed successfully.
- Fix or decision:
  1. Added shared connected-asset log types for grouped message-thread and lead activity payloads.
  2. Extended the dashboard repository with connected-asset lookup, per-asset conversation reads, and per-asset lead reads.
  3. Added `lib/services/connected-asset-logs-service.ts` to assemble per-asset message and lead logs plus summary totals.
  4. Added `GET /api/connected-assets/[assetId]/logs` to return the combined scoped payload.
- Rationale: The existing API surface forced callers to stitch together inbox and lead data across multiple routes. A single asset-scoped endpoint is the cleanest server boundary for retrieving operational logs for one connected asset.
- Rollback plan: Remove `app/api/connected-assets/[assetId]/logs/route.ts` and `lib/services/connected-asset-logs-service.ts`, revert the new repository methods in `lib/repositories/dashboard-repository.ts`, revert the added connected-asset log types in `types/domain.ts`, and revert the `.agent/` memory updates.
- Next steps: If the UI needs this data, add a connected-asset detail surface or controls in the connected-accounts workspace that call the new endpoint and render the grouped logs.

## 2026-04-04T17:05:02-05:00 | Add immutable communication archive layer and apply remote schema

- Task: Implement a separate append-only communication archive so inbox deletes/edits cannot remove retained message history, wire it into inbound/outbound/history flows, deploy production, and apply the matching Supabase schema.
- Context: The user requires durable archive separation from the operational inbox tables, including preservation of inbound/outbound communications and raw event traces even if operators later modify inbox state.
- Files changed: `supabase/migrations/0011_immutable_communication_archive.sql`, `lib/archive/communication-archive.ts`, `lib/meta/message-preservation.ts`, `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `types/database.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content -Raw` across archive, message send, types, and migration files; `cmd /c npx tsc --noEmit`; `cmd /c npx eslint .`; `cmd /c npx vercel deploy --prod --yes`; `cmd /c npx supabase db push --linked`; `Get-Date -Format o`
- Errors encountered:
  1. A deploy without the schema push would have left production code ahead of the database, so the new migration had to be applied remotely in the same task.
  2. Call/video-call coverage remains dependent on what Meta actually delivers through webhook/API payloads for the connected assets; this cannot be guaranteed purely in code without observing real payloads.
- Fix or decision:
  1. Added new append-only tables `communication_archive_events` and `communication_archive_attachments` with database-level update/delete prevention.
  2. Added `lib/archive/communication-archive.ts` as the shared archive writer.
  3. Wired immutable archive writes into inbound raw webhook processing, normalized inbound/outbound message persistence, outbound queued sends, and historical inbox backfill import.
  4. Deployed the archive-enabled code to production and pushed migration `0011_immutable_communication_archive.sql` to the linked Supabase project.
- Rationale: A filesystem archive is not durable on Vercel, so the correct durable equivalent is a separate immutable database archive layer that is append-only and independent of inbox operational tables.
- Rollback plan: Reset to checkpoint `b42360b3314007e3ab3e431f455a4296cf3df5be` to drop all post-checkpoint importer/archive work, or revert the archive files and migration selectively once committed. If the remote schema must be backed out, apply a corrective rollback migration rather than editing history in place.
- Next steps: Trigger a fresh production import and real message activity to verify archive rows are flowing as expected, then inspect whether Messenger/Instagram call or video-call events appear in raw webhook payloads.

## 2026-04-04T16:26:58-05:00 | Add historical inbox backfill and harden Meta access handling

- Task: Record the current rollback checkpoint in memory, extend the Meta importer to backfill historical inbox conversations/messages, and make access-related failures degrade gracefully instead of aborting the full import.
- Context: A rollback-safe checkpoint commit was needed before touching importer logic. The current importer handled ads/insights/leads only; inbox history still depended entirely on webhooks.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- Commands run: `git add .`; `git commit -m "Checkpoint current UI state before import work"`; `git rev-parse HEAD`; `Get-Content -Raw` across Meta sync/client/repository/webhook/schema/status files; `cmd /c npx tsc --noEmit`; `cmd /c npx eslint .`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered:
  1. The local workspace does not have `DASHBOARD_ADMIN_PASSWORD` or the required Meta/Supabase env vars, so the import route could not be triggered locally after deploy.
  2. The importer logic showed that leads are page-form driven, not ad-account-driven, so "all leads from ad account" is still fundamentally gated by linked page forms plus `leads_retrieval`.
  3. Historical inbox backfill would have failed the full import if a page token lacked messaging access, so that path needed explicit permission-error handling.
- Fix or decision:
  1. Created rollback checkpoint commit `b42360b3314007e3ab3e431f455a4296cf3df5be`.
  2. Added Meta client support for page conversations, conversation messages, and page-detail lookups needed for history backfill.
  3. Extended the importer to backfill conversations/messages into the same normalized `conversations`, `messages`, `message_attachments`, and `message_archive` tables used by webhook normalization.
  4. Added graceful skip handling so missing inbox-history access no longer aborts the whole Meta import.
  5. Redeployed production with the new importer code.
- Rationale: The dashboard can only show full inbox history if the importer can backfill it; webhook-only population is insufficient for existing message history. Access-denied cases needed to degrade safely because Meta permissions are still incomplete.
- Rollback plan: Reset to checkpoint `b42360b3314007e3ab3e431f455a4296cf3df5be` to abandon all post-checkpoint import work, or revert `lib/meta/client.ts` and `lib/meta/sync-service.ts` selectively once committed.
- Next steps: Resolve the external Meta access blockers so the live import can actually read historical inbox threads and lead data, then trigger a new production sync.

## 2026-04-04T16:09:06-05:00 | Inbox, leads, and ads UI upgrade pass

- Task: Implement the highest-priority UI improvements from the session handoff, starting with the inbox conversation list, then the leads pipeline, then ad reporting trends.
- Context: The live Meta import is now working, but these three dashboard surfaces were still using table-heavy layouts that did not match the upgraded design system.
- Files changed: `components/inbox/inbox-workspace.tsx`, `components/inbox/reply-composer.tsx`, `components/leads/leads-workspace.tsx`, `components/ads/ads-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- Commands run: `Get-Content -Raw README.md`; `Get-Content -Raw .agent/project_overview.md`; `Get-Content -Raw .agent/session_handoff.md`; `Get-Content -Raw .agent/open_issues.md`; `Get-Content -Raw .agent/decisions.md`; `git branch --show-current`; `git rev-parse HEAD`; `git status --short`; `git log --oneline -12`; `rg --files app components lib | rg "inbox|lead|ads|report|conversation|message|thread"`; `Get-Content -Raw` across the inbox, leads, ads, shared UI, route-page, type, and utility files; `cmd /c npx tsc --noEmit`; `cmd /c npx eslint .`; `cmd /c npx vercel deploy --prod --yes`; `Get-Date -Format o`
- Errors encountered:
  1. A large `apply_patch` call exceeded the Windows command-size limit, so the edits had to be split into smaller file-level patches.
  2. PowerShell parsed route-group paths like `app\(dashboard)\...` incorrectly until they were reread with `-LiteralPath`.
  3. PowerShell execution policy blocked `npx.ps1`, so verification was rerun through `cmd /c`.
  4. TypeScript initially failed because `lucide-react` in this install does not export `Instagram`, and typed Next routes required explicit `Route` casts for dynamic `Link` href values.
  5. Leads UI then hit a naming collision between Next's `Route` type and the `Route` lucide icon; the icon import was renamed to `RouteIcon`.
- Fix or decision:
  1. Replaced the inbox `DataTable` with a conversation-list UI showing avatar initials, last-message preview, unread dot/count, assignment, and timestamp gutter.
  2. Improved the message thread with tighter chat bubbles, inbound avatars, and a new client-side reply composer with live character count.
  3. Replaced the leads table with a kanban-style board grouped into New, Qualified, Proposal, Won, and Lost columns using the existing `nurturing` status for the Proposal column.
  4. Upgraded ad reporting with compact trend cards and inline SVG sparklines for spend, impressions, clicks, and CTR without adding a new chart dependency.
- Rationale: These were the highest-impact operator-facing UI gaps called out in the handoff, and they could be completed cleanly without touching the live data/service boundaries.
- Rollback plan: Revert `components/inbox/inbox-workspace.tsx`, delete `components/inbox/reply-composer.tsx`, revert `components/leads/leads-workspace.tsx`, and revert `components/ads/ads-workspace.tsx`. If committed later, prefer `git revert` of the resulting commit.
- Next steps: Implement the remaining UI items from the handoff, with overview empty states next, then connected-account health/mobile shell/settings/audit polish. This UI pass has been deployed to production.

## 2026-04-04T12:00:00-05:00 | Meta live import — direct-asset fallback, token fixes, graceful lead skip

- Task: Get the Meta import to actually populate live business data. The system user token was valid but `/me/businesses` returned empty. Iteratively fixed each API error until the import succeeded.
- Context: System user has direct asset access (Elite Cleaning Page, IG, Ad Account, App — all Full control) but is not a business portfolio member. Required a fallback path.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `lib/utils.ts`, `components/meta/meta-sync-button.tsx`
- Commits: `4dd352d`, `665d47a`, `fd036c8`, `f67d240`, `8dbccb5`, `f79c51b`, `b8bfb06`, `8083917`
- Errors encountered and fixed:
  1. "Unexpected token T" — MetaSyncButton fetch calls missing `withBasePath()` prefix → fixed with `withBasePath("/api/meta/import")` and `withBasePath("/api/meta/status")`.
  2. `400 Bad Request /me/accounts` — `tasks` field not available on `/me/accounts` → removed.
  3. `400 Bad Request /me/adaccounts` — `account_id` not returned by direct endpoint; `id` returns `act_XXXXXXX` → added `normalizeAdAccountId()` to strip prefix.
  4. `403 /leadgen_forms` — requires Page Access Token not system user token → use `page.access_token` from `/me/accounts` response.
  5. `403 /leads` — same page token issue → extended page token client to lead fetches.
  6. `403 leads_retrieval permission missing` — app doesn't have this permission approved → catch and skip gracefully, import continues.
- Result: Import now succeeds. Imports 1 business (synthetic), 3 assets (Elite Cleaning Page, elite_cleaning_dfw IG, brookevinson IG), 1 ad account (Elite Cleaning Main), campaigns, ad sets, ads, and insights. Leads skipped pending permission.
- Date formatting: Changed all `formatDateTime` / `formatShortDate` from `date-fns` to `Intl.DateTimeFormat` pinned to `America/Chicago` (Dallas CT).
- Rollback plan: `git revert` any of the 8 commits individually, or `git reset --hard 63faebe` to return to the pre-session state.
- Next steps: Add `leads_retrieval` permission to the Meta app; optionally add system user to Elite Cleaning business portfolio to enable the primary import path.

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
