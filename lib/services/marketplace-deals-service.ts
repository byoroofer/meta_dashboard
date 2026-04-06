import { env, hasMarketplaceAlertWebhook } from "@/lib/config/env";
import { marketplaceSourceAdapters, marketplaceSourceDefinitions } from "@/lib/marketplace/adapters";
import { analyzeMarketplaceListing } from "@/lib/marketplace/ai";
import { buildComparableSet } from "@/lib/marketplace/comparison";
import { buildMarketplaceResultsCsv } from "@/lib/marketplace/csv";
import { createCriteriaLabel } from "@/lib/marketplace/normalization";
import { marketplaceDealsRepository } from "@/lib/repositories/marketplace-deals-repository";
import type {
  MarketplaceAlert,
  MarketplaceAlertChannel,
  MarketplaceDashboardData,
  MarketplaceListingDetail,
  MarketplaceListingStatusUpdateInput,
  MarketplaceSavedSearch,
  MarketplaceSavedSearchCreateInput,
  MarketplaceScanRequest,
  MarketplaceSearchCriteria
} from "@/types/marketplace";

const DEFAULT_SCHEDULE_MINUTES = 120;

const EMPTY_CRITERIA: MarketplaceSearchCriteria = {
  query: "",
  category: "",
  keywords: [],
  mustIncludeWords: [],
  brand: "",
  model: "",
  condition: "any",
  priceFloor: null,
  priceCeiling: null,
  location: "",
  radiusMiles: null,
  excludedWords: [],
  targetResaleValue: null,
  requiredProfitMargin: null,
  sourceKeys: [],
  postedWithinHours: 168
};

function calculateNextRunAt(search: MarketplaceSavedSearch) {
  if (!search.scheduleEnabled) return null;
  const minutes = search.scheduleFrequencyMinutes ?? DEFAULT_SCHEDULE_MINUTES;
  if (!minutes || minutes <= 0) return null;
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function dispatchAlertWebhook(alert: MarketplaceAlert, channel: MarketplaceAlertChannel) {
  if (!hasMarketplaceAlertWebhook || channel !== "webhook") return;

  await fetch(env.MARKETPLACE_ALERT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alertId: alert.id,
      savedSearchId: alert.savedSearchId,
      scanId: alert.scanId,
      listingId: alert.listingId,
      dealScore: alert.dealScore,
      title: alert.title,
      reasoning: alert.reasoning,
      createdAt: alert.createdAt,
      payload: alert.payload
    })
  });
}

export async function getMarketplaceDealsPageData(listingId?: string): Promise<MarketplaceDashboardData> {
  const [savedSearches, scanHistory, alerts] = await Promise.all([
    marketplaceDealsRepository.listSavedSearches(),
    marketplaceDealsRepository.listScanHistory(),
    marketplaceDealsRepository.listAlerts()
  ]);

  const activeScanId = scanHistory[0]?.id ?? null;
  const results = await marketplaceDealsRepository.getScanResults(activeScanId);

  let selectedListing: MarketplaceListingDetail | null = null;

  if (listingId) {
    selectedListing = await marketplaceDealsRepository.getListingDetail(listingId);
  } else if (results[0]) {
    selectedListing = await marketplaceDealsRepository.getListingDetail(results[0].listingId);
  }

  const liveEnabled = marketplaceSourceDefinitions.some((source) => source.mode === "public_api" && source.enabled);

  return {
    savedSearches,
    scanHistory,
    alerts,
    activeScanId,
    results,
    selectedListing,
    sources: marketplaceSourceDefinitions,
    limitations: [
      liveEnabled
        ? "Live marketplaces are accessed only through approved public APIs. Add API credentials to enable more sources."
        : "Live marketplace crawling is disabled until public API credentials are configured.",
      "OpenAI does not provide live market prices by memory. Fair-value estimates are derived from fetched comparables plus structured model reasoning.",
      "Scheduled scans are cron-ready. Call the schedule runner route to automate in production."
    ]
  };
}

export async function createMarketplaceSavedSearch(input: MarketplaceSavedSearchCreateInput) {
  const savedSearch = await marketplaceDealsRepository.createSavedSearch(input);
  if (savedSearch.scheduleEnabled && !savedSearch.nextRunAt) {
    const nextRunAt = calculateNextRunAt(savedSearch);
    if (nextRunAt) {
      await marketplaceDealsRepository.updateSavedSearch(savedSearch.id, { nextRunAt });
      savedSearch.nextRunAt = nextRunAt;
    }
  }
  return savedSearch;
}

