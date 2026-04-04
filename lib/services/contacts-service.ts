import type { DashboardScope } from "@/lib/dashboard/scope";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getContactsData(scope?: DashboardScope, contactId?: string) {
  const contacts = await dashboardRepository.getContacts(scope);
  const selectedContact = contactId ? await dashboardRepository.getContactById(contactId, scope) : contacts[0] ?? null;
  const linkedConversations = selectedContact
    ? (await dashboardRepository.getConversations(scope)).filter((item) => item.contactId === selectedContact.id)
    : [];
  const linkedLeads = selectedContact
    ? (await dashboardRepository.getLeads(scope)).filter((item) => item.contactId === selectedContact.id)
    : [];

  return {
    contacts,
    selectedContact,
    linkedConversations,
    linkedLeads
  };
}
