import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getInboxData(conversationId?: string) {
  const conversations = await dashboardRepository.getConversations();
  const selectedConversation = conversationId
    ? await dashboardRepository.getConversationById(conversationId)
    : conversations[0] ?? null;

  const [threadMessages, notes] = selectedConversation
    ? await Promise.all([
        dashboardRepository.getMessagesByConversationId(selectedConversation.id),
        dashboardRepository.getConversationNotes(selectedConversation.id)
      ])
    : [[], []];

  return {
    conversations,
    selectedConversation,
    threadMessages,
    notes
  };
}

export async function queueOutboundMessage(input: { conversationId: string; body: string }) {
  return {
    status: "queued" as const,
    transport: "placeholder",
    ...input
  };
}
