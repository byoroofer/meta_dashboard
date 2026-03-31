import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import { getPortalData } from "@/lib/services/portal-service";

export async function getSettingsData() {
  const [auditLogs, autoResponderRules, leadDestinations, portal] = await Promise.all([
    dashboardRepository.getAuditLogs(),
    dashboardRepository.getAutoResponderRules(),
    dashboardRepository.getLeadDestinations(),
    getPortalData()
  ]);

  return {
    auditLogs,
    autoResponderRules,
    leadDestinations,
    integrationTargets: portal.targets,
    commandTemplates: portal.templates,
    commandExecutions: portal.executions
  };
}
