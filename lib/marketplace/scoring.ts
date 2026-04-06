import type {
  MarketplaceAIAnalysis,
  MarketplaceComparableListing,
  MarketplaceDealScoreBreakdown,
  MarketplaceNormalizedListing,
  MarketplaceRiskFlag,
  MarketplaceSearchCriteria
} from "@/types/marketplace";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function riskPenaltyForFlags(riskFlags: MarketplaceRiskFlag[]) {
  return riskFlags.reduce((total, flag) => total + (flag.severity === "high" ? 8 : flag.severity === "medium" ? 4 : 2), 0);
}

export function computeDealScoreBreakdown(input: {
  listing: MarketplaceNormalizedListing;
  analysis: Omit<MarketplaceAIAnalysis, "dealScore" | "scoreBreakdown">;
  comps: MarketplaceComparableListing[];
  criteria: MarketplaceSearchCriteria;
}): MarketplaceDealScoreBreakdown {
  const fairValueMid = Math.max(input.analysis.fairValueMid, 1);
  const discountRatio = clamp((fairValueMid - input.listing.price) / fairValueMid, -0.5, 0.7);
  const discountScore = clamp(discountRatio * 65, 0, 45);

  const compStrength = input.comps.length
    ? input.comps.reduce((sum, comp) => sum + comp.similarityScore, 0) / input.comps.length
    : 0.2;
  const compScore = clamp(compStrength * 20, 0, 20);

  const conditionScore = clamp(input.analysis.confidence * 10, 0, 10);

  const targetResaleValue = input.criteria.targetResaleValue ?? input.analysis.resaleValueMid;
  const targetMargin = input.criteria.requiredProfitMargin ?? 0;
  const actualMargin = targetResaleValue - input.listing.price;
  const marginScore = clamp(actualMargin <= 0 ? 0 : (actualMargin / Math.max(targetMargin || 1, targetResaleValue * 0.2)) * 15, 0, 15);

  const freshnessHours = input.listing.postedAt
    ? (Date.now() - new Date(input.listing.postedAt).getTime()) / (60 * 60 * 1000)
    : 999;
  const freshnessScore = clamp(10 - freshnessHours / 6, 0, 10);

  const riskPenalty = clamp(riskPenaltyForFlags(input.analysis.riskFlags), 0, 30);

  return {
    discountScore: Number(discountScore.toFixed(1)),
    compScore: Number(compScore.toFixed(1)),
    conditionScore: Number(conditionScore.toFixed(1)),
    marginScore: Number(marginScore.toFixed(1)),
    freshnessScore: Number(freshnessScore.toFixed(1)),
    riskPenalty: Number(riskPenalty.toFixed(1)),
    finalScore: Math.round(clamp(discountScore + compScore + conditionScore + marginScore + freshnessScore - riskPenalty, 0, 100))
  };
}
