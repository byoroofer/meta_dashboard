import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import type { ConnectedAssetLogs } from "@/types/domain";

export async function getConnectedAssetLogs(scope: DashboardScope | undefined, assetId: string): Promise<ConnectedAssetLogs | null> {
  const asset = await dashboardRepository.getConnectedAssetById(assetId, scope);

  if (!asset) {
    return null;
  }

  const conversations = await dashboardRepository.getConversationsByAssetId(asset.id, scope);
  const messageLogs = await Promise.all(
    conversations.map(async (conversation) => ({
      conversation,
      messages: await dashboardRepository.getMessagesByConversationId(conversation.id)
    }))
  );

  const leads = await dashboardRepository.getLeadsByAssetId(asset.id, scope);
  const leadLogs = await Promise.all(
    leads.map(async (lead) => ({
      lead,
      activities: await dashboardRepository.getLeadActivities(lead.id)
    }))
  );

  return {
    asset,
    messageLogs,
    leadLogs,
    totals: {
      conversations: messageLogs.length,
      messages: messageLogs.reduce((sum, item) => sum + item.messages.length, 0),
      leads: leadLogs.length,
      leadActivities: leadLogs.reduce((sum, item) => sum + item.activities.length, 0)
    }
  };
}
