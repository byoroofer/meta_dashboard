import { normalizeText, tokenize } from "@/lib/marketplace/normalization";
import type { MarketplaceComparableListing, MarketplaceNormalizedListing } from "@/types/marketplace";

function overlapScore(left: string[], right: string[]) {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  const overlap = left.filter((token) => rightSet.has(token)).length;
  return overlap / Math.max(left.length, right.length);
}

function conditionDistance(left: string, right: string) {
  const order = ["for_parts", "damaged", "fair", "good", "like_new", "new"];
  const leftIndex = order.indexOf(left);
  const rightIndex = order.indexOf(right);
  if (leftIndex === -1 || rightIndex === -1) return 0.5;
  return Math.abs(leftIndex - rightIndex) / (order.length - 1);
}

function compTypeForScore(score: number) {
  if (score >= 0.83) return "exact" as const;
  if (score >= 0.62) return "near" as const;
  return "category" as const;
}

export function buildComparableSet(target: MarketplaceNormalizedListing, candidates: MarketplaceNormalizedListing[]) {
  const targetTokens = tokenize(target.title);
  const seen = new Set<string>();

  const ranked = candidates
    .filter((candidate) => candidate.sourceListingId !== target.sourceListingId || candidate.source !== target.source)
    .map((candidate) => {
      const candidateTokens = tokenize(candidate.title);
      const reasons: string[] = [];
      let score = overlapScore(targetTokens, candidateTokens) * 0.35;

      if (target.inferredBrand && candidate.inferredBrand && target.inferredBrand === candidate.inferredBrand) {
        score += 0.2;
        reasons.push("same brand");
      }

      if (target.inferredModel && candidate.inferredModel && normalizeText(target.inferredModel) === normalizeText(candidate.inferredModel)) {
        score += 0.3;
        reasons.push("same model");
      }

      if (target.inferredCategory && candidate.inferredCategory && target.inferredCategory === candidate.inferredCategory) {
        score += 0.1;
        reasons.push("same category");
      }

      const conditionGap = conditionDistance(target.inferredCondition, candidate.inferredCondition);
      score += (1 - conditionGap) * 0.05;
      if (conditionGap < 0.25) reasons.push("similar condition");

      const priceRatio = target.price > 0 ? candidate.price / target.price : 1;
      if (priceRatio > 0.35 && priceRatio < 2.8) {
        score += 0.05;
      }

      return { candidate, similarityScore: Math.min(1, score), reasons };
    })
    .filter((item) => item.similarityScore >= 0.32)
    .sort((left, right) => right.similarityScore - left.similarityScore);

  const comps: MarketplaceComparableListing[] = [];

  for (const item of ranked) {
    if (seen.has(item.candidate.dedupeKey)) continue;
    seen.add(item.candidate.dedupeKey);
    comps.push({
      compType: compTypeForScore(item.similarityScore),
      compSource: item.candidate.source,
      compSourceListingId: item.candidate.sourceListingId,
      compTitle: item.candidate.title,
      compUrl: item.candidate.url,
      compPrice: item.candidate.price,
      compCurrency: item.candidate.currency,
      compCondition: item.candidate.conditionRaw,
      compLocation: item.candidate.location,
      similarityScore: Number(item.similarityScore.toFixed(4)),
      matchReasons: item.reasons,
      postedAt: item.candidate.postedAt,
      metadata: item.candidate.metadata
    });
    if (comps.length >= 8) break;
  }

  return comps;
}
