import { NextResponse } from "next/server";

import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function GET() {
  const data = await dashboardRepository.getAutoResponderRules();
  return NextResponse.json({ success: true, data });
}
