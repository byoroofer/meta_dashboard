import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import { MetaBusinessClient } from "@/lib/meta/client";

type Row = Record<string, unknown>;

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function statusFromAccountStatus(value?: number) {
  return value === 1 ? "active" : "warning";
}

function deliveryStatus(value?: string) {
  const normalized = (value ?? "").toUpperCase();

  if (normalized.includes("ACTIVE")) return "active";
  if (normalized.includes("PAUSED")) return "paused";
  return "completed";
}

function buildAudienceSummary(targeting: unknown) {
  const record = targeting && typeof targeting === "object" ? (targeting as Row) : {};
  const geo = record.geo_locations && typeof record.geo_locations === "object" ? (record.geo_locations as Row) : {};
  const countries = Array.isArray(geo.countries) ? (geo.countries as string[]).join(", ") : "";
  return countries || "Audience targeting imported from Meta";
}

function extractLeadValue(fields: Array<{ name?: string; values?: string[] }> | undefined, names: string[]) {
  const lower = new Set(names.map((name) => name.toLowerCase()));
  const match = (fields ?? []).find((item) => lower.has(str(item.name).toLowerCase()));
  return match?.values?.[0] ?? "";
}

function extractLeadCount(actions: Array<{ action_type?: string; value?: string }> | undefined) {
  const leadAction = (actions ?? []).find((item) => str(item.action_type).toLowerCase() === "lead");
  return num(leadAction?.value);
}

