import { NextResponse } from "next/server";
import { z } from "zod";

import { persistOutboundMessageCopy } from "@/lib/meta/message-preservation";
import { queueOutboundMessage } from "@/lib/services/inbox-service";

const payloadSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1),
  actorLabel: z.string().min(1).default("admin")
});

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }

  const queued = await queueOutboundMessage(parsed.data);
  const persistence = await persistOutboundMessageCopy({
    conversationId: parsed.data.conversationId,
    body: parsed.data.body,
    actorLabel: parsed.data.actorLabel
  });

  return NextResponse.json({ success: true, data: { queued, persistence } }, { status: 202 });
}
