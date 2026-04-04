import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getInboxData } from "@/lib/services/inbox-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getInboxData(scope, conversationId);

  if (!data.selectedConversation) {
    return NextResponse.json({ success: false, error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      conversation: data.selectedConversation,
      messages: data.threadMessages,
      notes: data.notes
    }
  });
}