export async function syncMetaData() {
  const client = getSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase admin client is not configured.");
  }

  const meta = new MetaBusinessClient();
  const startedAt = new Date().toISOString();

  const syncJob = await client
    .from("sync_jobs")
    .insert({
      scope: "meta-full-import",
      status: "running",
      detail: "Importing businesses, assets, ad accounts, campaigns, ad sets, ads, insights, lead forms, and leads from Meta.",
      started_at: startedAt
    })
    .select("id")
    .single();

  if (syncJob.error) {
    throw syncJob.error;
  }

  const counts = {
    businesses: 0,
    assets: 0,
    adAccounts: 0,
    links: 0,
    campaigns: 0,
    adsets: 0,
    ads: 0,
    insights: 0,
    leadForms: 0,
    leads: 0
  };

  try {
    const businesses = await meta.getConnectedBusinesses();

    for (const business of businesses) {
      const businessUpsert = await client
        .from("connected_businesses")
        .upsert(
          {
            external_business_id: business.id,
            business_name: str(business.name, "Unnamed business"),
            status: "active",
            sync_status: "healthy",
            webhook_health: "unknown",
            granted_scopes: ["ads_read", "leads_retrieval", "pages_manage_metadata", "pages_messaging", "instagram_manage_messages"],
            last_synced_at: startedAt
          },
          { onConflict: "external_business_id" }
        )
        .select("id")
        .single();

      if (businessUpsert.error) throw businessUpsert.error;
      counts.businesses += 1;
      const businessId = str((businessUpsert.data as Row).id);

      const pages = await meta.getBusinessPages(business.id);
      const linkableAssetIds: string[] = [];

      for (const page of pages) {
        const pageUpsert = await client
          .from("connected_assets")
          .upsert(
            {
              business_id: businessId,
              asset_type: "facebook_page",
              external_asset_id: page.id,
              asset_name: str(page.name, "Facebook Page"),
              connection_status: "active",
              sync_status: "healthy",
              webhook_health: "unknown",
              granted_scopes: page.tasks ?? [],
              last_synced_at: startedAt
            },
            { onConflict: "asset_type,external_asset_id" }
          )
          .select("id")
          .single();

        if (pageUpsert.error) throw pageUpsert.error;
        const pageAssetId = str((pageUpsert.data as Row).id);
        linkableAssetIds.push(pageAssetId);
        counts.assets += 1;

        const ig = page.instagram_business_account;
        if (ig?.id) {
          const igUpsert = await client
            .from("connected_assets")
            .upsert(
              {
                business_id: businessId,
                asset_type: "instagram_professional",
                external_asset_id: ig.id,
                asset_name: str(ig.name || ig.username, "Instagram professional"),
                connection_status: "active",
                sync_status: "healthy",
                webhook_health: "unknown",
                granted_scopes: ["instagram_manage_messages"],
                last_synced_at: startedAt
              },
              { onConflict: "asset_type,external_asset_id" }
            )
            .select("id")
            .single();

          if (igUpsert.error) throw igUpsert.error;
          linkableAssetIds.push(str((igUpsert.data as Row).id));
          counts.assets += 1;
        }

        const leadForms = await meta.getLeadForms(page.id);

        for (const form of leadForms) {
          const formUpsert = await client
            .from("lead_forms")
            .upsert(
              {
                connected_asset_id: pageAssetId,
                external_form_id: form.id,
                form_name: str(form.name, "Lead form"),
                status: str(form.status, "active").toLowerCase() === "active" ? "active" : "paused"
              },
              { onConflict: "external_form_id" }
            )
            .select("id")
            .single();

          if (formUpsert.error) throw formUpsert.error;
          counts.leadForms += 1;
          const formId = str((formUpsert.data as Row).id);
          const leads = await meta.getLeads(form.id);

          for (const lead of leads) {
            const fullName = extractLeadValue(lead.field_data, ["full_name", "name", "full name"]);
            const email = extractLeadValue(lead.field_data, ["email"]);
            const phone = extractLeadValue(lead.field_data, ["phone_number", "phone", "mobile_phone"]);

            const leadUpsert = await client
              .from("leads")
              .upsert(
                {
                  lead_form_id: formId,
                  external_lead_id: lead.id,
                  full_name: fullName,
                  email,
                  phone,
                  campaign_name: str(lead.campaign_name),
                  adset_name: str(lead.adset_name),
                  ad_name: str(lead.ad_name),
                  status: "new",
                  raw_submission: {
                    field_data: lead.field_data ?? [],
                    created_time: lead.created_time
                  },
                  created_at: str(lead.created_time, startedAt)
                },
                { onConflict: "external_lead_id" }
              )
              .select("id")
              .single();

            if (leadUpsert.error) throw leadUpsert.error;
            counts.leads += 1;
          }
        }
      }

      const adAccounts = await meta.getBusinessAdAccounts(business.id);

      for (const adAccount of adAccounts) {
        const adAccountAssetUpsert = await client
          .from("connected_assets")
          .upsert(
            {
              business_id: businessId,
              asset_type: "ad_account",
              external_asset_id: str(adAccount.account_id || adAccount.id),
              asset_name: str(adAccount.name, "Ad account"),
              connection_status: statusFromAccountStatus(adAccount.account_status),
              sync_status: "healthy",
              webhook_health: "unknown",
              granted_scopes: ["ads_read"],
              last_synced_at: startedAt
            },
            { onConflict: "asset_type,external_asset_id" }
          )
          .select("id")
          .single();

        if (adAccountAssetUpsert.error) throw adAccountAssetUpsert.error;
        const adAccountAssetId = str((adAccountAssetUpsert.data as Row).id);
        counts.assets += 1;

        const adAccountUpsert = await client
          .from("ad_accounts")
          .upsert(
            {
              connected_asset_id: adAccountAssetId,
              external_account_id: str(adAccount.account_id || adAccount.id),
              account_name: str(adAccount.name, "Ad account"),
              currency: str(adAccount.currency, "USD"),
              status: statusFromAccountStatus(adAccount.account_status)
            },
            { onConflict: "external_account_id" }
          )
          .select("id")
          .single();

        if (adAccountUpsert.error) throw adAccountUpsert.error;
        counts.adAccounts += 1;
        const adAccountId = str((adAccountUpsert.data as Row).id);

        if (linkableAssetIds.length) {
          const linkPayload = linkableAssetIds.map((assetId) => ({
            ad_account_id: adAccountId,
            connected_asset_id: assetId,
            relationship_type: "business_scope"
          }));

          const linksUpsert = await client
            .from("ad_account_asset_links")
            .upsert(linkPayload, { onConflict: "ad_account_id,connected_asset_id" })
            .select("id");

          if (linksUpsert.error) throw linksUpsert.error;
          counts.links += linksUpsert.data?.length ?? linkPayload.length;
        }

        const campaigns = await meta.getCampaigns(str(adAccount.account_id || adAccount.id));
        const campaignIdsByExternalId = new Map<string, string>();

        for (const campaign of campaigns) {
          const campaignUpsert = await client
            .from("campaigns")
            .upsert(
              {
                ad_account_id: adAccountId,
                external_campaign_id: campaign.id,
                campaign_name: str(campaign.name, "Campaign"),
                objective: str(campaign.objective, "Unknown"),
                status: deliveryStatus(campaign.effective_status || campaign.status),
                budget_daily: num(campaign.daily_budget)
              },
              { onConflict: "external_campaign_id" }
            )
            .select("id")
            .single();

          if (campaignUpsert.error) throw campaignUpsert.error;
          campaignIdsByExternalId.set(campaign.id, str((campaignUpsert.data as Row).id));
          counts.campaigns += 1;
        }

        const adsets = await meta.getAdSets(str(adAccount.account_id || adAccount.id));
        const adsetIdsByExternalId = new Map<string, string>();

        for (const adset of adsets) {
          const campaignId = campaignIdsByExternalId.get(str(adset.campaign_id)) ?? Array.from(campaignIdsByExternalId.values())[0];
          if (!campaignId) continue;

          const adsetUpsert = await client
            .from("adsets")
            .upsert(
              {
                campaign_id: campaignId,
                external_adset_id: adset.id,
                adset_name: str(adset.name, "Ad set"),
                audience_summary: buildAudienceSummary(adset.targeting),
                status: deliveryStatus(adset.effective_status || adset.status)
              },
              { onConflict: "external_adset_id" }
            )
            .select("id")
            .single();

          if (adsetUpsert.error) throw adsetUpsert.error;
          adsetIdsByExternalId.set(adset.id, str((adsetUpsert.data as Row).id));
          counts.adsets += 1;
        }

        const ads = await meta.getAds(str(adAccount.account_id || adAccount.id));

        for (const ad of ads) {
          const adsetId = adsetIdsByExternalId.get(str(ad.adset_id)) ?? Array.from(adsetIdsByExternalId.values())[0];
          if (!adsetId) continue;

          const adUpsert = await client
            .from("ads")
            .upsert(
              {
                adset_id: adsetId,
                external_ad_id: ad.id,
                ad_name: str(ad.name, "Ad"),
                creative_name: str(ad.creative?.name || ad.creative?.id, "Creative"),
                status: deliveryStatus(ad.effective_status || ad.status)
              },
              { onConflict: "external_ad_id" }
            )
            .select("id")
            .single();

          if (adUpsert.error) throw adUpsert.error;
          counts.ads += 1;
        }

        const entityTargets = [
          { entityType: "account", entityId: adAccountId, path: `/act_${str(adAccount.account_id || adAccount.id)}/insights` },
          ...Array.from(campaignIdsByExternalId.entries()).map(([externalId, entityId]) => ({
            entityType: "campaign",
            entityId,
            path: `/${externalId}/insights`
          })),
          ...Array.from(adsetIdsByExternalId.entries()).map(([externalId, entityId]) => ({
            entityType: "adset",
            entityId,
            path: `/${externalId}/insights`
          }))
        ] as const;

        for (const target of entityTargets) {
          const insights = await meta.getInsights(target.path);

          if (!insights.length) {
            continue;
          }

          const payload = insights.map((insight) => ({
            entity_type: target.entityType,
            entity_id: target.entityId,
            insight_date: str(insight.date_start, startedAt.slice(0, 10)),
            impressions: num(insight.impressions),
            clicks: num(insight.clicks),
            leads: extractLeadCount(insight.actions),
            spend: num(insight.spend),
            ctr: num(insight.ctr),
            cpl: extractLeadCount(insight.actions) > 0 ? num(insight.spend) / extractLeadCount(insight.actions) : 0
          }));

          const insightsUpsert = await client
            .from("ad_insights_daily")
            .upsert(payload, { onConflict: "entity_type,entity_id,insight_date" })
            .select("id");

          if (insightsUpsert.error) throw insightsUpsert.error;
          counts.insights += insightsUpsert.data?.length ?? payload.length;
        }
      }
    }

    await client
      .from("sync_jobs")
      .update({
        status: "succeeded",
        completed_at: new Date().toISOString(),
        detail: `Imported ${counts.businesses} businesses, ${counts.assets} assets, ${counts.adAccounts} ad accounts, ${counts.campaigns} campaigns, ${counts.adsets} ad sets, ${counts.ads} ads, ${counts.insights} insight rows, ${counts.leadForms} lead forms, and ${counts.leads} leads.`
      })
      .eq("id", syncJob.data.id);

    await client.from("audit_logs").insert({
      actor_label: "system",
      action: "meta.import_full",
      target_type: "sync_job",
      target_id: str(syncJob.data.id),
      outcome: "success",
      detail: "Meta import completed successfully.",
      metadata: counts
    });

    return { syncJobId: str(syncJob.data.id), counts };
  } catch (error) {
    await client
      .from("sync_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        detail: error instanceof Error ? error.message : "Meta import failed."
      })
      .eq("id", syncJob.data.id);

    await client.from("audit_logs").insert({
      actor_label: "system",
      action: "meta.import_full",
      target_type: "sync_job",
      target_id: str(syncJob.data.id),
      outcome: "error",
      detail: error instanceof Error ? error.message : "Meta import failed."
    });

    throw error;
  }
}
