import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import { getConfigStatus } from "@/lib/config/env";
import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";

export async function GET() {
  await requireAdminSession();

  const config = getConfigStatus();

  // Fetch last sync job status without exposing sensitive data
  let lastSync: { status: string; detail: string; startedAt: string; completedAt: string | null; counts: Record<string, number> | null } | null = null;

  const client = getSupabaseAdminClient();
  if (client) {
    const result = await client
      .from("sync_jobs")
      .select("status,detail,started_at,completed_at,metadata")
      .eq("scope", "meta-full-import")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!result.error && result.data) {
      const row = result.data as Record<string, unknown>;
      lastSync = {
        status: String(row.status ?? ""),
        detail: String(row.detail ?? ""),
        startedAt: String(row.started_at ?? ""),
        completedAt: row.completed_at ? String(row.completed_at) : null,
        counts: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, number>) : null
      };
    }
  }

  // Derive an overall readiness verdict
  const allMetaReady = config.metaAppCredentials && config.metaSystemUser && config.supabaseAdmin;
  const businessesFound = (lastSync?.counts?.["businesses"] ?? 0) > 0;

  let verdict: "ready" | "no_businesses" | "missing_config" | "never_run" = "ready";
  if (!allMetaReady) verdict = "missing_config";
  else if (!lastSync) verdict = "never_run";
  else if (!businessesFound) verdict = "no_businesses";

  return NextResponse.json({ config, lastSync, verdict });
}
