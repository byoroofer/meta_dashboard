import { marketplaceSourceAdapters, marketplaceSourceDefinitions } from "@/lib/marketplace/adapters";
import { analyzeMarketplaceListing } from "@/lib/marketplace/ai";
import { buildComparableSet } from "@/lib/marketplace/comparison";
import { buildMarketplaceResultsCsv } from "@/lib/marketplace/csv";
import { createCriteriaLabel } from "@/lib/marketplace/normalization";
import { marketplaceDealsRepository } from "@/lib/repositories/marketplace-deals-repository";
import type {
  MarketplaceDashboardData,
  MarketplaceListingDetail,
  MarketplaceListingStatusUpdateInput,
  MarketplaceSavedSearchCreateInput,
  MarketplaceScanRequest,
  MarketplaceSearchCriteria
} from "@/types/marketplace";

const EMPTY_CRITERIA: MarketplaceSearchCriteria = {
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

export async function getMarketplaceDealsPageData(listingId?: string): Promise<MarketplaceDashboardData> {
  const [savedSearches, scanHistory] = await Promise.all([
    marketplaceDealsRepository.listSavedSearches(),
    marketplaceDealsRepository.listScanHistory()
  ]);

  const activeScanId = scanHistory[0]?.id ?? null;
  const results = await marketplaceDealsRepository.getScanResults(activeScanId);

  let selectedListing: MarketplaceListingDetail | null = null;

  if (listingId) {
    selectedListing = await marketplaceDealsRepository.getListingDetail(listingId);
  } else if (results[0]) {
    selectedListing = await marketplaceDealsRepository.getListingDetail(results[0].listingId);
  }

  return {
    savedSearches,
    scanHistory,
    activeScanId,
    results,
    selectedListing,
    sources: marketplaceSourceDefinitions,
    limitations: [
      "Live marketplace crawling is intentionally disabled by default. The current adapters are curated demo feeds until source-specific API or robots-safe ingestion is approved.",
      "OpenAI does not provide live market prices by memory. Fair-value estimates are derived from fetched comparables plus structured model reasoning.",
      "Saved-search scheduling fields are persisted now, but no background cron runner is wired in this pass."
    ]
  };
}

export async function createMarketplaceSavedSearch(input: MarketplaceSavedSearchCreateInput) {
  return marketplaceDealsRepository.createSavedSearch(input);
}

export async function runMarketplaceScan(request: MarketplaceScanRequest) {
  const savedSearch = request.savedSearchId
    ? await marketplaceDealsRepository.getSavedSearchById(request.savedSearchId)
    : null;

  const criteria = request.criteria ?? savedSearch?.criteria ?? EMPTY_CRITERIA;
  const queryLabel = createCriteriaLabel(criteria);
  const scan = await marketplaceDealsRepository.createScanRun({
    savedSearchId: savedSearch?.id,
    queryLabel,
    criteriaSnapshot: criteria,
    sourceCount: marketplaceSourceAdapters.length
  });

  const touchedAt = new Date().toISOString();
  await marketplaceDealsRepository.touchSavedSearch(savedSearch?.id, touchedAt);

  const listings = [];
  let errorCount = 0;

  for (const adapter of marketplaceSourceAdapters) {
    try {
      const adapterListings = await adapter.search(criteria);
      listings.push(...adapterListings);
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

    if (analysis.dealScore >= (savedSearch?.alertThresholdScore ?? 82)) {
      dealCount += 1;
    }
  }

  await marketplaceDealsRepository.finalizeScanRun(scan.id, {
    status: "succeeded",
    completedAt: new Date().toISOString(),
    listingCount: listings.length,
    dealCount,
    sourceCount: marketplaceSourceAdapters.length,
    errorCount,
    queryLabel,
    summary: listings.length
      ? `${dealCount} high-scoring deals from ${listings.length} matched listings.`
      : "No listings matched the current criteria."
  });

  const results = await marketplaceDealsRepository.getScanResults(scan.id);

  return {
    scanId: scan.id,
    scan: {
      ...scan,
      status: "succeeded" as const,
      completedAt: new Date().toISOString(),
      listingCount: listings.length,
      dealCount,
      sourceCount: marketplaceSourceAdapters.length,
      errorCount,
      summary: listings.length
        ? `${dealCount} high-scoring deals from ${listings.length} matched listings.`
        : "No listings matched the current criteria."
    },
    results
  };
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
