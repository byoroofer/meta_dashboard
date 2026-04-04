import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getArchiveData } from "@/lib/services/archive-service";

export async function GET(request: Request) {
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getArchiveData(scope);
  return NextResponse.json({ success: true, data: data.events });
}
