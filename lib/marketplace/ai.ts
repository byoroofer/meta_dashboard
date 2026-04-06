import "server-only";

import { env } from "@/lib/config/env";
import { marketplaceAIResponseSchema } from "@/lib/marketplace/schemas";
import { computeDealScoreBreakdown } from "@/lib/marketplace/scoring";
import type {
  MarketplaceAIAnalysis,
  MarketplaceComparableListing,
  MarketplaceNormalizedListing,
  MarketplaceRiskFlag,
  MarketplaceSearchCriteria
} from "@/types/marketplace";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function extractRiskFlags(listing: MarketplaceNormalizedListing, comps: MarketplaceComparableListing[], fairValueMid: number) {
  const flags: MarketplaceRiskFlag[] = [];

  if (!listing.inferredModel) flags.push({ code: "missing_model", label: "Missing model number", severity: "medium" });
  if (listing.description.trim().length < 45) flags.push({ code: "poor_description", label: "Sparse description", severity: "medium" });
  if (listing.inferredCondition === "damaged" || listing.inferredCondition === "for_parts") {
    flags.push({ code: "damaged_condition", label: "Damaged or repair-grade condition", severity: "high" });
  }
  if (Boolean(listing.metadata.stockPhotoOnly)) {
    flags.push({ code: "stock_photo_only", label: "Stock photo only", severity: "medium" });
  }
  if (fairValueMid > 0 && listing.price < fairValueMid * 0.55) {
    flags.push({ code: "suspiciously_low_price", label: "Suspiciously low price", severity: "high" });
  }
  if (comps.some((comp) => comp.similarityScore >= 0.95)) {
    flags.push({ code: "duplicate_listing", label: "Duplicate or reposted listing", severity: "low" });
  }
  if (comps.length > 2) {
    const compMedian = median(comps.map((comp) => comp.compPrice));
    if (compMedian > 0 && Math.abs(compMedian - listing.price) / compMedian > 0.45) {
      flags.push({ code: "outlier_vs_comps", label: "Outlier compared to comps", severity: "medium" });
    }
  }

  return flags;
}

function buildHeuristicAnalysis(listing: MarketplaceNormalizedListing, comps: MarketplaceComparableListing[], criteria: MarketplaceSearchCriteria): MarketplaceAIAnalysis {
  const compPrices = comps.map((comp) => comp.compPrice).filter((price) => price > 0);
  const baseValue = compPrices.length ? median(compPrices) : listing.price * 1.22;
  const conditionFactor =
    listing.inferredCondition === "new"
      ? 1.06
      : listing.inferredCondition === "like_new"
        ? 1.02
        : listing.inferredCondition === "good"
          ? 1
          : listing.inferredCondition === "fair"
            ? 0.9
            : listing.inferredCondition === "damaged"
              ? 0.7
              : listing.inferredCondition === "for_parts"
                ? 0.45
                : 0.95;

  const fairValueMid = Math.max(1, Math.round(baseValue * conditionFactor));
  const fairValueLow = Math.max(1, Math.round(fairValueMid * 0.88));
  const fairValueHigh = Math.max(fairValueLow, Math.round(fairValueMid * 1.12));
  const resaleMid = Math.max(fairValueMid, Math.round(fairValueMid * 1.08));
  const resaleLow = Math.round(resaleMid * 0.94);
  const resaleHigh = Math.round(resaleMid * 1.1);
  const riskFlags = extractRiskFlags(listing, comps, fairValueMid);
  const confidence = clamp((comps.length * 0.12 + (listing.inferredModel ? 0.2 : 0) + (listing.description.length > 60 ? 0.12 : 0.05)), 0.28, 0.93);

  const analysisWithoutScore = {
    normalizedTitle: listing.normalizedTitle,
    inferredBrand: listing.inferredBrand,
    inferredModel: listing.inferredModel,
    inferredCategory: listing.inferredCategory,
    inferredCondition: listing.inferredCondition,
    confidence: Number(confidence.toFixed(2)),
    fairValueLow,
    fairValueMid,
    fairValueHigh,
    resaleValueLow: resaleLow,
    resaleValueMid: resaleMid,
    resaleValueHigh: resaleHigh,
    bestUseCase: listing.inferredCategory ? `Best comped as a ${listing.inferredCategory} resale or operator pickup.` : "Best comped against similar listings in this niche.",
    resalePotential:
      resaleMid - listing.price > 120
        ? "Strong resale spread if the listing condition is accurate."
        : resaleMid - listing.price > 50
          ? "Moderate resale spread."
          : "Limited resale spread unless accessories or hidden specs increase value.",
    riskFlags,
    reasoning:
      comps.length > 0
        ? `This looks ${listing.price < fairValueMid ? "underpriced" : "fairly priced"} because ${listing.inferredBrand ?? "similar"} ${listing.inferredModel ?? listing.inferredCategory ?? "items"} in comparable condition are clustering around $${fairValueLow}-$${fairValueHigh}, while this listing is at $${listing.price}.`
        : "Comp depth is thin, so the estimate leans on title parsing, condition heuristics, and category-level pricing rather than strong exact matches.",
    suggestedCompKeywords: [listing.inferredBrand, listing.inferredModel, listing.inferredCategory].filter((value): value is string => Boolean(value)),
    parsedAttributes: {
      brand: listing.inferredBrand,
      model: listing.inferredModel,
      category: listing.inferredCategory,
      condition: listing.inferredCondition,
      includedAccessories: listing.metadata.includes ?? [],
      targetResaleValue: criteria.targetResaleValue
    },
    priceDeltaAmount: Math.round((fairValueMid - listing.price) * 100) / 100,
    priceDeltaPercent: Math.round((((fairValueMid - listing.price) / Math.max(fairValueMid, 1)) * 100) * 10) / 10,
    analysisModel: env.OPENAI_MODEL || "heuristic-fallback",
    analysisVersion: "marketplace-v1",
    rawResponse: {}
  };

  const breakdown = computeDealScoreBreakdown({ listing, analysis: analysisWithoutScore, comps, criteria });

  return {
    ...analysisWithoutScore,
    dealScore: breakdown.finalScore,
    scoreBreakdown: breakdown
  };
}

