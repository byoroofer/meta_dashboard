import {
  adAccounts,
  adInsightsDaily,
  adsets,
  ads,
  auditLogs,
  campaigns,
  connectedAssets,
  connectedBusinesses,
  contacts,
  conversationNotes,
  conversations,
  leadActivities,
  leadForms,
  leads,
  messageArchive,
  messages,
  rawWebhookEvents,
  syncJobs
} from "@/lib/repositories/mock-data";

export const dashboardRepository = {
  getConnectedBusinesses: async () => connectedBusinesses,
  getConnectedAssets: async () => connectedAssets,
  getContacts: async () => contacts,
  getContactById: async (contactId: string) => contacts.find((item) => item.id === contactId) ?? null,
  getConversations: async () => conversations,
  getConversationById: async (conversationId: string) =>
    conversations.find((item) => item.id === conversationId) ?? null,
  getMessagesByConversationId: async (conversationId: string) =>
    messages.filter((item) => item.conversationId === conversationId),
  getConversationNotes: async (conversationId: string) =>
    conversationNotes.filter((item) => item.conversationId === conversationId),
  getRawWebhookEvents: async () => rawWebhookEvents,
  getMessageArchive: async () => messageArchive,
  getLeadForms: async () => leadForms,
  getLeads: async () => leads,
  getLeadById: async (leadId: string) => leads.find((item) => item.id === leadId) ?? null,
  getLeadActivities: async (leadId: string) => leadActivities.filter((item) => item.leadId === leadId),
  getAdAccounts: async () => adAccounts,
  getCampaigns: async () => campaigns,
  getAdSets: async () => adsets,
  getAds: async () => ads,
  getAdInsightsDaily: async () => adInsightsDaily,
  getSyncJobs: async () => syncJobs,
  getAuditLogs: async () => auditLogs
};
