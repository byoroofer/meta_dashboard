import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getConnectedAssetLogs } from "@/lib/services/connected-asset-logs-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getConnectedAssetLogs(scope, assetId);

  if (!data) {
    return NextResponse.json({ success: false, error: "Connected asset not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
