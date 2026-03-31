import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getArchiveData() {
  const [events, messageArchive, messages] = await Promise.all([
    dashboardRepository.getRawWebhookEvents(),
    dashboardRepository.getMessageArchive(),
    dashboardRepository.getConversations()
  ]);

  return {
    events,
    messageArchive,
    messages
  };
}
