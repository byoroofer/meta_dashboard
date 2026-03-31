# Meta Dashboard

Private internal business dashboard for supported Meta business and professional assets only:

- Facebook Page messages
- Instagram professional DMs
- Meta lead form submissions
- Meta ad account reporting
- CRM contact history
- Raw webhook and message archive preservation

## Architecture Summary

- `app/`: Next.js App Router pages, route groups, and server route handlers
- `components/`: shared shell, feature workspaces, and `shadcn/ui`-style primitives
- `lib/`: auth, config, Meta integration boundaries, archive helpers, audit helpers, repositories, and services
- `types/`: domain, API, Meta, and database typing
- `supabase/migrations/`: paste-ready SQL schema, indexes, views, and helper functions

The current scaffold uses typed mock repositories so the UI and route handlers are stable before live Meta and Supabase credentials are connected.

## Core Preservation Model

1. Receive raw webhook payload
2. Persist raw payload exactly as received
3. Verify signature and dedupe event
4. Normalize operational entities
5. Build canonical archive snapshot
6. Hash archive record
7. Write audit/process trail

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_WEBHOOK_VERIFY_TOKEN`
- `META_WEBHOOK_APP_SECRET`
- `META_SYSTEM_USER_ACCESS_TOKEN`
- `ENCRYPTION_KEY`

## Local Setup

1. Install dependencies:

```powershell
cmd /c npm install
```

2. Start the app:

```powershell
cmd /c npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Build and Verification

Run the type check:

```powershell
cmd /c npm run typecheck
```

Run the linter:

```powershell
cmd /c npm run lint
```

Run the production build:

```powershell
cmd /c npm run build
```

## Supabase

Apply the migration files in order:

- `supabase/migrations/0001_core_schema.sql`
- `supabase/migrations/0002_indexes_and_constraints.sql`
- `supabase/migrations/0003_views_and_helper_functions.sql`
- `supabase/migrations/0004_automation_and_lead_delivery.sql`

These migrations create the required operational, archive, sync, and audit tables plus helper views.

## Deployment

- GitHub repo root should contain the app
- Vercel root directory should be `/`
- Add the same environment variables in Vercel Project Settings
- Do not expose Meta or Supabase privileged keys to client code

## Next Phase

- Replace the mock repository with Supabase-backed adapters
- Implement real Meta webhook HMAC verification
- Add token encryption-at-rest
- Activate real admin auth and MFA enforcement
- Add queue-backed webhook normalization workers

