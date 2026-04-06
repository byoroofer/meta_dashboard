import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import { syncMetaData } from "@/lib/meta/sync-service";

function cleanValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  await requireAdminSession();

  try {
    let payload: Record<string, unknown> = {};

    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      payload = {};
    }

    const result = await syncMetaData({
      businessId: cleanValue(payload.businessId),
      assetId: cleanValue(payload.assetId),
      pageId: cleanValue(payload.pageId)
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Meta import failed."
      },
      { status: 500 }
    );
  }
}
