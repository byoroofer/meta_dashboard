import { createHash, createHmac, timingSafeEqual } from "crypto";

import { buildCanonicalArchiveSnapshot } from "@/lib/archive/canonical";
import { env } from "@/lib/config/env";

export interface BuiltRawEventRecord {
  dedupeKey: string;
  archive: ReturnType<typeof buildCanonicalArchiveSnapshot>;
  payload: Record<string, unknown>;
  payloadSha256: string;
  platform: "facebook" | "instagram" | "leadgen";
  eventType: string;
  deliveryId: string | null;
}

function safeJsonParse(rawBody: string) {
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return { parse_error: true, raw_body: rawBody } satisfies Record<string, unknown>;
  }
}

function inferPlatform(payload: Record<string, unknown>) {
  const object = typeof payload.object === "string" ? payload.object : "";

  if (object === "instagram") {
    return "instagram" as const;
  }

  const entry = Array.isArray(payload.entry) ? payload.entry[0] : null;
  const firstChange = entry && typeof entry === "object" && Array.isArray((entry as { changes?: unknown[] }).changes)
    ? (entry as { changes: Array<Record<string, unknown>> }).changes[0]
    : null;

  if (firstChange?.field === "leadgen") {
    return "leadgen" as const;
  }

  return "facebook" as const;
}

function inferEventType(payload: Record<string, unknown>) {
  const entry = Array.isArray(payload.entry) ? payload.entry[0] : null;

  if (entry && typeof entry === "object") {
    const typedEntry = entry as { messaging?: unknown[]; changes?: Array<Record<string, unknown>> };

    if (Array.isArray(typedEntry.messaging) && typedEntry.messaging.length > 0) {
      const firstMessage = typedEntry.messaging[0] as Record<string, unknown>;

      if (firstMessage.read) {
        return "read";
      }

      if (firstMessage.delivery) {
        return "delivery";
      }

      return "messages";
    }

    if (Array.isArray(typedEntry.changes) && typedEntry.changes[0]?.field) {
      return String(typedEntry.changes[0].field);
    }
  }

  return "unknown";
}

function inferDeliveryId(payload: Record<string, unknown>) {
  const entry = Array.isArray(payload.entry) ? payload.entry[0] : null;
  const messaging = entry && typeof entry === "object" ? (entry as { messaging?: unknown[] }).messaging : null;
  const firstMessage = Array.isArray(messaging) ? (messaging[0] as Record<string, unknown> | undefined) : undefined;

  if (firstMessage?.message && typeof firstMessage.message === "object") {
    return String((firstMessage.message as Record<string, unknown>).mid ?? "") || null;
  }

  const changes = entry && typeof entry === "object" ? (entry as { changes?: unknown[] }).changes : null;
  const firstChange = Array.isArray(changes) ? (changes[0] as Record<string, unknown> | undefined) : undefined;

  if (firstChange?.value && typeof firstChange.value === "object") {
    return String((firstChange.value as Record<string, unknown>).leadgen_id ?? "") || null;
  }

  return null;
}

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

  const expectedSignature = createHmac("sha256", env.META_WEBHOOK_APP_SECRET).update(rawBody, "utf8").digest("hex");
  const providedSignature = signatureHeader.replace("sha256=", "");
  const expected = Buffer.from(expectedSignature, "hex");
  const provided = Buffer.from(providedSignature, "hex");

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export function headersToObject(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

export function buildRawEventRecord(rawBody: string): BuiltRawEventRecord {
  const payload = safeJsonParse(rawBody);
  const dedupeKey = createHash("sha256").update(rawBody).digest("hex");
  const payloadSha256 = dedupeKey;
  const archive = buildCanonicalArchiveSnapshot(payload);

  return {
    dedupeKey,
    archive,
    payload,
    payloadSha256,
    platform: inferPlatform(payload),
    eventType: inferEventType(payload),
    deliveryId: inferDeliveryId(payload)
  };
}

export function describeWebhookProcessing() {
  return [
    "raw webhook received",
    "persist raw payload before mutation",
    "dedupe and verify authenticity",
    "normalize to operational tables",
    "build canonical archive snapshot",
    "hash archive record",
    "write processing audit trail"
  ];
}
