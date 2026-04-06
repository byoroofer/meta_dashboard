export type MarketplaceSourceMode = "demo" | "public_api" | "scrape_safe" | "disabled";

export type MarketplaceListingCondition =
  | "new"
  | "like_new"
  | "good"
  | "fair"
  | "damaged"
  | "for_parts"
  | "unknown";

export type MarketplaceOperatorStatus = "new" | "watched" | "ignored" | "contacted" | "purchased";

export type MarketplaceRiskSeverity = "low" | "medium" | "high";

export interface MarketplaceSearchCriteria {
  category: string;
  keywords: string[];
  mustIncludeWords: string[];
  brand: string;
  model: string;
  condition: string;
  priceFloor: number | null;
  priceCeiling: number | null;
  location: string;
  radiusMiles: number | null;
  excludedWords: string[];
  targetResaleValue: number | null;
  requiredProfitMargin: number | null;
  sourceKeys: string[];
  postedWithinHours: number | null;
}

export interface MarketplaceSavedSearch {
  id: string;
  name: string;
  description: string | null;
  criteria: MarketplaceSearchCriteria;
  scheduleEnabled: boolean;
  scheduleLabel: string | null;
  alertThresholdScore: number;
  lastScannedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceSourceDefinition {
  key: string;
  label: string;
  mode: MarketplaceSourceMode;
  enabled: boolean;
  legalSummary: string;
  rateLimitLabel: string;
}

export interface MarketplaceSourceListing {
  source: string;
  sourceListingId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  url: string;
  imageUrls: string[];
  postedAt: string | null;
  sellerName: string | null;
  conditionRaw: string | null;
  metadata: Record<string, unknown>;
}

export interface MarketplaceNormalizedListing extends MarketplaceSourceListing {
  dedupeKey: string;
  normalizedTitle: string;
  inferredBrand: string | null;
  inferredModel: string | null;
  inferredCategory: string | null;
  inferredCondition: MarketplaceListingCondition;
  searchableText: string;
}

export interface MarketplaceRiskFlag {
  code: string;
  label: string;
  severity: MarketplaceRiskSeverity;
}

export interface MarketplaceComparableListing {
  compType: "exact" | "near" | "category";
  compSource: string;
  compSourceListingId: string;
  compTitle: string;
  compUrl: string;
  compPrice: number;
  compCurrency: string;
  compCondition: string | null;
  compLocation: string;
  similarityScore: number;
  matchReasons: string[];
  postedAt: string | null;
  metadata: Record<string, unknown>;
}

export interface MarketplaceDealScoreBreakdown {
  discountScore: number;
  compScore: number;
  conditionScore: number;
  marginScore: number;
  freshnessScore: number;
  riskPenalty: number;
  finalScore: number;
}

export interface MarketplaceAIAnalysis {
  normalizedTitle: string;
  inferredBrand: string | null;
  inferredModel: string | null;
  inferredCategory: string | null;
  inferredCondition: MarketplaceListingCondition;
  confidence: number;
  fairValueLow: number;
  fairValueMid: number;
  fairValueHigh: number;
  resaleValueLow: number;
  resaleValueMid: number;
  resaleValueHigh: number;
  bestUseCase: string;
  resalePotential: string;
  riskFlags: MarketplaceRiskFlag[];
  reasoning: string;
  suggestedCompKeywords: string[];
  parsedAttributes: Record<string, unknown>;
  priceDeltaAmount: number;
  priceDeltaPercent: number;
  dealScore: number;
  scoreBreakdown: MarketplaceDealScoreBreakdown;
  analysisModel: string;
  analysisVersion: string;
  rawResponse: Record<string, unknown>;
}

export interface MarketplaceListingStatusRecord {
  listingId: string;
  operatorStatus: MarketplaceOperatorStatus;
  manualNotes: string;
  updatedAt: string;
}

export interface MarketplaceScanSummary {
  id: string;
  savedSearchId: string | null;
  status: "queued" | "running" | "succeeded" | "failed";
  startedAt: string;
  completedAt: string | null;
  listingCount: number;
  dealCount: number;
  sourceCount: number;
  errorCount: number;
  queryLabel: string;
  summary: string;
  criteriaSnapshot: MarketplaceSearchCriteria;
}

export interface MarketplaceScanResult {
  scanResultId: string;
  scanId: string;
  listingId: string;
  source: string;
  sourceListingId: string;
  title: string;
  description: string;
  listedPrice: number;
  currency: string;
  location: string;
  url: string;
  imageUrls: string[];
  postedAt: string | null;
  sellerName: string | null;
  conditionRaw: string | null;
  sourceMetadata: Record<string, unknown>;
  duplicateCount: number;
  operatorStatus: MarketplaceOperatorStatus;
  manualNotes: string;
  analysis: MarketplaceAIAnalysis;
  comps: MarketplaceComparableListing[];
}

export interface MarketplaceListingDetail {
  result: MarketplaceScanResult;
  recentScans: MarketplaceScanSummary[];
}

export interface MarketplaceDashboardData {
  savedSearches: MarketplaceSavedSearch[];
  scanHistory: MarketplaceScanSummary[];
  activeScanId: string | null;
  results: MarketplaceScanResult[];
  selectedListing: MarketplaceListingDetail | null;
  sources: MarketplaceSourceDefinition[];
  limitations: string[];
}

export interface MarketplaceScanRequest {
  savedSearchId?: string;
  criteria?: MarketplaceSearchCriteria;
}

export interface MarketplaceSavedSearchCreateInput {
  name: string;
  description?: string | null;
  criteria: MarketplaceSearchCriteria;
  scheduleEnabled?: boolean;
  scheduleLabel?: string | null;
  alertThresholdScore?: number;
}

export interface MarketplaceListingStatusUpdateInput {
  operatorStatus: MarketplaceOperatorStatus;
  manualNotes?: string;
}
