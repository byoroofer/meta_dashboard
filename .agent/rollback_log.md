# Rollback Log

Purpose: make changes reversible. Record changed files, state-changing commands, and explicit reversal steps. Keep newest entries first.

## 2026-04-07T23:45:40.8929077-05:00 | Deploy demo-mode gating

- Change summary: Deployed demo-mode gating to prevent demo results unless explicitly enabled.
- Files changed: `lib/config/env.ts`, `lib/marketplace/adapters/index.ts`, `components/marketplace/marketplace-deals-workspace.tsx`, `.env.example`, `README.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Revert commit `a7c43a7` and redeploy.
  2. Use Vercel rollback/promote to return to the previous deployment if needed.
  3. Append a correction entry here if this log is inaccurate.
- Notes: Production alias now points to `https://meta-dashboard-qlfl2ia2z-byoroofers-projects.vercel.app`.

## 2026-04-07T23:42:07.7229540-05:00 | Disable demo adapters by default and gate scans

- Change summary: Added `MARKETPLACE_DEMO_MODE` env gate, disabled demo adapters by default, and gated scan actions when no live sources are enabled.
- Files changed: `lib/config/env.ts`, `lib/marketplace/adapters/index.ts`, `components/marketplace/marketplace-deals-workspace.tsx`, `.env.example`, `README.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: None.
- Reversal steps:
  1. Remove `MARKETPLACE_DEMO_MODE` from env config and set demo adapters to enabled by default.
  2. Remove the scan-button gating and toast warnings.
  3. Revert `.env.example` and `README.md` entries.
- Notes: This keeps demo data out of production until explicitly enabled.

## 2026-04-07T09:44:10.2228809-05:00 | Deploy coming-soon banner

- Change summary: Deployed the coming-soon banner for live marketplace scans.
- Files changed: `components/marketplace/marketplace-deals-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Revert commit `551e8f8` and redeploy.
  2. Use Vercel rollback/promote to return to the previous deployment if needed.
  3. Append a correction entry here if this log is inaccurate.
- Notes: Production alias now points to `https://meta-dashboard-4r20le0u3-byoroofers-projects.vercel.app`.

## 2026-04-07T09:36:20.3271124-05:00 | Deploy 15-minute marketplace cron cadence

- Change summary: Committed and deployed the 15-minute cron cadence for marketplace schedules.
- Files changed: `vercel.json`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Revert `vercel.json` schedule to the prior cadence and redeploy.
  2. Use Vercel rollback/promote to return to the previous deployment if needed.
  3. Append a correction entry here if this log is inaccurate.
- Notes: Production alias now points to `https://meta-dashboard-gh5fhlyin-byoroofers-projects.vercel.app`.

## 2026-04-07T09:33:56.8730311-05:00 | Restore session handoff after sandbox reset

- Change summary: Recreated missing `.agent/session_handoff.md` after a sandbox interruption.
- Files changed: `.agent/session_handoff.md`, `.agent/work_log.md`, `.agent/rollback_log.md`
- State-changing commands: None.
- Reversal steps:
  1. Remove `.agent/session_handoff.md` if this entry is incorrect.
  2. Append a correction entry here if needed.
- Notes: The cron cadence change remains un-deployed.

## 2026-04-06T18:52:57.4376744-05:00 | Update cron cadence to every 15 minutes

- Change summary: Adjusted the Vercel cron schedule for marketplace scans to run every 15 minutes.
- Files changed: `vercel.json`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: None (deployment pending).
- Reversal steps:
  1. Set the cron schedule back to the previous value in `vercel.json`.
  2. Redeploy the project.
  3. Append a correction entry here if this log is inaccurate.
- Notes: Cron cadence changes require a deployment to take effect.

## 2026-04-06T18:36:28.2024046-05:00 | Deploy Vercel cron configuration

- Change summary: Committed and deployed Vercel cron config for marketplace schedules.
- Files changed: `vercel.json`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Remove the `crons` block from `vercel.json` and redeploy.
  2. Use Vercel rollback/promote to return to the prior production deployment if needed.
  3. Append a correction entry here if this log is inaccurate.
- Notes: Production alias now points to `https://meta-dashboard-l19srdkfl-byoroofers-projects.vercel.app`.

## 2026-04-06T18:34:20.9667282-05:00 | Add Vercel cron for marketplace schedules

- Change summary: Added a Vercel cron entry to call the marketplace schedule runner hourly.
- Files changed: `vercel.json`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: None (file edit only; deployment pending).
- Reversal steps:
  1. Remove the `crons` block from `vercel.json`.
  2. Redeploy the project.
  3. Update `.agent/` memory with a correction entry if needed.
- Notes: Cron will only activate after a deploy.

## 2026-04-06T18:27:32.8402188-05:00 | Fix marketplace alert typing and redeploy production

- Change summary: Fixed `MarketplaceAlertChannel` typing in the marketplace scan flow, pushed the updates, and redeployed production.
- Files changed: `lib/services/marketplace-deals-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `git remote set-url origin https://github.com/byoroofer/meta_dashboard.git`; `git push origin codex/marketplace-deals`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Revert commits `fbef02d` and `655e543` if this fix needs to be removed.
  2. Redeploy the prior production deployment from Vercel.
  3. Append a correction entry here if this record is inaccurate.
