import { NextResponse } from "next/server";

import {
  buildRawEventRecord,
  describeWebhookProcessing,
  headersToObject,
  readRawRequestBody,
  verifyMetaSignature,
  verifyWebhookChallenge
} from "@/lib/meta/webhooks";
import { persistInboundWebhookEvent } from "@/lib/meta/message-preservation";

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
  const signatureHeader = request.headers.get("x-hub-signature-256");
  const signatureValid = verifyMetaSignature(rawBody, signatureHeader);
  const rawEvent = buildRawEventRecord(rawBody);
  const persistence = await persistInboundWebhookEvent({
    rawEvent,
    rawBody,
    headers: headersToObject(request.headers),
    signatureHeader,
    signatureValid
  });

  if (!signatureValid) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid webhook signature.",
        data: {
          dedupeKey: rawEvent.dedupeKey,
          persistence,
          processingStages: describeWebhookProcessing()
        }
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      dedupeKey: rawEvent.dedupeKey,
      processingStages: describeWebhookProcessing(),
      persistence
    }
  });
}
