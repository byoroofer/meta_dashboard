import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getConnectedAccountsData() {
  const [businesses, assets, auditLogs] = await Promise.all([
    dashboardRepository.getConnectedBusinesses(),
    dashboardRepository.getConnectedAssets(),
    dashboardRepository.getAuditLogs()
  ]);

  return {
    businesses,
    assets,
    recentAudit: auditLogs.slice(0, 3)
  };
}
