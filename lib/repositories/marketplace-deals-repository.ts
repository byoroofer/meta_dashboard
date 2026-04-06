import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import type {
  MarketplaceAIAnalysis,
  MarketplaceComparableListing,
  MarketplaceListingDetail,
  MarketplaceListingStatusRecord,
  MarketplaceNormalizedListing,
  MarketplaceSavedSearch,
  MarketplaceSavedSearchCreateInput,
  MarketplaceScanResult,
  MarketplaceScanSummary
} from "@/types/marketplace";

type Row = Record<string, unknown>;
type SupabaseAdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

interface StoredListing {
  id: string;
  dedupeKey: string;
  duplicateCount: number;
  normalized: MarketplaceNormalizedListing;
}

interface StoredScanResult {
  id: string;
  scanId: string;
  listingId: string;
  listing: MarketplaceNormalizedListing;
  createdAt: string;
}

interface MarketplaceDemoStore {
  savedSearches: MarketplaceSavedSearch[];
  scans: MarketplaceScanSummary[];
  listings: StoredListing[];
  scanResults: StoredScanResult[];
  analyses: Record<string, MarketplaceAIAnalysis>;
  comps: Record<string, MarketplaceComparableListing[]>;
  statuses: Record<string, MarketplaceListingStatusRecord>;
  sourceErrors: Array<{ id: string; scanId: string; source: string; errorMessage: string; createdAt: string }>;
}

const DEFAULT_SAVED_SEARCHES: MarketplaceSavedSearch[] = [
  {
    id: crypto.randomUUID(),
    name: "Milwaukee M18 deals",
    description: "Cordless drill and driver combos under local market value.",
    criteria: {
      category: "power tools",
      keywords: ["milwaukee", "drill", "fuel"],
      mustIncludeWords: ["milwaukee"],
      brand: "Milwaukee",
      model: "",
      condition: "any",
      priceFloor: null,
      priceCeiling: 180,
      location: "Dallas",
      radiusMiles: 35,
      excludedWords: ["broken", "parts"],
      targetResaleValue: 185,
      requiredProfitMargin: 45,
      sourceKeys: [],
      postedWithinHours: 72
    },
    scheduleEnabled: false,
    scheduleLabel: "Future cron-ready preset",
    alertThresholdScore: 84,
    lastScannedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    name: "Sony A6400 flips",
    description: "Watch mirrorless bodies and kits with room for resale.",
    criteria: {
      category: "cameras",
      keywords: ["sony", "a6400"],
      mustIncludeWords: ["sony"],
      brand: "Sony",
      model: "A6400",
      condition: "any",
      priceFloor: null,
      priceCeiling: 800,
      location: "Dallas",
      radiusMiles: 120,
      excludedWords: ["repair", "parts"],
      targetResaleValue: 780,
      requiredProfitMargin: 90,
      sourceKeys: [],
      postedWithinHours: 168
    },
    scheduleEnabled: false,
    scheduleLabel: "Future cron-ready preset",
    alertThresholdScore: 82,
    lastScannedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function getDemoStore() {
  const runtime = globalThis as typeof globalThis & { __marketplaceDealsStore?: MarketplaceDemoStore };

  if (!runtime.__marketplaceDealsStore) {
    runtime.__marketplaceDealsStore = {
      savedSearches: DEFAULT_SAVED_SEARCHES,
      scans: [],
      listings: [],
      scanResults: [],
      analyses: {},
      comps: {},
      statuses: {},
      sourceErrors: []
    };
  }

  return runtime.__marketplaceDealsStore;
}

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const nullable = (value: unknown) => (typeof value === "string" && value ? value : null);
const num = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};
const obj = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const arr = (value: unknown) => (Array.isArray(value) ? value : []);

function defaultStatus(listingId: string): MarketplaceListingStatusRecord {
  return {
    listingId,
    operatorStatus: "new",
    manualNotes: "",
    updatedAt: new Date().toISOString()
  };
}

function mapSavedSearch(row: Row): MarketplaceSavedSearch {
  return {
    id: str(row.id),
    name: str(row.search_name),
    description: nullable(row.description),
    criteria: obj(row.criteria) as unknown as MarketplaceSavedSearch["criteria"],
    scheduleEnabled: Boolean(row.schedule_enabled),
    scheduleLabel: nullable(row.schedule_label),
    alertThresholdScore: num(row.alert_threshold_score, 82),
    lastScannedAt: nullable(row.last_scanned_at),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at)
  };
}

