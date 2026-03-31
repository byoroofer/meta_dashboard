import { NextResponse } from "next/server";

import { getLeadsData } from "@/lib/services/leads-service";

export async function GET() {
  const data = await getLeadsData();
  return NextResponse.json({ success: true, data: data.leads });
}
