import { NextResponse } from "next/server";

import { getLeadsData } from "@/lib/services/leads-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const data = await getLeadsData(leadId);

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
