import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getSettingsData() {
  const [auditLogs, autoResponderRules, leadDestinations] = await Promise.all([
    dashboardRepository.getAuditLogs(),
    dashboardRepository.getAutoResponderRules(),
    dashboardRepository.getLeadDestinations()
  ]);

  return {
    auditLogs,
    autoResponderRules,
    leadDestinations
  };
}
