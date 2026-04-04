import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getInboxData } from "@/lib/services/inbox-service";

export async function GET(request: Request) {
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getInboxData(scope);
  return NextResponse.json({ success: true, data: data.conversations });
}
