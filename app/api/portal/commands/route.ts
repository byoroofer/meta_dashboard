import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getPortalData } from "@/lib/services/portal-service";

export async function GET(request: Request) {
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getPortalData(scope);
  return NextResponse.json({ success: true, data: { templates: data.templates, executions: data.executions } });
}
