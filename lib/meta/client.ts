import { env } from "@/lib/config/env";

interface MetaPagingResponse<T> {
  data?: T[];
  paging?: { next?: string };
  error?: { message?: string };
}

export interface MetaPagedCollection<T> {
  data: T[];
  pageCount: number;
  rowCount: number;
  firstPageRowCount: number;
  hadPaging: boolean;
  lastNextUrl: string | null;
}

interface MetaBusinessNode {
  id: string;
  name?: string;
}

interface MetaPageNode {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id: string; username?: string; name?: string } | null;
  tasks?: string[];
}

interface MetaParticipantNode {
  id: string;
  name?: string;
  email?: string;
  username?: string;
}

interface MetaAdAccountNode {
  id: string;
  account_id?: string;
  name?: string;
  currency?: string;
  account_status?: number;
}

interface MetaCampaignNode {
  id: string;
  name?: string;
  objective?: string;
  status?: string;
  effective_status?: string;
  daily_budget?: string;
}

interface MetaAdSetNode {
  id: string;
  campaign_id?: string;
  name?: string;
  status?: string;
  effective_status?: string;
  targeting?: Record<string, unknown>;
}

interface MetaAdNode {
  id: string;
  adset_id?: string;
  name?: string;
  status?: string;
  effective_status?: string;
  creative?: { id?: string; name?: string } | null;
}

interface MetaLeadFormNode {
  id: string;
  name?: string;
  status?: string;
}

interface MetaLeadNode {
  id: string;
  created_time?: string;
  field_data?: Array<{ name?: string; values?: string[] }>;
  campaign_name?: string;
  adset_name?: string;
  ad_name?: string;
}

interface MetaInsightNode {
  date_start?: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  actions?: Array<{ action_type?: string; value?: string }>;
}

interface MetaConversationNode {
  id: string;
  updated_time?: string;
  snippet?: string;
  message_count?: number;
  can_reply?: boolean;
  link?: string;
  unread_count?: number;
  senders?: { data?: MetaParticipantNode[] };
  participants?: { data?: MetaParticipantNode[] };
}

interface MetaParticipantProfileNode {
  id: string;
  name?: string;
  username?: string;
  profile_pic?: string;
}

interface MetaConversationMessageAttachmentNode {
  id?: string;
  mime_type?: string;
  file_url?: string;
  image_data?: Record<string, unknown>;
  video_data?: Record<string, unknown>;
  fallback?: string;
  name?: string;
}

interface MetaConversationMessageNode {
  id: string;
  created_time?: string;
  message?: string;
  from?: MetaParticipantNode | null;
  to?: { data?: MetaParticipantNode[] };
  attachments?: { data?: MetaConversationMessageAttachmentNode[] };
  shares?: Record<string, unknown> | null;
  sticker?: Record<string, unknown> | null;
 }

export class MetaBusinessClient {
  private readonly accessToken: string;
  private readonly baseUrl: string;

  constructor(accessToken = env.META_SYSTEM_USER_ACCESS_TOKEN, apiVersion = env.META_API_VERSION) {
    this.accessToken = accessToken;
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
  }

  private assertConfigured() {
    if (!env.META_APP_ID || !env.META_APP_SECRET || !this.accessToken) {
      throw new Error("Meta business API client is not configured.");
    }
  }