function extractTextFromResponsesPayload(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown[] }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: string }).text;
      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }
    }
  }

  return "";
}

async function requestOpenAIAnalysis(listing: MarketplaceNormalizedListing, comps: MarketplaceComparableListing[], criteria: MarketplaceSearchCriteria) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are a marketplace pricing analyst. Use only the provided listing and comparable listings. Never invent live prices. Return strict JSON only with keys: normalizedTitle, inferredBrand, inferredModel, inferredCategory, inferredCondition, confidence, fairValueLow, fairValueMid, fairValueHigh, resaleValueLow, resaleValueMid, resaleValueHigh, bestUseCase, resalePotential, riskFlags, reasoning, suggestedCompKeywords, parsedAttributes."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                criteria,
                listing,
                comparableListings: comps.map((comp) => ({
                  title: comp.compTitle,
                  price: comp.compPrice,
                  condition: comp.compCondition,
                  similarityScore: comp.similarityScore,
                  location: comp.compLocation,
                  source: comp.compSource,
                  matchReasons: comp.matchReasons
                }))
              })
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI pricing analysis failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const parsedText = extractTextFromResponsesPayload(payload);
  const parsedJson = JSON.parse(parsedText) as Record<string, unknown>;
  const validated = marketplaceAIResponseSchema.parse(parsedJson);

  return { validated, rawResponse: payload };
}

export async function analyzeMarketplaceListing(input: {
  listing: MarketplaceNormalizedListing;
  comps: MarketplaceComparableListing[];
  criteria: MarketplaceSearchCriteria;
}): Promise<MarketplaceAIAnalysis> {
  const heuristic = buildHeuristicAnalysis(input.listing, input.comps, input.criteria);

  if (!env.OPENAI_API_KEY) {
    return heuristic;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { validated, rawResponse } = await requestOpenAIAnalysis(input.listing, input.comps, input.criteria);
      const merged: Omit<MarketplaceAIAnalysis, "dealScore" | "scoreBreakdown"> = {
        ...validated,
        priceDeltaAmount: Math.round((validated.fairValueMid - input.listing.price) * 100) / 100,
        priceDeltaPercent: Math.round((((validated.fairValueMid - input.listing.price) / Math.max(validated.fairValueMid, 1)) * 100) * 10) / 10,
        analysisModel: env.OPENAI_MODEL || "gpt-5-mini",
        analysisVersion: "marketplace-v1",
        rawResponse
      };

      const breakdown = computeDealScoreBreakdown({
        listing: input.listing,
        analysis: merged,
        comps: input.comps,
        criteria: input.criteria
      });

      return {
        ...merged,
        dealScore: breakdown.finalScore,
        scoreBreakdown: breakdown
      };
    } catch {
      // retry or fall back
    }
  }

  return heuristic;
}