- Notes: Production deployment succeeded and aliased to `https://tjware.me`.

## 2026-04-06T15:59:58.7073187-05:00 | Marketplace live adapters, alerts, and schedules

- Change summary: Added live marketplace adapters (eBay Browse API, SerpApi Google Shopping), alert storage + webhook option, schedule-ready scan runner endpoint, expanded marketplace UI, and a new Supabase migration for alerts/scheduling.
- Files changed: `components/marketplace/marketplace-deals-workspace.tsx`, `components/marketplace/listing-detail-panel.tsx`, `lib/marketplace/adapters/index.ts`, `lib/marketplace/adapters/ebay-browse.ts`, `lib/marketplace/adapters/serpapi.ts`, `lib/marketplace/normalization.ts`, `lib/marketplace/schemas.ts`, `lib/services/marketplace-deals-service.ts`, `lib/repositories/marketplace-deals-repository.ts`, `lib/config/env.ts`, `app/api/marketplace-deals/alerts/route.ts`, `app/api/marketplace-deals/schedules/run/route.ts`, `types/marketplace.ts`, `types/database.ts`, `supabase/migrations/0013_marketplace_alerts.sql`, `.env.example`, `README.md`, `.agent/*.md`.
- State-changing commands: `git clone D:\Meta Dashboard D:\Meta Dashboard\_worktrees\marketplace-engine2`; `git checkout codex/marketplace-deals`
- Reversal steps:
  1. Delete `lib/marketplace/adapters/ebay-browse.ts`, `lib/marketplace/adapters/serpapi.ts`, `app/api/marketplace-deals/alerts/route.ts`, `app/api/marketplace-deals/schedules/run/route.ts`, and `supabase/migrations/0013_marketplace_alerts.sql`.
  2. Revert updates in `components/marketplace/marketplace-deals-workspace.tsx`, `lib/services/marketplace-deals-service.ts`, `lib/repositories/marketplace-deals-repository.ts`, `types/marketplace.ts`, `types/database.ts`, `lib/marketplace/normalization.ts`, `lib/marketplace/schemas.ts`, `lib/marketplace/adapters/index.ts`, `lib/config/env.ts`, `.env.example`, and `README.md`.
  3. Apply a corrective migration to drop `marketplace_alerts` and the added columns from `marketplace_saved_searches` if the DB has already been migrated.
  4. Update `.agent/` memory files with a correction entry if this record is inaccurate.
- Notes: No tests were run in this pass; verify typecheck/lint/build after reverting.

## 2026-04-06T12:18:15.2918088-05:00 | Production scoped sync retry for Elite Cleaning and Brooke Vinson

- Change summary: Re-ran live scoped Meta sync attempts for the Brooke Vinson Instagram asset and Elite Cleaning Page asset, verified the resulting production audit/state, and confirmed that at least one scoped sync completed successfully on the server even though both client requests ended with `ECONNRESET`.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: production Node HTTPS requests against login, connected-accounts, meta-status, inbox, scoped import, and audit endpoints on `https://tjware.me/meta-dashboard`
- Reversal steps:
  1. No code rollback is required.
  2. If the production sync attempts need to be conceptually backed out, record the later corrective sync or deploy in this log rather than trying to undo the imported rows manually.
  3. Append a correction here if any part of the observed production counts or timestamps is inaccurate.
- Notes: Post-sync state remained `All inbox: 50`, `Elite Cleaning: 48`, `Brooke Vinson: 2`, and connected assets remained `3`, so the importer appears to have plateaued on currently accessible data.

## 2026-04-06T12:07:44.9811072-05:00 | Inbox preview enrichment and fallback thread body display

- Change summary: Updated inbox conversation previews to use the latest imported message body or preserved archive snippet, added a display-only fallback message when a selected thread has zero imported messages, and redeployed production.
- Files changed: `lib/repositories/dashboard-repository.ts`, `lib/services/inbox-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run lint`; `cmd /c npm run build`; `cmd /c npm run typecheck`; `cmd /c npx vercel deploy --prod --yes`; production Node HTTPS checks against Brooke Vinson inbox list and thread APIs
- Reversal steps:
  1. Remove the latest-message/archive-snippet preview logic from `lib/repositories/dashboard-repository.ts`.
  2. Remove the synthetic fallback message injection from `lib/services/inbox-service.ts`.
  3. Redeploy production.
  4. Revert the `.agent/` memory-file updates if this log entry is incorrect.
- Notes: This improves inbox rendering for zero-message threads but does not fix upstream missing Meta message rows.

## 2026-04-06T12:02:22.4926547-05:00 | Commit marketplace-deals branch and deploy production from clean temp clone