  private buildUrl(path: string, params?: Record<string, string>) {
    const url = new URL(path.startsWith("http") ? path : `${this.baseUrl}${path}`);

    if (!path.startsWith("http")) {
      url.searchParams.set("access_token", this.accessToken);
    }

    for (const [key, value] of Object.entries(params ?? {})) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  private async fetchJson<T>(path: string, params?: Record<string, string>) {
    this.assertConfigured();

    const response = await fetch(this.buildUrl(path, params), {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Meta API request failed: ${response.status} ${response.statusText} — ${this.buildUrl(path, params).split("?")[0]} — ${body.slice(0, 200)}`);
    }

    const payload = (await response.json()) as T & { error?: { message?: string } };

    if (payload.error) {
      throw new Error(payload.error.message ?? "Meta API returned an error.");
    }

    return payload;
  }

  private async fetchAllPages<T>(path: string, params?: Record<string, string>) {
    const payload = await this.fetchAllPagesWithMetadata<T>(path, params);
    return payload.data;
  }

  private async fetchAllPagesWithMetadata<T>(path: string, params?: Record<string, string>): Promise<MetaPagedCollection<T>> {
    let next: string | null = this.buildUrl(path, params);
    const rows: T[] = [];
    let pageCount = 0;
    let firstPageRowCount = 0;
    let hadPaging = false;
    let lastNextUrl: string | null = null;

    while (next) {
      const payload: MetaPagingResponse<T> = await this.fetchJson<MetaPagingResponse<T>>(next);
      const pageRows = payload.data ?? [];
      pageCount += 1;
      if (pageCount === 1) {
        firstPageRowCount = pageRows.length;
      }
      rows.push(...pageRows);
      lastNextUrl = payload.paging?.next ?? null;
      if (lastNextUrl) {
        hadPaging = true;
      }
      next = lastNextUrl;
    }

    return {
      data: rows,
      pageCount,
      rowCount: rows.length,
      firstPageRowCount,
      hadPaging,
      lastNextUrl
    };
  }

  async getConnectedBusinesses() {
    return this.fetchAllPages<MetaBusinessNode>("/me/businesses", {
      fields: "id,name"
    });
  }

  /** Fallback: pages the system user can directly access (bypasses /me/businesses hierarchy) */
  async getDirectPages() {
    return this.fetchAllPages<MetaPageNode>("/me/accounts", {
      fields: "id,name,access_token,instagram_business_account{id,username,name}"
    });
  }

  async getPageDetails(pageId: string) {
    return this.fetchJson<MetaPageNode>(`/${pageId}`, {
      fields: "id,name,access_token,instagram_business_account{id,username,name}"
    });
  }

  /** Return a client that uses a page access token instead of the system user token */
  withPageToken(pageAccessToken: string) {
    return new MetaBusinessClient(pageAccessToken);
  }

  /** Fallback: ad accounts the system user can directly access */
  async getDirectAdAccounts() {
    return this.fetchAllPages<MetaAdAccountNode>("/me/adaccounts", {
      fields: "id,name,currency,account_status"
    });
  }

  async getBusinessPages(businessId: string) {
    return this.fetchAllPages<MetaPageNode>(`/${businessId}/owned_pages`, {
      fields: "id,name,tasks,instagram_business_account{id,username,name}"
    });
  }

  async getBusinessAdAccounts(businessId: string) {
    return this.fetchAllPages<MetaAdAccountNode>(`/${businessId}/owned_ad_accounts`, {
      fields: "id,account_id,name,currency,account_status"
    });
  }

  async getLeadForms(pageId: string) {
    return this.fetchAllPages<MetaLeadFormNode>(`/${pageId}/leadgen_forms`, {
      fields: "id,name,status"
    });
  }

  async getLeads(formId: string) {
    return this.fetchAllPages<MetaLeadNode>(`/${formId}/leads`, {
      fields: "id,created_time,field_data,campaign_name,adset_name,ad_name"
    });
  }

  async getConversations(pageId: string, platform?: "facebook" | "instagram") {
    return (await this.getConversationsWithDiagnostics(pageId, platform)).data;
  }

  async getConversationsWithDiagnostics(pageId: string, platform?: "facebook" | "instagram") {
    return this.fetchAllPagesWithMetadata<MetaConversationNode>(`/${pageId}/conversations`, {
      fields: "id,updated_time,snippet,message_count,senders,participants",
      ...(platform === "instagram" ? { platform: "instagram" } : {}),
      limit: "200"
    });
  }

  async getConversationDetails(conversationId: string, platform?: "facebook" | "instagram") {
    return this.fetchJson<MetaConversationNode>(`/${conversationId}`, {
      fields: "id,updated_time,snippet,message_count,can_reply,link,unread_count,senders,participants",
      ...(platform === "instagram" ? { platform: "instagram" } : {})
    });
  }

  async getParticipantProfile(participantId: string) {
    return this.fetchJson<MetaParticipantProfileNode>(`/${participantId}`, {
      fields: "id,name,username,profile_pic"
    });
  }

  async getConversationMessages(conversationId: string, platform?: "facebook" | "instagram") {
    return this.fetchAllPages<MetaConversationMessageNode>(`/${conversationId}/messages`, {
      fields: "id,created_time,message,from,to,attachments{id,mime_type,file_url,name}",
      ...(platform === "instagram" ? { platform: "instagram" } : {}),
      limit: platform === "instagram" ? "25" : "100"
    });
  }

  async getCampaigns(externalAccountId: string) {
    return this.fetchAllPages<MetaCampaignNode>(`/act_${externalAccountId}/campaigns`, {
      fields: "id,name,objective,status,effective_status,daily_budget",
      limit: "200"
    });
  }

  async getAdSets(externalAccountId: string) {
    return this.fetchAllPages<MetaAdSetNode>(`/act_${externalAccountId}/adsets`, {
      fields: "id,campaign_id,name,status,effective_status,targeting",
      limit: "200"
    });
  }

  async getAds(externalAccountId: string) {
    return this.fetchAllPages<MetaAdNode>(`/act_${externalAccountId}/ads`, {
      fields: "id,adset_id,name,status,effective_status,creative{id,name}",
      limit: "200"
    });
  }

  async getInsights(entityPath: string) {
    return this.fetchAllPages<MetaInsightNode>(entityPath, {
      fields: "date_start,impressions,clicks,spend,ctr,actions",
      time_increment: "1",
      date_preset: "last_30d",
      limit: "200"
    });
  }
}
