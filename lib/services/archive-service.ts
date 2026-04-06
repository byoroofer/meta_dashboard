import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getArchiveData(scope?: DashboardScope) {
  const [events, messageArchive, communicationArchive, messages] = await Promise.all([
    dashboardRepository.getRawWebhookEvents(scope),
    dashboardRepository.getMessageArchive(scope),
    dashboardRepository.getCommunicationArchiveEvents(scope),
    dashboardRepository.getMessages(scope)
  ]);

  return {
    events,
    messageArchive,
    communicationArchive,
    messages
  };
}