- Change summary: Created branch `codex/marketplace-deals`, committed the marketplace-deals feature as `ff6cba6` (`Add marketplace deals workflow`), then deployed that committed branch to Vercel production from a clean temporary clone so unrelated dirty files in the active worktree were not included.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `git checkout -b codex/marketplace-deals`; `git add -- ...`; `git commit -m "Add marketplace deals workflow"`; escalated PowerShell command that cloned `codex/marketplace-deals` into `D:\Temp\meta-dashboard-marketplace-deploy`, copied `.vercel`, and ran `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Use Vercel to redeploy the prior production deployment if the new deployment must be rolled back quickly.
  2. Revert commit `ff6cba6` and the follow-up memory commit on `codex/marketplace-deals` if the branch history needs to back out this work.
  3. Remove or ignore the temporary deployment clone under `D:\Temp\meta-dashboard-marketplace-deploy` if it is no longer needed.
  4. Append a correction entry here if any part of this record is inaccurate.
- Notes: Production alias returned to `https://tjware.me`; deployment URL was `https://meta-dashboard-fesc197vl-byoroofers-projects.vercel.app`.

## 2026-04-06T10:55:13.2914491-05:00 | Marketplace-deals feature, schema, and API surface

- Change summary: Added the new `/marketplace-deals` dashboard page and listing-detail page, new marketplace API routes, a modular marketplace engine (`lib/marketplace/**`), a new repository/service pair for saved searches and scan persistence, a new Supabase migration `0012_marketplace_deals.sql`, new OpenAI env plumbing, and README/memory updates. The initial enabled adapters are demo-only and the marketplace pages were forced dynamic after build verification.
- Files changed: `app/(dashboard)/marketplace-deals/page.tsx`, `app/(dashboard)/marketplace-deals/[listingId]/page.tsx`, `app/api/marketplace-deals/saved-searches/route.ts`, `app/api/marketplace-deals/scans/route.ts`, `app/api/marketplace-deals/results/route.ts`, `app/api/marketplace-deals/listings/[listingId]/route.ts`, `app/api/marketplace-deals/listings/[listingId]/status/route.ts`, `app/api/marketplace-deals/export/route.ts`, `components/app-shell/app-sidebar.tsx`, `components/marketplace/listing-detail-panel.tsx`, `components/marketplace/marketplace-deals-workspace.tsx`, `lib/config/env.ts`, `lib/navigation.ts`, `lib/marketplace/adapters/index.ts`, `lib/marketplace/ai.ts`, `lib/marketplace/comparison.ts`, `lib/marketplace/csv.ts`, `lib/marketplace/demo-data.ts`, `lib/marketplace/normalization.ts`, `lib/marketplace/schemas.ts`, `lib/repositories/marketplace-deals-repository.ts`, `lib/services/marketplace-deals-service.ts`, `supabase/migrations/0012_marketplace_deals.sql`, `types/database.ts`, `types/marketplace.ts`, `README.md`, `.env.example`, `.agent/project_overview.md`, `.agent/open_issues.md`, `.agent/decisions.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build`
- Reversal steps:
  1. Delete `app/(dashboard)/marketplace-deals/**`, `app/api/marketplace-deals/**`, `components/marketplace/**`, `lib/marketplace/**`, `lib/repositories/marketplace-deals-repository.ts`, `lib/services/marketplace-deals-service.ts`, `types/marketplace.ts`, and `supabase/migrations/0012_marketplace_deals.sql`.
  2. Revert the marketplace-related edits in `components/app-shell/app-sidebar.tsx`, `lib/navigation.ts`, `lib/config/env.ts`, `types/database.ts`, `README.md`, `.env.example`, and the `.agent/` files.
  3. Rerun `cmd /c npm run typecheck`, `cmd /c npm run lint`, and `cmd /c npm run build`.
  4. If the rollback is meant to preserve docs history, append a correction entry in the `.agent/` files instead of deleting history.
- Notes: The feature is safe to keep in demo mode today. Real market-data usage still requires future source-specific live adapters.

## 2026-04-06T08:18:27.6835584-05:00 | Scoped Meta source diagnostics and Page-backed IG request-node fix

