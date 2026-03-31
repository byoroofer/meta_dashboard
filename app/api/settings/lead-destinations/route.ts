import { NextResponse } from "next/server";

import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function GET() {
  const data = await dashboardRepository.getLeadDestinations();
  return NextResponse.json({ success: true, data });
}
