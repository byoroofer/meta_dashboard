import { createHash, timingSafeEqual } from "crypto";

import { buildCanonicalArchiveSnapshot } from "@/lib/archive/canonical";
import { env } from "@/lib/config/env";

export function verifyWebhookChallenge(mode: string | null, token: string | null, challenge: string | null) {
  if (mode !== "subscribe" || token !== env.META_WEBHOOK_VERIFY_TOKEN || !challenge) {
    return null;
  }

  return challenge;
}

export async function readRawRequestBody(request: Request) {
  return request.text();
}

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  if (!env.META_WEBHOOK_APP_SECRET || !signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const provided = Buffer.from(signatureHeader.replace("sha256=", ""), "hex");
  const expected = createHash("sha256")
    .update(`${env.META_WEBHOOK_APP_SECRET}.${rawBody}`)
    .digest();

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

export function buildRawEventRecord(rawBody: string) {
  const parsed = JSON.parse(rawBody) as Record<string, unknown>;
  const dedupeKey = createHash("sha256").update(rawBody).digest("hex");
  const archive = buildCanonicalArchiveSnapshot(parsed);

  return {
    dedupeKey,
    archive,
    payload: parsed
  };
}

export function describeWebhookProcessing() {
  return [
    "raw webhook received",
    "persist raw payload before mutation",
    "dedupe and verify authenticity",
    "normalize operational entities",
    "build canonical archive snapshot",
    "hash archive record",
    "write processing audit trail"
  ];
}