export async function runMarketplaceScan(request: MarketplaceScanRequest) {
  const savedSearch = request.savedSearchId
    ? await marketplaceDealsRepository.getSavedSearchById(request.savedSearchId)
    : null;

  const criteria = request.criteria ?? savedSearch?.criteria ?? EMPTY_CRITERIA;
  const queryLabel = createCriteriaLabel(criteria);
  const runReason = request.runReason ?? (savedSearch?.scheduleEnabled ? "scheduled" : "manual");
  const activeAdapters = marketplaceSourceAdapters.filter((adapter) => adapter.definition.enabled);

  const scan = await marketplaceDealsRepository.createScanRun({
    savedSearchId: savedSearch?.id,
    queryLabel,
    criteriaSnapshot: criteria,
    sourceCount: activeAdapters.length,
    runReason
  });

  const touchedAt = new Date().toISOString();
  await marketplaceDealsRepository.updateSavedSearch(savedSearch?.id, {
    lastScannedAt: touchedAt
  });

  const listings = [];
  const sourceSummary: Record<string, number> = {};
  let errorCount = 0;

  for (const adapter of activeAdapters) {
    try {
      const adapterListings = await adapter.search(criteria);
      listings.push(...adapterListings);
      sourceSummary[adapter.definition.key] = adapterListings.length;
    } catch (error) {
      errorCount += 1;
      await marketplaceDealsRepository.recordSourceError(
        scan.id,
        adapter.definition.key,
        error instanceof Error ? error.message : "Unknown adapter failure."
      );
    }
  }

  let dealCount = 0;

  for (const listing of listings) {
    const comps = buildComparableSet(listing, listings);
    const analysis = await analyzeMarketplaceListing({ listing, comps, criteria });
    const listingRecord = await marketplaceDealsRepository.upsertListing(listing);
    const scanResult = await marketplaceDealsRepository.saveScanResult(scan.id, listingRecord.listingId, listing);

    await marketplaceDealsRepository.saveAnalysis(scanResult.scanResultId, analysis);
    await marketplaceDealsRepository.replaceComparables(scanResult.scanResultId, comps);

    const threshold = savedSearch?.alertThresholdScore ?? 82;
    if (analysis.dealScore >= threshold) {
      dealCount += 1;
      const channels: MarketplaceAlertChannel[] = savedSearch?.notificationChannels?.length
        ? savedSearch.notificationChannels
        : ["dashboard"];
      for (const channel of channels) {
        const alert = await marketplaceDealsRepository.createAlert({
          savedSearchId: savedSearch?.id ?? null,
          scanId: scan.id,
          listingId: listingRecord.listingId,
          dealScore: analysis.dealScore,
          title: listing.title,
          reasoning: analysis.reasoning,
          channel,
          payload: {
            source: listing.source,
            url: listing.url,
            listedPrice: listing.price,
            fairValueMid: analysis.fairValueMid,
            confidence: analysis.confidence
          }
        });
        await dispatchAlertWebhook(alert, channel);
      }
    }
  }

  const summaryText = listings.length
    ? `${dealCount} high-scoring deals from ${listings.length} matched listings.`
    : "No listings matched the current criteria.";

  await marketplaceDealsRepository.finalizeScanRun(scan.id, {
    status: "succeeded",
    completedAt: new Date().toISOString(),
    listingCount: listings.length,
    dealCount,
    sourceCount: activeAdapters.length,
    errorCount,
    queryLabel,
    summary: summaryText,
    sourceSummary
  });

  if (savedSearch?.scheduleEnabled) {
    const nextRunAt = calculateNextRunAt(savedSearch);
    await marketplaceDealsRepository.updateSavedSearch(savedSearch.id, { nextRunAt });
  }

  const results = await marketplaceDealsRepository.getScanResults(scan.id);

  return {
    scanId: scan.id,
    scan: {
      ...scan,
      status: "succeeded" as const,
      completedAt: new Date().toISOString(),
      listingCount: listings.length,
      dealCount,
      sourceCount: activeAdapters.length,
      errorCount,
      summary: summaryText,
      sourceSummary
    },
    results
  };
}

export async function runScheduledMarketplaceScans() {
  const due = await marketplaceDealsRepository.listScheduledSearchesDue(new Date().toISOString());
  const outcomes = [];

  for (const search of due) {
    const result = await runMarketplaceScan({ savedSearchId: search.id, runReason: "scheduled" });
    outcomes.push({
      savedSearchId: search.id,
      scanId: result.scanId,
      listingCount: result.results.length
    });
  }

  return { runCount: outcomes.length, outcomes };
}

export async function getMarketplaceScanHistory() {
  return marketplaceDealsRepository.listScanHistory();
}

export async function getMarketplaceResults(scanId?: string | null) {
  const resolvedScanId = scanId ?? (await marketplaceDealsRepository.getLatestScanId());
  return marketplaceDealsRepository.getScanResults(resolvedScanId);
}

export async function getMarketplaceListingDetail(listingId: string) {
  return marketplaceDealsRepository.getListingDetail(listingId);
}

export async function updateMarketplaceListingStatus(listingId: string, input: MarketplaceListingStatusUpdateInput) {
  return marketplaceDealsRepository.updateListingStatus(listingId, {
    operatorStatus: input.operatorStatus,
    manualNotes: input.manualNotes ?? ""
  });
}

export async function exportMarketplaceResultsCsv(scanId?: string | null) {
  const results = await getMarketplaceResults(scanId);
  return buildMarketplaceResultsCsv(results);
}

export async function getMarketplaceAlerts() {
  return marketplaceDealsRepository.listAlerts();
}

export async function markMarketplaceAlertsRead(alertIds: string[]) {
  return marketplaceDealsRepository.markAlertsRead(alertIds);
}
