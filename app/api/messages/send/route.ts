import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuditLogEntry } from "@/lib/audit/log";
import { queueOutboundMessage } from "@/lib/services/inbox-service";

const payloadSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }

  const queued = await queueOutboundMessage(parsed.data);
  const audit = createAuditLogEntry({
    actor: "admin",
    action: "message.queue_send",
    targetType: "conversation",
    targetId: parsed.data.conversationId,
    outcome: "success",
    detail: "Outbound placeholder queued. Live Meta delivery is disabled until credentials are configured."
  });

  return NextResponse.json({ success: true, data: { queued, audit } }, { status: 202 });
}
