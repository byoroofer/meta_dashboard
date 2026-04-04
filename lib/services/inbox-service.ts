import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getInboxData(scope?: DashboardScope, conversationId?: string) {
  const [conversations, autoResponderRules] = await Promise.all([
    dashboardRepository.getConversations(scope),
    dashboardRepository.getAutoResponderRules(scope)
  ]);

  const selectedConversation = conversationId
    ? await dashboardRepository.getConversationById(conversationId, scope)
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
    notes,
    autoResponderRules
  };
}

export async function queueOutboundMessage(input: { conversationId: string; body: string }) {
  return {
    status: "queued" as const,
    transport: "placeholder",
    ...input
  };
}
