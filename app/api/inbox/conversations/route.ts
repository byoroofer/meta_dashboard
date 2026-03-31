import { NextResponse } from "next/server";

import { getInboxData } from "@/lib/services/inbox-service";

export async function GET() {
  const data = await getInboxData();
  return NextResponse.json({ success: true, data: data.conversations });
}
