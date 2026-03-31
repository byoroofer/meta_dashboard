import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import type { OverviewMetric } from "@/types/domain";

export async function getOverviewData() {
  const [conversations, leads, adAccounts, rawEvents, syncJobs, connectedAssets] = await Promise.all([
    dashboardRepository.getConversations(),
    dashboardRepository.getLeads(),
    dashboardRepository.getAdAccounts(),
    dashboardRepository.getRawWebhookEvents(),
    dashboardRepository.getSyncJobs(),
    dashboardRepository.getConnectedAssets()
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
      label: "Webhook events",
      value: `${rawEvents.length}`,
      delta: `${rawEvents.filter((item) => item.processingStatus === "processed").length} processed cleanly`,
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
      title: "MFA enrollment pending",
      body: "The scaffolded admin session is marked as requiring MFA enrollment before production cutover.",
      tone: "neutral"
    }
  ];

  return {
    metrics,
    syncJobs,
    connectedAssets,
    alerts
  };
}

