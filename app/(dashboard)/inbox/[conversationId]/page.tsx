import { notFound } from "next/navigation";

import { InboxWorkspace } from "@/components/inbox/inbox-workspace";
import { getInboxData } from "@/lib/services/inbox-service";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const data = await getInboxData(conversationId);

  if (!data.selectedConversation) {
    notFound();
  }

  return <InboxWorkspace {...data} />;
}
