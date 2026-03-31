import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import { consentSubmissionSchema, getClientIpAddress } from "@/lib/privacy/consent";

export async function POST(request: Request) {
  const parsed = consentSubmissionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }

  const client = getSupabaseAdminClient();

  if (!client) {
    return NextResponse.json({
      success: true,
      data: {
        persistenceMode: "disabled",
        consentStored: false
      }
    });
  }

  const visitorResult = await client
    .from("visitor_profiles")
    .select("id")
    .eq("anonymous_id", parsed.data.anonymousId)
    .maybeSingle();

  const sessionResult = await client
    .from("sessions")
    .select("id")
    .eq("session_token", parsed.data.sessionToken)
    .maybeSingle();

  if (visitorResult.error || sessionResult.error) {
    return NextResponse.json(
      { success: false, error: visitorResult.error?.message ?? sessionResult.error?.message ?? "Lookup failed." },
      { status: 500 }
    );
  }

  const consentInsert = await client
    .from("consents")
    .insert({
      visitor_id: visitorResult.data?.id ?? null,
      session_id: sessionResult.data?.id ?? null,
      policy_version: parsed.data.policyVersion,
      consent_source: parsed.data.consentSource,
      consent_action: parsed.data.consentAction,
      necessary: true,
      analytics: parsed.data.preferences.analytics,
      marketing: parsed.data.preferences.marketing,
      consented_at: new Date().toISOString(),
      ip_address: getClientIpAddress(request.headers),
      user_agent: request.headers.get("user-agent"),
      proof: {
        page: parsed.data.page ?? null,
        anonymous_id: parsed.data.anonymousId,
        session_token: parsed.data.sessionToken
      }
    })
    .select("id")
    .single();

  if (consentInsert.error) {
    return NextResponse.json({ success: false, error: consentInsert.error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      persistenceMode: "database",
      consentStored: true,
      consentId: consentInsert.data.id
    }
  });
}
