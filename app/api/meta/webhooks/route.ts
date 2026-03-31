import { NextResponse } from "next/server";

import { createAuditLogEntry } from "@/lib/audit/log";
import { buildRawEventRecord, describeWebhookProcessing, readRawRequestBody, verifyMetaSignature, verifyWebhookChallenge } from "@/lib/meta/webhooks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = verifyWebhookChallenge(
    searchParams.get("hub.mode"),
    searchParams.get("hub.verify_token"),
    searchParams.get("hub.challenge")
  );

  if (!challenge) {
    return NextResponse.json({ success: false, error: "Verification failed." }, { status: 403 });
  }

  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await readRawRequestBody(request);
  const signature = request.headers.get("x-hub-signature-256");
  const signatureValid = verifyMetaSignature(rawBody, signature);

  const rawEvent = buildRawEventRecord(rawBody);
  const audit = createAuditLogEntry({
    actor: "system:webhook",
    action: "webhook.ingest",
    targetType: "raw_webhook_event",
    targetId: rawEvent.dedupeKey,
    outcome: signatureValid ? "success" : "warning",
    detail: "Webhook scaffold accepted the raw payload and generated canonical archive metadata."
  });

  return NextResponse.json({
    success: true,
    data: {
      dedupeKey: rawEvent.dedupeKey,
      signatureValid,
      processingStages: describeWebhookProcessing(),
      audit
    }
  });
}
