import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getArchiveData(scope?: DashboardScope) {
  const [events, messageArchive, messages] = await Promise.all([
    dashboardRepository.getRawWebhookEvents(scope),
    dashboardRepository.getMessageArchive(scope),
    dashboardRepository.getConversations(scope)
  ]);

  return {
    events,
    messageArchive,
    messages
  };
}
