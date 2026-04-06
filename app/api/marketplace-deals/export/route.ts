import { NextResponse } from "next/server";

import { exportMarketplaceResultsCsv } from "@/lib/services/marketplace-deals-service";

export async function GET(request: Request) {
  const scanId = new URL(request.url).searchParams.get("scanId");
  const csv = await exportMarketplaceResultsCsv(scanId);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="marketplace-deals-${scanId ?? "latest"}.csv"`
    }
  });
}
