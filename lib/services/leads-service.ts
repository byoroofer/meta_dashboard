import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getLeadsData(scope?: DashboardScope, leadId?: string) {
  const [leads, leadDestinations] = await Promise.all([
    dashboardRepository.getLeads(scope),
    dashboardRepository.getLeadDestinations(scope)
  ]);

  const selectedLead = leadId ? await dashboardRepository.getLeadById(leadId, scope) : leads[0] ?? null;

  const activities = selectedLead ? await dashboardRepository.getLeadActivities(selectedLead.id) : [];

  return {
    leads,
    selectedLead,
    activities,
    leadDestinations
  };
}
