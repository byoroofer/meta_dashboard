import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getAdsData() {
  const [accounts, campaigns, adsets, ads, insights] = await Promise.all([
    dashboardRepository.getAdAccounts(),
    dashboardRepository.getCampaigns(),
    dashboardRepository.getAdSets(),
    dashboardRepository.getAds(),
    dashboardRepository.getAdInsightsDaily()
  ]);

  return {
    accounts,
    campaigns,
    adsets,
    ads,
    insights
  };
}
