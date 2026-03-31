import { NextResponse } from "next/server";

import { getPortalData } from "@/lib/services/portal-service";

export async function GET() {
  const data = await getPortalData();
  return NextResponse.json({ success: true, data: data.targets });
}
