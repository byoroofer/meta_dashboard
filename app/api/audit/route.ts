import { NextResponse } from "next/server";

import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function GET() {
  const data = await dashboardRepository.getAuditLogs();
  return NextResponse.json({ success: true, data });
}
