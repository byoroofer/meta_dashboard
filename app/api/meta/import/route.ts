import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import { syncMetaData } from "@/lib/meta/sync-service";

export async function POST() {
  await requireAdminSession();

  try {
    const result = await syncMetaData();
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
