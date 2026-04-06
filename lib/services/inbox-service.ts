import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import type { Message } from "@/types/domain";

function buildPreviewFallbackMessage(conversationId: string, contactName: string, preview: string, sentAt: string): Message | null {
  const body = preview.trim();
  if (!body) {
    return null;
  }

  return {
    id: `preview-${conversationId}`,
    conversationId,
    direction: "inbound",
    senderLabel: contactName || "Meta thread preview",
    body,
    status: "delivered",
    sentAt,
    archivedAt: sentAt,
    attachments: []
  };
}

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

  const displayThreadMessages =
    selectedConversation && threadMessages.length === 0
      ? [buildPreviewFallbackMessage(selectedConversation.id, selectedConversation.contactName, selectedConversation.preview, selectedConversation.lastMessageAt)].filter(
          (item): item is Message => Boolean(item)
        )
      : threadMessages;

  return {
    conversations,
    selectedConversation,
    threadMessages: displayThreadMessages,
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
