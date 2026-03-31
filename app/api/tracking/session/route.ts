import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import { classifySourceChannel, consentPreferencesSchema, getClientIpAddress, getReferrerDomain } from "@/lib/privacy/consent";

const sessionPayloadSchema = z.object({
  anonymousId: z.string().min(8),
  sessionToken: z.string().min(8),
  page: z.object({
    url: z.string().url(),
    path: z.string().min(1),
    referrer: z.string().url().or(z.literal("")).default("")
  }),
  device: z
    .object({
      screenWidth: z.number().int().positive().optional(),
      screenHeight: z.number().int().positive().optional(),
      viewportWidth: z.number().int().positive().optional(),
      viewportHeight: z.number().int().positive().optional(),
      language: z.string().min(1).optional().nullable(),
      timezone: z.string().min(1).optional().nullable(),
      userAgent: z.string().min(1).optional().nullable()
    })
    .nullable()
    .optional(),
  attribution: z
    .object({
      source: z.string().optional().nullable(),
      medium: z.string().optional().nullable(),
      campaign: z.string().optional().nullable(),
      term: z.string().optional().nullable(),
      content: z.string().optional().nullable(),
      fbclid: z.string().optional().nullable(),
      fbc: z.string().optional().nullable(),
      fbp: z.string().optional().nullable(),
      gclid: z.string().optional().nullable(),
      msclkid: z.string().optional().nullable(),
      ttclid: z.string().optional().nullable()
    })
    .nullable()
    .optional(),
  consent: consentPreferencesSchema
});

export async function POST(request: Request) {
  const parsed = sessionPayloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }

  const client = getSupabaseAdminClient();

  if (!client) {
    return NextResponse.json({
      success: true,
      data: {
        persistenceMode: "disabled",
        visitorStored: false,
        sessionStored: false
      }
    });
  }

  const now = new Date().toISOString();
  const ipAddress = getClientIpAddress(request.headers);
  const userAgent = parsed.data.device?.userAgent ?? null;
  const referrerDomain = getReferrerDomain(parsed.data.page.referrer);
  const sourceChannel = classifySourceChannel({
    source: parsed.data.attribution?.source,
    medium: parsed.data.attribution?.medium,
    referrer: parsed.data.page.referrer,
    fbclid: parsed.data.attribution?.fbclid,
    fbc: parsed.data.attribution?.fbc,
    fbp: parsed.data.attribution?.fbp,
    gclid: parsed.data.attribution?.gclid,
    msclkid: parsed.data.attribution?.msclkid,
    ttclid: parsed.data.attribution?.ttclid
  });

  const existingVisitor = await client
    .from("visitor_profiles")
    .select("id")
    .eq("anonymous_id", parsed.data.anonymousId)
    .maybeSingle();

  if (existingVisitor.error) {
    return NextResponse.json({ success: false, error: existingVisitor.error.message }, { status: 500 });
  }

  const visitorPayload = {
    anonymous_id: parsed.data.anonymousId,
    last_seen_at: now,
    is_returning: Boolean(existingVisitor.data?.id),
    ip_address: ipAddress,
    user_agent: userAgent,
    language: parsed.data.device?.language ?? null,
    timezone: parsed.data.device?.timezone ?? null,
    screen_width: parsed.data.device?.screenWidth ?? null,
    screen_height: parsed.data.device?.screenHeight ?? null,
    viewport_width: parsed.data.device?.viewportWidth ?? null,
    viewport_height: parsed.data.device?.viewportHeight ?? null
  };

  const visitorResult = existingVisitor.data?.id
    ? await client
        .from("visitor_profiles")
        .update(visitorPayload)
        .eq("id", existingVisitor.data.id)
        .select("id")
        .single()
    : await client
        .from("visitor_profiles")
        .insert({
          ...visitorPayload,
          first_seen_at: now,
          is_returning: false
        })
        .select("id")
        .single();

  if (visitorResult.error) {
    return NextResponse.json({ success: false, error: visitorResult.error.message }, { status: 500 });
  }

  const existingSession = await client
    .from("sessions")
    .select("id")
    .eq("session_token", parsed.data.sessionToken)
    .maybeSingle();

  if (existingSession.error) {
    return NextResponse.json({ success: false, error: existingSession.error.message }, { status: 500 });
  }

  const sessionPayload = {
    visitor_id: visitorResult.data.id,
    referrer: parsed.data.page.referrer || null,
    referrer_domain: referrerDomain,
    source: parsed.data.attribution?.source ?? null,
    medium: parsed.data.attribution?.medium ?? null,
    campaign: parsed.data.attribution?.campaign ?? null,
    term: parsed.data.attribution?.term ?? null,
    content: parsed.data.attribution?.content ?? null,
    source_channel: sourceChannel,
    fbclid: parsed.data.attribution?.fbclid ?? null,
    fbc: parsed.data.attribution?.fbc ?? null,
    fbp: parsed.data.attribution?.fbp ?? null,
    gclid: parsed.data.attribution?.gclid ?? null,
    msclkid: parsed.data.attribution?.msclkid ?? null,
    ttclid: parsed.data.attribution?.ttclid ?? null,
    ip_address: ipAddress,
    user_agent: userAgent,
    language: parsed.data.device?.language ?? null,
    timezone: parsed.data.device?.timezone ?? null,
    metadata: {
      consent: parsed.data.consent,
      latest_path: parsed.data.page.path
    }
  };

  const sessionResult = existingSession.data?.id
    ? await client
        .from("sessions")
        .update(sessionPayload)
        .eq("id", existingSession.data.id)
        .select("id")
        .single()
    : await client
        .from("sessions")
        .insert({
          session_token: parsed.data.sessionToken,
          started_at: now,
          entry_url: parsed.data.page.url,
          entry_path: parsed.data.page.path,
          landing_page: parsed.data.page.path,
          landing_host: new URL(parsed.data.page.url).hostname,
          landing_query: new URL(parsed.data.page.url).search || null,
          ...sessionPayload
        })
        .select("id")
        .single();

  if (sessionResult.error) {
    return NextResponse.json({ success: false, error: sessionResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      persistenceMode: "database",
      visitorStored: true,
      sessionStored: true,
      visitorId: visitorResult.data.id,
      sessionId: sessionResult.data.id,
      sourceChannel
    }
  });
}
