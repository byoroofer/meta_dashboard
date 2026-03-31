import { NextResponse } from "next/server";

import { getArchiveData } from "@/lib/services/archive-service";

export async function GET() {
  const data = await getArchiveData();
  return NextResponse.json({ success: true, data: data.messageArchive });
}
