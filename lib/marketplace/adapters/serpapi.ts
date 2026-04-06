import "server-only";

import { env, hasSerpApiConfig } from "@/lib/config/env";
import { buildMarketplaceSearchQuery, matchesMarketplaceCriteria, normalizeMarketplaceListing } from "@/lib/marketplace/normalization";
import type { MarketplaceNormalizedListing, MarketplaceSearchCriteria, MarketplaceSourceDefinition } from "@/types/marketplace";

const SERP_API_ENDPOINT = "https://serpapi.com/search.json";

function parsePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function buildListing(result: Record<string, unknown>, criteria: MarketplaceSearchCriteria): MarketplaceNormalizedListing | null {
  const price = parsePrice(result.extracted_price ?? result.price);
  if (!price || price <= 0) return null;

  const link = typeof result.product_link === "string" ? result.product_link : typeof result.link === "string" ? result.link : "";
  if (!link) return null;

  const thumbnails = Array.isArray(result.thumbnails) ? (result.thumbnails as string[]) : [];
  const imageUrls = [
    ...(typeof result.thumbnail === "string" ? [result.thumbnail] : []),
    ...thumbnails
  ].filter(Boolean);

  const listing = {
    source: "serpapi_google_shopping",
    sourceListingId: String(result.product_id ?? result.offer_id ?? link),
    title: String(result.title ?? "Untitled listing"),
    description: String(result.snippet ?? ""),
    price,
    currency: "USD",
    location: criteria.location || "Online",
    url: link,
    imageUrls,
    postedAt: null,
    sellerName: typeof result.source === "string" ? result.source : null,
    conditionRaw: typeof result.second_hand_condition === "string" ? result.second_hand_condition : null,
    metadata: {
      rating: result.rating,
      reviews: result.reviews,
      source: result.source,
      offerId: result.offer_id,
      serpapiProductApi: result.serpapi_product_api
    }
  };

  return normalizeMarketplaceListing(listing);
}

export const serpApiSourceDefinition: MarketplaceSourceDefinition = {
  key: "serpapi_google_shopping",
  label: "Google Shopping via SerpApi",
  mode: "public_api",
  enabled: hasSerpApiConfig,
  legalSummary: "SerpApi Google Shopping API results. Uses SerpApi's licensed aggregation endpoint.",
  rateLimitLabel: "SerpApi quota"
};

export async function fetchSerpApiListings(criteria: MarketplaceSearchCriteria): Promise<MarketplaceNormalizedListing[]> {
  if (!hasSerpApiConfig) {
    return [];
  }

  const allowSource = !criteria.sourceKeys.length || criteria.sourceKeys.includes("serpapi_google_shopping");
  if (!allowSource) {
    return [];
  }

  const query = buildMarketplaceSearchQuery(criteria);
  if (!query) {
    return [];
  }

  const url = new URL(SERP_API_ENDPOINT);
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");
  url.searchParams.set("api_key", env.SERPAPI_API_KEY || "");
  url.searchParams.set("num", "20");

  if (criteria.location) {
    url.searchParams.set("location", criteria.location);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`SerpApi search failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as {
    shopping_results?: Array<Record<string, unknown>>;
    inline_shopping_results?: Array<Record<string, unknown>>;
  };

  const results = [
    ...(Array.isArray(payload.shopping_results) ? payload.shopping_results : []),
    ...(Array.isArray(payload.inline_shopping_results) ? payload.inline_shopping_results : [])
  ];

  return results
    .map((result) => buildListing(result, criteria))
    .filter((item): item is MarketplaceNormalizedListing => Boolean(item))
    .filter((item) => matchesMarketplaceCriteria(item, criteria));
}
