import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export async function getContactsData(contactId?: string) {
  const contacts = await dashboardRepository.getContacts();
  const selectedContact = contactId ? await dashboardRepository.getContactById(contactId) : contacts[0] ?? null;
  const linkedConversations = selectedContact
    ? (await dashboardRepository.getConversations()).filter((item) => item.contactId === selectedContact.id)
    : [];
  const linkedLeads = selectedContact
    ? (await dashboardRepository.getLeads()).filter((item) => item.contactId === selectedContact.id)
    : [];

  return {
    contacts,
    selectedContact,
    linkedConversations,
    linkedLeads
  };
}
