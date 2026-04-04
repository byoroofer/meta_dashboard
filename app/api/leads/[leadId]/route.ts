import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getLeadsData } from "@/lib/services/leads-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getLeadsData(scope, leadId);

  if (!data.selectedLead) {
    return NextResponse.json({ success: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      lead: data.selectedLead,
      activities: data.activities
    }
  });
}
