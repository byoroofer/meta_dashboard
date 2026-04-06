import { NextResponse } from "next/server";

import { marketplaceAlertUpdateSchema } from "@/lib/marketplace/schemas";
import { getMarketplaceAlerts, markMarketplaceAlertsRead } from "@/lib/services/marketplace-deals-service";

export async function GET() {
  const alerts = await getMarketplaceAlerts();
  return NextResponse.json({ success: true, data: alerts });
}

export async function PATCH(request: Request) {
  const parsed = marketplaceAlertUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid alert update payload." }, { status: 400 });
  }

  const updated = await markMarketplaceAlertsRead(parsed.data.alertIds);
  return NextResponse.json({ success: true, data: updated });
}
