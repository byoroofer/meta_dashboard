import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getSettingsData() {
  const [auditLogs, autoResponderRules, leadDestinations, integrationTargets, commandTemplates, commandExecutions] = await Promise.all([
    dashboardRepository.getAuditLogs(),
    dashboardRepository.getAutoResponderRules(),
    dashboardRepository.getLeadDestinations(),
    dashboardRepository.getIntegrationTargets(),
    dashboardRepository.getCommandTemplates(),
    dashboardRepository.getCommandExecutions()
  ]);

  return {
    auditLogs,
    autoResponderRules,
    leadDestinations,
    integrationTargets,
    commandTemplates,
    commandExecutions
  };
}
