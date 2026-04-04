import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getConnectedAccountsData } from "@/lib/services/connected-accounts-service";

export async function GET(request: Request) {
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getConnectedAccountsData(scope);
  return NextResponse.json({ success: true, data });
}