- Change summary: Added per-source Meta conversation diagnostics to sync-job/audit metadata, deployed production, used the first live diagnostics run to catch an IG request-node bug (`/{ig-business-account-id}/conversations`), switched the IG history path back to the Page-backed conversations edge, redeployed, and verified that the Brooke Vinson scoped inbox now shows 2 conversations in production.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/decisions.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run typecheck`; `cmd /c npm run lint`; `cmd /c npm run build` (twice); `cmd /c npx vercel deploy --prod --yes` (twice); production Node HTTPS checks against auth, scoped import, inbox conversations, and connected-asset logs
- Reversal steps:
  1. Remove `MetaPagedCollection` and `getConversationsWithDiagnostics(...)` from `lib/meta/client.ts`.
  2. Remove `conversationSourceDiagnostics` writes from `lib/meta/sync-service.ts`.
  3. Restore the old IG request node if this diagnosis is later proven wrong.
  4. Redeploy production.
  5. Revert the `.agent/` memory-file updates if this log entry is incorrect.
- Notes: The first live diagnostics run exposed the direct IG conversations edge bug immediately. After the Page-backed fix, the Brooke asset moved from 1 to 2 conversations, but one new thread still has 0 imported messages and needs further inspection.

## 2026-04-05T19:51:51.5891345-05:00 | IG external-ID fix and direct Meta validation

- Change summary: Fixed the Instagram importer to use the external Meta IG business account ID instead of the internal connected-asset UUID, redeployed production, and directly validated with the new user token that Meta still returns only one Page-backed Instagram conversation while rejecting the direct IG conversations edge with capability error `(#3)`.
- Files changed: `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; live production and direct Meta Graph `Invoke-RestMethod` / `Invoke-WebRequest` checks
- Reversal steps:
  1. Restore the previous IG asset-ID wiring in `lib/meta/sync-service.ts`.
  2. Redeploy production.
  3. Revert the `.agent/` memory-file updates if this log entry is incorrect.
- Notes: This fixed a genuine importer bug, but it did not increase the number of IG conversations Meta exposes for `brookevinson`.

## 2026-04-05T18:54:23.1561855-05:00 | Four-phase inbox import and richer archive/contact enrichment

- Change summary: Split historical inbox import into four lighter Meta request phases, added thread-detail and participant-profile fetches, enriched contact records with Meta profile data, archived separate thread/profile snapshots, redeployed production, and verified another successful `Brooke Vinson` scoped sync.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; live production `Invoke-RestMethod` / `Invoke-WebRequest` checks for scoped import, connected-asset logs, and archive queries
- Reversal steps:
  1. Remove `getConversationDetails(...)` and `getParticipantProfile(...)` from `lib/meta/client.ts`.
  2. Remove the new contact enrichment fields, thread/profile archive events, and expanded message archive payload additions from `lib/meta/sync-service.ts`.
  3. Redeploy production.
  4. Revert the `.agent/` memory-file updates if this log entry is incorrect.
- Notes: The live `Brooke Vinson` scoped sync still succeeded after this enrichment pass with `1` conversation and `109` messages.

## 2026-04-05T18:44:57.9687821-05:00 | Lighter IG message-history fetch and live Brooke Vinson verification

- Change summary: Reduced Meta conversation-message payload size, passed platform-specific limits into historical message import, redeployed production, and verified a successful live `Brooke Vinson` scoped sync.
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`; live production `Invoke-RestMethod` / `Invoke-WebRequest` calls for scoped import and inbox verification
- Reversal steps:
  1. Restore the previous `getConversationMessages(...)` field set and higher limits in `lib/meta/client.ts`.
  2. Restore the heavier attachment metadata mapping in `lib/meta/sync-service.ts` if it must be preserved despite the Meta payload limit.
  3. Redeploy production.
  4. Revert the `.agent/` memory-file updates if this log entry is incorrect.
- Notes: The live `Brooke Vinson` scoped import succeeded after this change with `1` conversation and `109` messages imported.

## 2026-04-05T18:37:23.5738896-05:00 | IG-only scoped sync narrowing and sync-button error handling

- Change summary: Narrowed Instagram asset scoped sync so it only imports IG conversations, narrowed Page asset scoped sync so it stays Page-specific, hardened the sync button against non-JSON error responses, and redeployed production.
- Files changed: `lib/meta/sync-service.ts`, `components/meta/meta-sync-button.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- State-changing commands: live `Invoke-WebRequest` / `Invoke-RestMethod` checks against production auth, connected-accounts, import, inbox, leads, and audit routes; `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes` (twice)
- Reversal steps:
  1. Remove the `conversationPlatforms` and `includeLeads` narrowing from `lib/meta/sync-service.ts`.
  2. Restore `components/meta/meta-sync-button.tsx` to the prior response-parsing behavior if the text-first approach should be rolled back.
  3. Redeploy production.
  4. Revert the `.agent/` memory-file updates if this record is incorrect.
- Notes: The production `Brooke Vinson` asset still showed zero conversations/leads immediately after the first scoped attempt, but operators should now see the actual backend error text instead of the JSON parse exception on the next attempt.

## 2026-04-05T18:23:23.6479562-05:00 | Scoped Meta sync for inbox and leads

- Change summary: Added a scoped Meta sync path for the currently selected business or Page/Instagram asset, wired the API route to accept `businessId`/`assetId`, updated the sync button to post the active scope, added the same control to the Leads page, and deployed production.
- Files changed: `lib/meta/sync-service.ts`, `app/api/meta/import/route.ts`, `components/meta/meta-sync-button.tsx`, `components/leads/leads-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npm run lint`; `cmd /c npm run typecheck`; `cmd /c npm run build`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Remove the scoped-sync helpers and `SyncMetaDataOptions` path from `lib/meta/sync-service.ts`.
  2. Restore `app/api/meta/import/route.ts` to always call the full importer with no request-body scope.
  3. Restore `components/meta/meta-sync-button.tsx` to always trigger a full sync and remove the scoped button labels.
  4. Remove `MetaSyncButton` from `components/leads/leads-workspace.tsx` if the leads page should not expose sync controls.
  5. Redeploy production.
  6. Revert the `.agent/` memory-file updates if this log entry is incorrect.
- Notes: This does not remove the full-import timeout; it adds a practical production workaround so newly assigned assets can be populated without waiting for a broad import to finish.

## 2026-04-05T15:31:59.2269525-05:00 | Multi-page Meta messaging token support

- Change summary: Added support for multiple configured Meta Page messaging tokens, including a configured-page fallback import path for pages the system-user discovery path does not return, and deployed production with a two-page token map for Elite Cleaning and TJ Ware for Congress.
- Files changed: `.env.example`, `lib/config/env.ts`, `lib/meta/sync-service.ts`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `npx vercel env add META_MESSAGING_PAGE_TOKEN_MAP production --value ...`; `cmd /c npx vercel deploy --prod --yes --force`; `cmd /c npx vercel env pull .tmp-vercel.env --environment production --yes`; live `curl.exe` verification against `https://tjware.me/meta-dashboard/api/meta/status`, `.../api/meta/import`, and `.../api/connected-accounts`
- Reversal steps:
  1. Remove `META_MESSAGING_PAGE_TOKEN_MAP` from `.env.example`.
  2. Remove the multi-page parser/helpers from `lib/config/env.ts`.
  3. Remove the configured-page fallback import path from `lib/meta/sync-service.ts` and fall back to the legacy single-page override only.
  4. Remove the production `META_MESSAGING_PAGE_TOKEN_MAP` env var or leave it unused.
  5. Redeploy production.
  6. Revert the `.agent/` memory-file updates if this record is incorrect.
- Notes: Production config verified live with `metaMessagingPageOverrideCount: 2`, but a full production import still times out before the second-page import can be confirmed.

## 2026-04-05T15:28:01.9399370-05:00 | Harden standalone Python bot runtime

- Change summary: Added env-file loading, one-shot execution, intent-based reply gating, richer draft metadata, and updated tests/docs for the standalone Python social engagement bot.
- Files changed: `automation/social_engagement_bot/.env.social-bot.example`, `automation/social_engagement_bot/README.md`, `automation/social_engagement_bot/bot.py`, `automation/social_engagement_bot/config.py`, `automation/social_engagement_bot/facebook_client.py`, `automation/social_engagement_bot/filters.py`, `automation/social_engagement_bot/models.py`, `automation/social_engagement_bot/reddit_client.py`, `automation/social_engagement_bot/requirements.txt`, `automation/social_engagement_bot/state.py`, `automation/social_engagement_bot/tests/test_filters.py`, `README.md`, `.agent/project_overview.md`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m unittest discover -s automation/social_engagement_bot/tests -p "test_*.py"`; `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m compileall automation/social_engagement_bot`
- Reversal steps:
  1. Remove the new `BOT_ENV_FILE`, `BOT_ONE_SHOT`, and `BOT_REQUIRE_QUESTION_OR_INTENT` support from the bot files.
  2. Restore the previous draft payload shape and author-filter behavior if the stricter flow is not desired.
  3. Revert the README and `.agent/` updates associated with this hardening pass.
- Notes: This pass focused on safer defaults rather than new platform coverage.

## 2026-04-05T15:20:30.5104131-05:00 | Standalone Python social engagement bot scaffold

- Change summary: Added an isolated Python social engagement bot under `automation/social_engagement_bot` with Reddit/Facebook polling, OpenAI-generated replies, file-based dedupe/draft persistence, lightweight tests, and matching documentation updates.
- Files changed: `automation/__init__.py`, `automation/social_engagement_bot/.gitignore`, `automation/social_engagement_bot/.env.social-bot.example`, `automation/social_engagement_bot/README.md`, `automation/social_engagement_bot/__init__.py`, `automation/social_engagement_bot/bot.py`, `automation/social_engagement_bot/config.py`, `automation/social_engagement_bot/facebook_client.py`, `automation/social_engagement_bot/filters.py`, `automation/social_engagement_bot/models.py`, `automation/social_engagement_bot/openai_client.py`, `automation/social_engagement_bot/prompting.py`, `automation/social_engagement_bot/reddit_client.py`, `automation/social_engagement_bot/requirements.txt`, `automation/social_engagement_bot/state.py`, `automation/social_engagement_bot/tests/test_filters.py`, `automation/social_engagement_bot/tests/test_prompting.py`, `.gitignore`, `README.md`, `.agent/project_overview.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/decisions.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- State-changing commands: `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m unittest discover -s automation/social_engagement_bot/tests -p "test_*.py"`; `& 'C:\Users\warep\AppData\Local\Programs\Python\Launcher\py.exe' -m compileall automation/social_engagement_bot`
- Reversal steps:
  1. Delete `automation/social_engagement_bot/` and `automation/__init__.py`.
  2. Remove the Python cache ignore lines from `.gitignore` if they are no longer desired.
  3. Remove the Python bot sections from `README.md` and `.agent/project_overview.md`.
  4. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: Verification passed after rerunning the Python commands with the resolved launcher path outside the sandbox because the current PowerShell environment did not expose `py` directly.

## 2026-04-05T09:02:38.6804244-05:00 | Deploy root privacy policy URL

- Change summary: Replaced the placeholder privacy page with a Meta-facing privacy policy, added a root `/privacy` rewrite, deployed production, and verified the live URL.
- Files changed: `app/privacy/page.tsx`, `vercel.json`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes --force`
- Reversal steps:
  1. Restore the previous `app/privacy/page.tsx` content.
  2. Remove the `/privacy` rewrite from `vercel.json`.
  3. Redeploy production.
  4. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: Live verification of `https://tjware.me/privacy` returned HTTP `200` after deployment.

## 2026-04-05T08:57:38.4793892-05:00 | Deploy live data deletion callback

- Change summary: Deployed the new Meta data deletion callback route to production and verified the live root URL responds correctly on `tjware.me`.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes --force`
- Reversal steps:
  1. Redeploy a prior production deployment if the live callback should be removed immediately.
  2. Revert the callback-route changes locally and redeploy production if the feature should be rolled back permanently.
  3. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: Live verification of `https://tjware.me/api/meta/data-deletion?confirmation_code=test-code` returned success JSON after deployment.

## 2026-04-05T08:53:18.1336930-05:00 | Meta data deletion callback route

- Change summary: Added a public Meta data deletion callback API route, a public status page, and the required auth/rewrite wiring so Meta can call a stable root URL.
- Files changed: `app/api/meta/data-deletion/route.ts`, `app/data-deletion-status/page.tsx`, `proxy.ts`, `vercel.json`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run lint`, `cmd /c npm run build`, and `cmd /c npm run typecheck`
- Reversal steps:
  1. Delete `app/api/meta/data-deletion/route.ts`.
  2. Delete `app/data-deletion-status/page.tsx`.
  3. Remove the public-path exceptions in `proxy.ts`.
  4. Remove the `/api/meta/data-deletion` rewrite from `vercel.json`.
  5. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: This route is implemented locally and still needs a production deploy before the root callback URL will work on `tjware.me`.

## 2026-04-05T08:50:04.7160947-05:00 | DASH app icon asset creation

- Change summary: Created a `DASH` Meta app icon as SVG source plus PNG/JPG exports under `public/brand/`.
- Files changed: `public/brand/meta-dashboard-app-icon.svg`, `public/brand/meta-dashboard-app-icon.png`, `public/brand/meta-dashboard-app-icon.jpg`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: local file generation only; used PowerShell `System.Drawing` export commands and image verification
- Reversal steps:
  1. Delete `public/brand/meta-dashboard-app-icon.svg`.
  2. Delete `public/brand/meta-dashboard-app-icon.png`.
  3. Delete `public/brand/meta-dashboard-app-icon.jpg`.
  4. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: The first bitmap export failed due to a font-constructor issue and was rerun successfully.

## 2026-04-05T08:39:41.3968720-05:00 | Live sync retry with exact Meta permission error

- Change summary: Reran the live production Meta sync after the user's permission changes and captured the exact production inbox-history error in the sync status output.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- State-changing commands: `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/import -Method POST`
- Reversal steps:
  1. No code or schema rollback is needed because this task did not change runtime files.
  2. Rerun the live sync after publishing the app or fixing Page role assignment.
  3. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: Meta returned `(#200) Requires permission: pages_messaging or User associated with the Page access token does not have an appropriate role on the Page.`

## 2026-04-04T21:26:53.2633957-05:00 | Inbox-history skip diagnostics

- Change summary: Extended the Meta importer to retain exact inbox-history skip reasons in `sync_jobs.metadata` and `audit_logs.metadata`, and to include the first skip reason in the sync detail string.
- Files changed: `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run lint`, `cmd /c npm run build`, and `cmd /c npm run typecheck`
- Reversal steps:
  1. Remove the `inboxHistorySkips` collection and metadata/detail updates from `lib/meta/sync-service.ts`.
  2. Restore the previous sync-job and audit-log metadata shape if needed.
  3. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: This does not grant any new Meta access. It only makes the existing skip reason visible on the next live sync.

## 2026-04-04T21:25:03.6177924-05:00 | Remove optimistic Meta messaging-scope claims

- Change summary: Removed hardcoded messaging/lead scope claims from the Meta importer so the dashboard no longer reports capabilities the live token does not actually have.
- Files changed: `lib/meta/sync-service.ts`, `.agent/open_issues.md`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run lint`, `cmd /c npm run build`, and `cmd /c npm run typecheck`
- Reversal steps:
  1. Restore the previous hardcoded `granted_scopes` arrays in `lib/meta/sync-service.ts`.
  2. Revert the `.agent/open_issues.md` updates if the debugger findings were recorded incorrectly.
  3. Revert the `.agent/` memory-file edits if this log entry is incorrect.
- Notes: This is a correctness fix for displayed/imported capability state, not a functional permission grant. Actual inbox import still depends on Meta issuing the missing scopes.

## 2026-04-04T21:06:24.1720898-05:00 | Production Meta token rotation and live resync

- Change summary: Replaced the production Meta system-user token in Vercel, redeployed production, and reran the live Meta sync plus inbox verification.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel env add META_SYSTEM_USER_ACCESS_TOKEN production --value ... --yes --sensitive --force`; `cmd /c npx vercel deploy --prod --yes --force`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/import -Method POST`
- Reversal steps:
  1. Restore the previous production token in Vercel if the new token should be rolled back.
  2. Redeploy production so the restored token takes effect.
  3. Rerun the live sync after any Meta-side permission changes.
  4. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: The new token did not change inbox import results; production still returned `conversations=0`, `messages=0`, and `inboxHistorySkipped=1`.

## 2026-04-04T20:18:41.5299047-05:00 | Live production Meta sync verification

- Change summary: Logged into the deployed dashboard, triggered a real production Meta sync, and verified the production inbox API state afterward.
- Files changed: `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `Invoke-WebRequest https://tjware.me/meta-dashboard/api/auth/login -Method POST`; `Invoke-WebRequest https://tjware.me/meta-dashboard/api/meta/import -Method POST`
- Reversal steps:
  1. No code or schema rollback is needed because this task did not change repo files beyond memory updates.
  2. To supersede the remote sync result, correct the Meta messaging-access issue and rerun the live sync.
  3. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: The live sync succeeded, but imported `0` conversations and `0` messages with `inboxHistorySkipped: 1`, and the deployed inbox API still returned an empty array.

## 2026-04-04T20:18:41.5299047-05:00 | Inbox-side Meta sync control

- Change summary: Added the Meta sync control directly to the inbox workspace, updated the empty-state guidance, and expanded sync success feedback to include conversation/message counts for inbox population confirmation.
- Files changed: `components/inbox/inbox-workspace.tsx`, `components/meta/meta-sync-button.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run build`, `cmd /c npm run lint`, and `cmd /c npm run typecheck`
- Reversal steps:
  1. Remove `MetaSyncButton` from `components/inbox/inbox-workspace.tsx`.
  2. Restore the previous inbox empty-state copy in `components/inbox/inbox-workspace.tsx`.
  3. Revert `components/meta/meta-sync-button.tsx` to the previous sync summary text if the expanded counts should not be shown.
  4. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: The first `typecheck` run again depended on fresh Next-generated route types, so `build` had to run before the final passing `typecheck`.

## 2026-04-04T20:11:58.3626442-05:00 | Populate archive messages with real message rows

- Change summary: Added a scoped message aggregator, updated the archive service and API to return actual message rows, and updated the archive message workspace to display populated message copies plus snapshot metadata.
- Files changed: `lib/repositories/dashboard-repository.ts`, `lib/services/archive-service.ts`, `app/api/archive/messages/route.ts`, `components/archive/archive-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run build`, `cmd /c npm run lint`, and `cmd /c npm run typecheck`
- Reversal steps:
  1. Remove `getMessages(scope)` from `lib/repositories/dashboard-repository.ts`.
  2. Restore the previous `messages` source in `lib/services/archive-service.ts`.
  3. Revert `app/api/archive/messages/route.ts` to the previous archive-event-only payload if needed.
  4. Revert the actual-message rendering changes in `components/archive/archive-workspace.tsx`.
  5. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: The first `typecheck` run depended on fresh Next-generated route types, so `build` had to run before the final passing `typecheck`.

## 2026-04-04T20:03:29.5818340-05:00 | Browseable immutable archive viewer

- Change summary: Reworked the archive workspace and its API/service/repository contract to expose the immutable communication archive as a readable dashboard surface, then deployed the updated viewer to production.
- Checkpoint before archive/import work: `b42360b3314007e3ab3e431f455a4296cf3df5be`
- Files changed: `components/archive/archive-workspace.tsx`, `app/api/archive/messages/route.ts`, `lib/services/archive-service.ts`, `lib/repositories/dashboard-repository.ts`, `types/domain.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. Revert `components/archive/archive-workspace.tsx` to the prior archive UI.
  2. Revert `app/api/archive/messages/route.ts`, `lib/services/archive-service.ts`, `lib/repositories/dashboard-repository.ts`, and `types/domain.ts` to the previous archive payload shape.
  3. Redeploy production after the revert if the live archive viewer must be removed.
  4. Or reset to `b42360b3314007e3ab3e431f455a4296cf3df5be` if the entire importer/archive track needs to be abandoned.
  5. Revert the `.agent/` memory-file edits if this log entry is incorrect.
- Notes: This change improves visibility only; archive immutability remains enforced by the append-only database layer introduced earlier.

## 2026-04-04T20:00:37.5998814-05:00 | Connected-asset message and lead log retrieval endpoint

- Change summary: Added a new connected-asset logs API route, service assembly layer, repository helpers, and shared types so one request can retrieve message threads/messages and leads/lead activities for a specific connected asset.
- Files changed: `types/domain.ts`, `lib/repositories/dashboard-repository.ts`, `lib/services/connected-asset-logs-service.ts`, `app/api/connected-assets/[assetId]/logs/route.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: no external systems mutated; verification commands were `cmd /c npm run typecheck`, `cmd /c npm run lint`, and `cmd /c npm run build`
- Reversal steps:
  1. Delete `app/api/connected-assets/[assetId]/logs/route.ts`.
  2. Delete `lib/services/connected-asset-logs-service.ts`.
  3. Revert the added repository helpers in `lib/repositories/dashboard-repository.ts`.
  4. Revert the added connected-asset log types in `types/domain.ts`.
  5. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: This change is additive only and does not modify database state, production deployments, or external credentials.

## 2026-04-04T17:05:02-05:00 | Immutable communication archive layer

- Change summary: Added separate append-only communication archive tables and writer logic, wired archive writes into inbound webhooks, outbound sends, and historical inbox import, deployed production, and pushed migration `0011_immutable_communication_archive.sql` to the linked Supabase project.
- Checkpoint before archive/import work: `b42360b3314007e3ab3e431f455a4296cf3df5be`
- Files changed: `supabase/migrations/0011_immutable_communication_archive.sql`, `lib/archive/communication-archive.ts`, `lib/meta/message-preservation.ts`, `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `types/database.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes`; `cmd /c npx supabase db push --linked`
- Reversal steps:
  1. `git reset --hard b42360b3314007e3ab3e431f455a4296cf3df5be` to return to the exact checkpoint before import/archive work.
  2. If the remote schema must be reversed, create and apply a new corrective migration that drops or disables `communication_archive_events`, `communication_archive_attachments`, and `prevent_archive_mutation`.
  3. Or revert `lib/archive/communication-archive.ts`, `lib/meta/message-preservation.ts`, `lib/meta/client.ts`, `lib/meta/sync-service.ts`, and `types/database.ts` selectively once the current work is committed.
  4. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: The new archive layer is database-backed because local files are not durable on Vercel. Call/video-call capture still depends on live Meta payload availability.

## 2026-04-04T16:26:58-05:00 | Historical inbox backfill and importer access hardening

- Change summary: Added page conversation/message history import support, normalized historical inbox data into the existing conversation/message/archive tables, and made missing inbox-history access skip gracefully instead of aborting the full Meta import.
- Checkpoint before this work: `b42360b3314007e3ab3e431f455a4296cf3df5be`
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/open_issues.md`, `.agent/session_handoff.md`
- State-changing commands: `git commit -m "Checkpoint current UI state before import work"`; `cmd /c npx vercel deploy --prod --yes`
- Reversal steps:
  1. `git reset --hard b42360b3314007e3ab3e431f455a4296cf3df5be` to return to the exact pre-import-work checkpoint.
  2. Or revert `lib/meta/client.ts` and `lib/meta/sync-service.ts` once the current work is committed if only the importer changes need to be removed.
  3. Revert the `.agent/` memory-file edits if this record is incorrect.
- Notes: TypeScript and ESLint passed after the importer changes. Production deploy completed, but the new import flow still depends on external Meta permissions/business settings to populate data.

## 2026-04-04T16:09:06-05:00 | Inbox, leads, and ads UI upgrade pass

- Change summary: Replaced the inbox table with a conversation-list UI and richer thread/composer, replaced the leads table with a kanban-style board, and added ad reporting trend cards with inline sparklines.
- Files changed: `components/inbox/inbox-workspace.tsx`, `components/inbox/reply-composer.tsx`, `components/leads/leads-workspace.tsx`, `components/ads/ads-workspace.tsx`, `.agent/work_log.md`, `.agent/rollback_log.md`, `.agent/session_handoff.md`
- State-changing commands: `cmd /c npx vercel deploy --prod --yes`; verification commands were `cmd /c npx tsc --noEmit` and `cmd /c npx eslint .`
- Reversal steps:
  1. Restore the prior table-driven `components/inbox/inbox-workspace.tsx`.
  2. Remove `components/inbox/reply-composer.tsx`.
  3. Restore the prior `components/leads/leads-workspace.tsx`.
  4. Restore the prior `components/ads/ads-workspace.tsx`.
  5. Revert the `.agent/` memory-file edits if this session record is incorrect.
- Notes: Verification passed after fixing typed-route casts and icon import collisions. Production deploy completed and was aliased to `https://tjware.me`.

## 2026-04-04T12:00:00-05:00 | Meta live import fixes and date timezone

- Change summary: 8 commits fixing the Meta import fallback path iteratively. Import now populates live data. Dates now display in America/Chicago.
- Commits (newest first): `b8bfb06`, `f79c51b`, `8dbccb5`, `f67d240`, `fd036c8`, `665d47a`, `4dd352d`, `8083917`
- Files changed: `lib/meta/client.ts`, `lib/meta/sync-service.ts`, `lib/utils.ts`, `components/meta/meta-sync-button.tsx`
- Reversal steps:
  1. `git revert b8bfb06` to restore throwing on leads permission error (re-blocks import).
  2. `git reset --hard 63faebe` to return to the state before this entire session's work.
  3. To roll back only the timezone change: `git revert 8083917`.
- Notes: The META_SYSTEM_USER_ACCESS_TOKEN was rotated in Vercel this session. The old token is invalid. Do not revert the Vercel env var.

## 2026-04-03T02:30:00-05:00 | UI premium upgrade and Meta integration diagnostics

- Change summary: Upgraded 18 files for visual/UX quality (shell, shared components, sidebar, header, account switcher, metric cards, data tables, empty states, filter bar, badges) and added a Meta integration health route + sync button diagnostics panel. Persisted import counts into sync_jobs.metadata. Added getConfigStatus() to env.ts without exposing secret values.
- Commits: `548819c` (baseline checkpoint of prior session's work), `044500a` (this session's changes)
- Reversal steps:
  1. `git revert 044500a` to undo this session's UI and diagnostic changes, keeping prior work intact.
  2. Or `git reset --hard 548819c` to return to the exact pre-session state (use only if 044500a changes should be completely abandoned).
  3. Delete `app/api/meta/status/route.ts` if the diagnostic endpoint should not be exposed.
  4. Revert `lib/meta/sync-service.ts` if persisting counts to sync_jobs.metadata causes any schema conflict.
- Notes: All changes are purely additive and UI/diagnostic in nature. No schema migrations were applied this session. Typecheck and lint passed cleanly.

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
