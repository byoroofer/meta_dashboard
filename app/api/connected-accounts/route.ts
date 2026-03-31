import { NextResponse } from "next/server";

import { getConnectedAccountsData } from "@/lib/services/connected-accounts-service";

export async function GET() {
  const data = await getConnectedAccountsData();
  return NextResponse.json({ success: true, data });
}
