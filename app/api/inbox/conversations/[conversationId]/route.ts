import { NextResponse } from "next/server";

import { getInboxData } from "@/lib/services/inbox-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const data = await getInboxData(conversationId);

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
