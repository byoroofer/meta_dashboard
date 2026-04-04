import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import { getPortalData } from "@/lib/services/portal-service";

export async function getSettingsData(scope?: DashboardScope) {
  const [auditLogs, autoResponderRules, leadDestinations, portal] = await Promise.all([
    dashboardRepository.getAuditLogs(scope),
    dashboardRepository.getAutoResponderRules(scope),
    dashboardRepository.getLeadDestinations(scope),
    getPortalData(scope)
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
