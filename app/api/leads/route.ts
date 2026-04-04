import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getLeadsData } from "@/lib/services/leads-service";

export async function GET(request: Request) {
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getLeadsData(scope);
  return NextResponse.json({ success: true, data: data.leads });
}
