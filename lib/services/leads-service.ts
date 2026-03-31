import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getLeadsData(leadId?: string) {
  const [leads, leadDestinations] = await Promise.all([
    dashboardRepository.getLeads(),
    dashboardRepository.getLeadDestinations()
  ]);

  const selectedLead = leadId ? await dashboardRepository.getLeadById(leadId) : leads[0] ?? null;

  const activities = selectedLead ? await dashboardRepository.getLeadActivities(selectedLead.id) : [];

  return {
    leads,
    selectedLead,
    activities,
    leadDestinations
  };
}