function mapScan(row: Row): MarketplaceScanSummary {
  return {
    id: str(row.id),
    savedSearchId: nullable(row.saved_search_id),
    status: str(row.status, "queued") as MarketplaceScanSummary["status"],
    startedAt: str(row.started_at),
    completedAt: nullable(row.completed_at),
    listingCount: num(row.listing_count),
    dealCount: num(row.deal_count),
    sourceCount: num(row.source_count),
    errorCount: num(row.error_count),
    queryLabel: str(row.query_label),
    summary: str(row.summary),
    criteriaSnapshot: obj(row.criteria_snapshot) as unknown as MarketplaceScanSummary["criteriaSnapshot"]
  };
}

async function liveOrFallback<T>(
  operation: string,
  fallback: () => T | Promise<T>,
  live: (client: SupabaseAdminClient) => Promise<T>
) {
  const client = getSupabaseAdminClient();
  if (!client) return fallback();

  try {
    return await live(client);
  } catch (error) {
    console.warn(`[marketplaceDealsRepository] Falling back for ${operation}.`, error);
    return fallback();
  }
}

export const marketplaceDealsRepository = {
  async listSavedSearches() {
    return liveOrFallback(
      "listSavedSearches",
      () => getDemoStore().savedSearches,
      async (client) => {
        const result = await client.from("marketplace_saved_searches").select("*").order("created_at", { ascending: false });
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => mapSavedSearch(row as Row));
      }
    );
  },

  async createSavedSearch(input: MarketplaceSavedSearchCreateInput) {
    return liveOrFallback(
      "createSavedSearch",
      () => {
        const entry: MarketplaceSavedSearch = {
          id: crypto.randomUUID(),
          name: input.name,
          description: input.description ?? null,
          criteria: input.criteria,
          scheduleEnabled: input.scheduleEnabled ?? false,
          scheduleLabel: input.scheduleLabel ?? null,
          alertThresholdScore: input.alertThresholdScore ?? 82,
          lastScannedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        getDemoStore().savedSearches.unshift(entry);
        return entry;
      },
      async (client) => {
        const result = await client
          .from("marketplace_saved_searches")
          .insert({
            search_name: input.name,
            description: input.description ?? null,
            criteria: input.criteria,
            schedule_enabled: input.scheduleEnabled ?? false,
            schedule_label: input.scheduleLabel ?? null,
            alert_threshold_score: input.alertThresholdScore ?? 82
          })
          .select("*")
          .single();

        if (result.error) throw result.error;
        return mapSavedSearch(result.data as Row);
      }
    );
  },

  async getSavedSearchById(savedSearchId: string) {
    const searches = await this.listSavedSearches();
    return searches.find((search) => search.id === savedSearchId) ?? null;
  },

  async touchSavedSearch(savedSearchId: string | undefined, at: string) {
    if (!savedSearchId) return;

    return liveOrFallback(
      "touchSavedSearch",
      () => {
        const entry = getDemoStore().savedSearches.find((search) => search.id === savedSearchId);
        if (entry) {
          entry.lastScannedAt = at;
          entry.updatedAt = at;
        }
      },
      async (client) => {
        const result = await client.from("marketplace_saved_searches").update({ last_scanned_at: at }).eq("id", savedSearchId);
        if (result.error) throw result.error;
      }
    );
  },

  async createScanRun(input: { savedSearchId?: string; queryLabel: string; criteriaSnapshot: MarketplaceScanSummary["criteriaSnapshot"]; sourceCount: number }) {
    return liveOrFallback(
      "createScanRun",
      () => {
        const scan: MarketplaceScanSummary = {
          id: crypto.randomUUID(),
          savedSearchId: input.savedSearchId ?? null,
          status: "running",
          startedAt: new Date().toISOString(),
          completedAt: null,
          listingCount: 0,
          dealCount: 0,
          sourceCount: input.sourceCount,
          errorCount: 0,
          queryLabel: input.queryLabel,
          summary: "Scan in progress",
          criteriaSnapshot: input.criteriaSnapshot
        };
        getDemoStore().scans.unshift(scan);
        return scan;
      },
      async (client) => {
        const result = await client
          .from("marketplace_scan_runs")
          .insert({
            saved_search_id: input.savedSearchId ?? null,
            query_label: input.queryLabel,
            criteria_snapshot: input.criteriaSnapshot,
            source_count: input.sourceCount,
            status: "running"
          })
          .select("*")
          .single();

        if (result.error) throw result.error;
        return mapScan(result.data as Row);
      }
    );
  },

  async finalizeScanRun(scanId: string, input: Omit<MarketplaceScanSummary, "id" | "savedSearchId" | "startedAt" | "criteriaSnapshot">) {
    return liveOrFallback(
      "finalizeScanRun",
      () => {
        const scan = getDemoStore().scans.find((entry) => entry.id === scanId);
        if (scan) {
          scan.status = input.status;
          scan.completedAt = input.completedAt;
          scan.listingCount = input.listingCount;
          scan.dealCount = input.dealCount;
          scan.sourceCount = input.sourceCount;
          scan.errorCount = input.errorCount;
          scan.queryLabel = input.queryLabel;
          scan.summary = input.summary;
        }
      },
      async (client) => {
        const result = await client
          .from("marketplace_scan_runs")
          .update({
            status: input.status,
            completed_at: input.completedAt,
            listing_count: input.listingCount,
            deal_count: input.dealCount,
            source_count: input.sourceCount,
            error_count: input.errorCount,
            summary: input.summary
          })
          .eq("id", scanId);

        if (result.error) throw result.error;
      }
    );
  },

  async recordSourceError(scanId: string, source: string, errorMessage: string) {
    return liveOrFallback(
      "recordSourceError",
      () => {
        getDemoStore().sourceErrors.unshift({
          id: crypto.randomUUID(),
          scanId,
          source,
          errorMessage,
          createdAt: new Date().toISOString()
        });
      },
      async (client) => {
        const result = await client.from("marketplace_source_errors").insert({ scan_id: scanId, source, error_message: errorMessage });
        if (result.error) throw result.error;
      }
    );
  },

  async upsertListing(listing: MarketplaceNormalizedListing) {
    return liveOrFallback(
      "upsertListing",
      () => {
        const store = getDemoStore();
        const existing = store.listings.find((entry) => entry.dedupeKey === listing.dedupeKey);
        if (existing) {
          existing.duplicateCount += 1;
          existing.normalized = listing;
          return { listingId: existing.id, duplicateCount: existing.duplicateCount };
        }

        const stored: StoredListing = {
          id: crypto.randomUUID(),
          dedupeKey: listing.dedupeKey,
          duplicateCount: 0,
          normalized: listing
        };

        store.listings.push(stored);
        store.statuses[stored.id] = defaultStatus(stored.id);
        return { listingId: stored.id, duplicateCount: stored.duplicateCount };
      },
      async (client) => {
        const existing = await client
          .from("marketplace_listings")
          .select("id,duplicate_count")
          .eq("dedupe_key", listing.dedupeKey)
          .maybeSingle();

        if (existing.error) throw existing.error;

        const duplicateCount = existing.data ? num((existing.data as Row).duplicate_count) + 1 : 0;

        const upsertResult = await client
          .from("marketplace_listings")
          .upsert(
            {
              id: existing.data ? str((existing.data as Row).id) : undefined,
              dedupe_key: listing.dedupeKey,
              canonical_title: listing.title,
              normalized_title: listing.normalizedTitle,
              inferred_brand: listing.inferredBrand,
              inferred_model: listing.inferredModel,
              inferred_category: listing.inferredCategory,
              inferred_condition: listing.inferredCondition,
              latest_source: listing.source,
              latest_source_listing_id: listing.sourceListingId,
              latest_title: listing.title,
              latest_description: listing.description,
              latest_price: listing.price,
              currency: listing.currency,
              latest_location: listing.location,
              latest_url: listing.url,
              latest_image_urls: listing.imageUrls,
              latest_posted_at: listing.postedAt,
              seller_name: listing.sellerName,
              condition_raw: listing.conditionRaw,
              metadata: listing.metadata,
              duplicate_count: duplicateCount,
              last_seen_at: new Date().toISOString()
            },
            { onConflict: "dedupe_key" }
          )
          .select("id,duplicate_count")
          .single();

        if (upsertResult.error) throw upsertResult.error;

        const statusResult = await client
          .from("marketplace_listing_status")
          .upsert({ listing_id: str((upsertResult.data as Row).id), operator_status: "new", manual_notes: "" }, { onConflict: "listing_id" });

        if (statusResult.error) throw statusResult.error;

        return {
          listingId: str((upsertResult.data as Row).id),
          duplicateCount: num((upsertResult.data as Row).duplicate_count)
        };
      }
    );
  },

  async saveScanResult(scanId: string, listingId: string, listing: MarketplaceNormalizedListing) {
    return liveOrFallback(
      "saveScanResult",
      () => {
        const scanResult: StoredScanResult = {
          id: crypto.randomUUID(),
          scanId,
          listingId,
          listing,
          createdAt: new Date().toISOString()
        };
        getDemoStore().scanResults.unshift(scanResult);
        return { scanResultId: scanResult.id };
      },
      async (client) => {
        const result = await client
          .from("marketplace_scan_results")
          .insert({
            scan_id: scanId,
            listing_id: listingId,
            source: listing.source,
            source_listing_id: listing.sourceListingId,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency,
            location: listing.location,
            url: listing.url,
            image_urls: listing.imageUrls,
            posted_at: listing.postedAt,
            seller_name: listing.sellerName,
            condition_raw: listing.conditionRaw,
            source_metadata: listing.metadata,
            comparison_status: "completed"
          })
          .select("id")
          .single();

        if (result.error) throw result.error;
        return { scanResultId: str((result.data as Row).id) };
      }
    );
  },

  async saveAnalysis(scanResultId: string, analysis: MarketplaceAIAnalysis) {
    return liveOrFallback(
      "saveAnalysis",
      () => {
        getDemoStore().analyses[scanResultId] = analysis;
      },
      async (client) => {
        const result = await client.from("marketplace_listing_ai_analysis").upsert(
          {
            scan_result_id: scanResultId,
            normalized_title: analysis.normalizedTitle,
            inferred_brand: analysis.inferredBrand,
            inferred_model: analysis.inferredModel,
            inferred_category: analysis.inferredCategory,
            inferred_condition: analysis.inferredCondition,
            confidence: analysis.confidence,
            fair_value_low: analysis.fairValueLow,
            fair_value_mid: analysis.fairValueMid,
            fair_value_high: analysis.fairValueHigh,
            resale_value_low: analysis.resaleValueLow,
            resale_value_mid: analysis.resaleValueMid,
            resale_value_high: analysis.resaleValueHigh,
            best_use_case: analysis.bestUseCase,
            resale_potential: analysis.resalePotential,
            risk_flags: analysis.riskFlags,
            reasoning: analysis.reasoning,
            suggested_comp_keywords: analysis.suggestedCompKeywords,
            parsed_attributes: analysis.parsedAttributes,
            deal_score: analysis.dealScore,
            score_breakdown: analysis.scoreBreakdown,
            price_delta_amount: analysis.priceDeltaAmount,
            price_delta_percent: analysis.priceDeltaPercent,
            analysis_model: analysis.analysisModel,
            analysis_version: analysis.analysisVersion,
            raw_response: analysis.rawResponse
          },
          { onConflict: "scan_result_id" }
        );

        if (result.error) throw result.error;
      }
    );
  },

  async replaceComparables(scanResultId: string, comps: MarketplaceComparableListing[]) {
    return liveOrFallback(
      "replaceComparables",
      () => {
        getDemoStore().comps[scanResultId] = comps;
      },
      async (client) => {
        const deleteResult = await client.from("marketplace_listing_comps").delete().eq("scan_result_id", scanResultId);
        if (deleteResult.error) throw deleteResult.error;

        if (!comps.length) return;

        const insertResult = await client.from("marketplace_listing_comps").insert(
          comps.map((comp) => ({
            scan_result_id: scanResultId,
            comp_type: comp.compType,
            comp_source: comp.compSource,
            comp_source_listing_id: comp.compSourceListingId,
            comp_title: comp.compTitle,
            comp_url: comp.compUrl,
            comp_price: comp.compPrice,
            comp_currency: comp.compCurrency,
            comp_condition: comp.compCondition,
            comp_location: comp.compLocation,
            similarity_score: comp.similarityScore,
            match_reasons: comp.matchReasons,
            posted_at: comp.postedAt,
            metadata: comp.metadata
          }))
        );

        if (insertResult.error) throw insertResult.error;
      }
    );
  },

  async listScanHistory() {
    return liveOrFallback(
      "listScanHistory",
      () => getDemoStore().scans,
      async (client) => {
        const result = await client.from("marketplace_scan_runs").select("*").order("started_at", { ascending: false }).limit(20);
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => mapScan(row as Row));
      }
    );
  },

  async getLatestScanId() {
    const scans = await this.listScanHistory();
    return scans.find((scan) => scan.status === "succeeded")?.id ?? scans[0]?.id ?? null;
  },

  async updateListingStatus(listingId: string, input: { operatorStatus: MarketplaceListingStatusRecord["operatorStatus"]; manualNotes: string }) {
    return liveOrFallback(
      "updateListingStatus",
      () => {
        getDemoStore().statuses[listingId] = {
          listingId,
          operatorStatus: input.operatorStatus,
          manualNotes: input.manualNotes,
          updatedAt: new Date().toISOString()
        };
        return getDemoStore().statuses[listingId];
      },
      async (client) => {
        const result = await client
          .from("marketplace_listing_status")
          .upsert(
            {
              listing_id: listingId,
              operator_status: input.operatorStatus,
              manual_notes: input.manualNotes,
              updated_at: new Date().toISOString()
            },
            { onConflict: "listing_id" }
          )
          .select("*")
          .single();

        if (result.error) throw result.error;

        return {
          listingId: str((result.data as Row).listing_id),
          operatorStatus: str((result.data as Row).operator_status, "new") as MarketplaceListingStatusRecord["operatorStatus"],
          manualNotes: str((result.data as Row).manual_notes),
          updatedAt: str((result.data as Row).updated_at)
        };
      }
    );
  },

  async getScanResults(scanId: string | null) {
    return liveOrFallback(
      "getScanResults",
      () => {
        if (!scanId) return [] as MarketplaceScanResult[];

        const store = getDemoStore();
        return store.scanResults
          .filter((result) => result.scanId === scanId)
          .map((result) => {
            const listing = store.listings.find((entry) => entry.id === result.listingId);
            const analysis = store.analyses[result.id];
            if (!analysis) return null;

            const status = store.statuses[result.listingId] ?? defaultStatus(result.listingId);
            return {
              scanResultId: result.id,
              scanId: result.scanId,
              listingId: result.listingId,
              source: result.listing.source,
              sourceListingId: result.listing.sourceListingId,
              title: result.listing.title,
              description: result.listing.description,
              listedPrice: result.listing.price,
              currency: result.listing.currency,
              location: result.listing.location,
              url: result.listing.url,
              imageUrls: result.listing.imageUrls,
              postedAt: result.listing.postedAt,
              sellerName: result.listing.sellerName,
              conditionRaw: result.listing.conditionRaw,
              sourceMetadata: result.listing.metadata,
              duplicateCount: listing?.duplicateCount ?? 0,
              operatorStatus: status.operatorStatus,
              manualNotes: status.manualNotes,
              analysis,
              comps: store.comps[result.id] ?? []
            } satisfies MarketplaceScanResult;
          })
          .filter((item): item is MarketplaceScanResult => Boolean(item))
          .sort((left, right) => right.analysis.dealScore - left.analysis.dealScore);
      },
      async (client) => {
        if (!scanId) return [] as MarketplaceScanResult[];

        const scanResultsResponse = await client
          .from("marketplace_scan_results")
          .select("*")
          .eq("scan_id", scanId)
          .order("created_at", { ascending: false });

        if (scanResultsResponse.error) throw scanResultsResponse.error;

        const resultRows = (scanResultsResponse.data ?? []) as Row[];
        if (!resultRows.length) return [] as MarketplaceScanResult[];

        const scanResultIds = resultRows.map((row) => str(row.id));
        const listingIds = resultRows.map((row) => str(row.listing_id));

        const [analysisResponse, compsResponse, statusesResponse, listingsResponse] = await Promise.all([
          client.from("marketplace_listing_ai_analysis").select("*").in("scan_result_id", scanResultIds),
          client.from("marketplace_listing_comps").select("*").in("scan_result_id", scanResultIds),
          client.from("marketplace_listing_status").select("*").in("listing_id", listingIds),
          client.from("marketplace_listings").select("id,duplicate_count").in("id", listingIds)
        ]);

        if (analysisResponse.error || compsResponse.error || statusesResponse.error || listingsResponse.error) {
          throw analysisResponse.error ?? compsResponse.error ?? statusesResponse.error ?? listingsResponse.error;
        }

        const analysisByResult = new Map((analysisResponse.data ?? []).map((row) => [str((row as Row).scan_result_id), row as Row]));
        const statusByListing = new Map((statusesResponse.data ?? []).map((row) => [str((row as Row).listing_id), row as Row]));
        const duplicateCountByListing = new Map((listingsResponse.data ?? []).map((row) => [str((row as Row).id), num((row as Row).duplicate_count)]));
        const compsByResult = new Map<string, MarketplaceComparableListing[]>();

        for (const row of (compsResponse.data ?? []) as Row[]) {
          const key = str(row.scan_result_id);
          const next = compsByResult.get(key) ?? [];
          next.push({
            compType: str(row.comp_type, "category") as MarketplaceComparableListing["compType"],
            compSource: str(row.comp_source),
            compSourceListingId: str(row.comp_source_listing_id),
            compTitle: str(row.comp_title),
            compUrl: str(row.comp_url),
            compPrice: num(row.comp_price),
            compCurrency: str(row.comp_currency, "USD"),
            compCondition: nullable(row.comp_condition),
            compLocation: str(row.comp_location),
            similarityScore: num(row.similarity_score),
            matchReasons: arr(row.match_reasons).filter((value): value is string => typeof value === "string"),
            postedAt: nullable(row.posted_at),
            metadata: obj(row.metadata)
          });
          compsByResult.set(key, next);
        }

        return resultRows
          .map((row) => {
            const analysisRow = analysisByResult.get(str(row.id));
            if (!analysisRow) return null;

            const statusRow = statusByListing.get(str(row.listing_id));
            return {
              scanResultId: str(row.id),
              scanId: str(row.scan_id),
              listingId: str(row.listing_id),
              source: str(row.source),
              sourceListingId: str(row.source_listing_id),
              title: str(row.title),
              description: str(row.description),
              listedPrice: num(row.price),
              currency: str(row.currency, "USD"),
              location: str(row.location),
              url: str(row.url),
              imageUrls: arr(row.image_urls).filter((value): value is string => typeof value === "string"),
              postedAt: nullable(row.posted_at),
              sellerName: nullable(row.seller_name),
              conditionRaw: nullable(row.condition_raw),
              sourceMetadata: obj(row.source_metadata),
              duplicateCount: duplicateCountByListing.get(str(row.listing_id)) ?? 0,
              operatorStatus: str(statusRow?.operator_status, "new") as MarketplaceListingStatusRecord["operatorStatus"],
              manualNotes: str(statusRow?.manual_notes),
              analysis: {
                normalizedTitle: str(analysisRow.normalized_title),
                inferredBrand: nullable(analysisRow.inferred_brand),
                inferredModel: nullable(analysisRow.inferred_model),
                inferredCategory: nullable(analysisRow.inferred_category),
                inferredCondition: str(analysisRow.inferred_condition, "unknown") as MarketplaceAIAnalysis["inferredCondition"],
                confidence: num(analysisRow.confidence),
                fairValueLow: num(analysisRow.fair_value_low),
                fairValueMid: num(analysisRow.fair_value_mid),
                fairValueHigh: num(analysisRow.fair_value_high),
                resaleValueLow: num(analysisRow.resale_value_low),
                resaleValueMid: num(analysisRow.resale_value_mid),
                resaleValueHigh: num(analysisRow.resale_value_high),
                bestUseCase: str(analysisRow.best_use_case),
                resalePotential: str(analysisRow.resale_potential),
                riskFlags: arr(analysisRow.risk_flags) as MarketplaceAIAnalysis["riskFlags"],
                reasoning: str(analysisRow.reasoning),
                suggestedCompKeywords: arr(analysisRow.suggested_comp_keywords).filter((value): value is string => typeof value === "string"),
                parsedAttributes: obj(analysisRow.parsed_attributes),
                priceDeltaAmount: num(analysisRow.price_delta_amount),
                priceDeltaPercent: num(analysisRow.price_delta_percent),
                dealScore: num(analysisRow.deal_score),
                scoreBreakdown: obj(analysisRow.score_breakdown) as unknown as MarketplaceAIAnalysis["scoreBreakdown"],
                analysisModel: str(analysisRow.analysis_model),
                analysisVersion: str(analysisRow.analysis_version),
                rawResponse: obj(analysisRow.raw_response)
              },
              comps: compsByResult.get(str(row.id)) ?? []
            } satisfies MarketplaceScanResult;
          })
          .filter((item): item is MarketplaceScanResult => Boolean(item))
          .sort((left, right) => right.analysis.dealScore - left.analysis.dealScore);
      }
    );
  },

  async getListingDetail(listingId: string): Promise<MarketplaceListingDetail | null> {
    return liveOrFallback(
      "getListingDetail",
      async () => {
        const store = getDemoStore();
        const latestResult = store.scanResults.find((result) => result.listingId === listingId);
        if (!latestResult) return null;

        const results = await this.getScanResults(latestResult.scanId);
        const result = results.find((entry) => entry.listingId === listingId);
        if (!result) return null;

        return {
          result,
          recentScans: store.scans.filter((scan) => store.scanResults.some((entry) => entry.scanId === scan.id && entry.listingId === listingId)).slice(0, 5)
        };
      },
      async (client) => {
        const latestResponse = await client
          .from("marketplace_scan_results")
          .select("scan_id")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestResponse.error) throw latestResponse.error;
        if (!latestResponse.data) return null;

        const scanId = str((latestResponse.data as Row).scan_id);
        const results = await this.getScanResults(scanId);
        const result = results.find((entry) => entry.listingId === listingId);
        if (!result) return null;

        const recentScansResponse = await client
          .from("marketplace_scan_results")
          .select("scan_id, marketplace_scan_runs(*)")
          .eq("listing_id", listingId);

        if (recentScansResponse.error) throw recentScansResponse.error;

        const recentScans = (recentScansResponse.data ?? [])
          .map((row) => mapScan(((row as Row).marketplace_scan_runs as Row | undefined) ?? {}))
          .filter((scan) => scan.id)
          .slice(0, 5);

        return { result, recentScans };
      }
    );
  }
};
