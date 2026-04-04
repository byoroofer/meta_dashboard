import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import { getPortalData } from "@/lib/services/portal-service";
import type { OverviewMetric } from "@/types/domain";

export async function getOverviewData(scope?: DashboardScope) {
  const [
    conversations,
    leads,
    adAccounts,
    rawEvents,
    syncJobs,
    connectedAssets,
    autoResponderRules,
    leadDestinations,
    portal
  ] = await Promise.all([
    dashboardRepository.getConversations(scope),
    dashboardRepository.getLeads(scope),
    dashboardRepository.getAdAccounts(scope),
    dashboardRepository.getRawWebhookEvents(scope),
    dashboardRepository.getSyncJobs(scope),
    dashboardRepository.getConnectedAssets(scope),
    dashboardRepository.getAutoResponderRules(scope),
    dashboardRepository.getLeadDestinations(scope),
    getPortalData(scope)
  ]);

  const metrics: OverviewMetric[] = [
    {
      label: "Open conversations",
      value: `${conversations.filter((item) => item.status !== "resolved").length}`,
      delta: "+12% vs yesterday",
      tone: "positive"
    },
    {
      label: "New leads today",
      value: `${leads.filter((item) => item.status === "new").length}`,
      delta: "2 form captures pending triage",
      tone: "warning"
    },
    {
      label: "Ad spend today",
      value: `$${adAccounts.reduce((sum, item) => sum + item.spendToday, 0).toLocaleString()}`,
      delta: "Within 4% of target pace",
      tone: "neutral"
    },
    {
      label: "Portal commands",
      value: `${portal.templates.filter((item) => item.status === "active").length}`,
      delta: `${portal.targets.filter((item) => item.status === "active").length} active targets live`,
      tone: "positive"
    }
  ];

  const alerts: { id: string; title: string; body: string; tone: "neutral" | "warning" }[] = [
    {
      id: "alert_001",
      title: "Ads sync lag detected",
      body: "Ad account insights are 49 minutes behind the latest webhook and scheduled pull cadence.",
      tone: "warning"
    },
    {
      id: "alert_002",
      title: "Client database mapping pending",
      body: "The portal can target the client CRM database, but field-level write contracts still need approval before live dispatch.",
      tone: "warning"
    }
  ];

  return {
    metrics,
    syncJobs,
    connectedAssets,
    autoResponderRules,
    leadDestinations,
    rawEvents,
    integrationTargets: portal.targets,
    commandTemplates: portal.templates,
    commandExecutions: portal.executions,
    alerts
  };
}
