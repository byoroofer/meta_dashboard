import { NextResponse } from "next/server";
import { z } from "zod";

import { queuePortalCommand } from "@/lib/services/portal-service";

const payloadSchema = z.object({
  commandTemplateId: z.string().min(1),
  targetId: z.string().min(1),
  requestedBy: z.string().min(1).default("admin")
});

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
  }

  const result = await queuePortalCommand(parsed.data);

  return NextResponse.json(
    {
      success: result.success,
      data: result.execution,
      meta: { warning: result.warning }
    },
    { status: result.success ? 202 : 404 }
  );
}
