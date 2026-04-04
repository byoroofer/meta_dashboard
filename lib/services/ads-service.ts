import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getAdsData(scope?: DashboardScope) {
  const [accounts, campaigns, adsets, ads, insights] = await Promise.all([
    dashboardRepository.getAdAccounts(scope),
    dashboardRepository.getCampaigns(scope),
    dashboardRepository.getAdSets(scope),
    dashboardRepository.getAds(scope),
    dashboardRepository.getAdInsightsDaily(scope)
  ]);

  return {
    accounts,
    campaigns,
    adsets,
    ads,
    insights
  };
}
