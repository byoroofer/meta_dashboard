import "server-only";

import { env, hasEbayBrowseConfig } from "@/lib/config/env";
import { buildMarketplaceSearchQuery, matchesMarketplaceCriteria, normalizeMarketplaceListing } from "@/lib/marketplace/normalization";
import type { MarketplaceNormalizedListing, MarketplaceSearchCriteria, MarketplaceSourceDefinition } from "@/types/marketplace";

const EBAY_OAUTH_ENDPOINT = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_ENDPOINT = "https://api.ebay.com/buy/browse/v1/item_summary/search";

const MARKETPLACE_ID = env.EBAY_MARKETPLACE_ID || "EBAY_US";
const ACCESS_SCOPE = "https://api.ebay.com/oauth/api_scope";

let cachedToken: { value: string; expiresAt: number } | null = null;

function buildEndUserContext(criteria: MarketplaceSearchCriteria) {
  const zipMatch = criteria.location.match(/\b\d{5}\b/);
  if (!zipMatch) return null;
  return `contextualLocation=country=US,zip=${zipMatch[0]}`;
}

async function getAccessToken() {
  if (!hasEbayBrowseConfig) {
    throw new Error("eBay Browse API is not configured.");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const credentials = Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials", scope: ACCESS_SCOPE });

  const response = await fetch(EBAY_OAUTH_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`eBay token request failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  const token = payload.access_token ?? "";
  if (!token) {
    throw new Error("eBay token response missing access_token.");
  }

  const expiresIn = payload.expires_in ?? 7200;
  cachedToken = { value: token, expiresAt: now + expiresIn * 1000 - 60_000 };
  return token;
}

function buildFilter(criteria: MarketplaceSearchCriteria) {
  const filters: string[] = [];

  if (criteria.priceCeiling !== null) {
    const min = criteria.priceFloor ?? 0;
    filters.push(`price:[${min}..${criteria.priceCeiling}]`);
    filters.push("priceCurrency:USD");
  }

  filters.push("deliveryCountry:US");

  return filters.join(",");
}

function buildLocationLabel(itemLocation?: { city?: string; stateOrProvince?: string; postalCode?: string; country?: string }) {
  if (!itemLocation) return "United States";
  const parts = [itemLocation.city, itemLocation.stateOrProvince, itemLocation.postalCode].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return itemLocation.country ?? "United States";
}

function buildImageUrls(item: Record<string, unknown>) {
  const images: string[] = [];
  const image = item.image as { imageUrl?: string } | undefined;
  if (image?.imageUrl) images.push(image.imageUrl);
  const additional = Array.isArray(item.additionalImages) ? (item.additionalImages as Array<{ imageUrl?: string }>) : [];
  for (const entry of additional) {
    if (entry?.imageUrl && !images.includes(entry.imageUrl)) {
      images.push(entry.imageUrl);
    }
  }
  return images;
}

function normalizeItem(item: Record<string, unknown>): MarketplaceNormalizedListing | null {
  const price = item.price as { value?: string; currency?: string } | undefined;
  const value = Number(price?.value ?? 0);
  if (!Number.isFinite(value) || value <= 0) return null;

  const itemLocation = item.itemLocation as {
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
    country?: string;
  } | null;

  const listing = {
    source: "ebay_browse_api",
    sourceListingId: String(item.itemId ?? ""),
    title: String(item.title ?? "Untitled eBay listing"),
    description: String(item.shortDescription ?? item.title ?? ""),
    price: value,
    currency: String(price?.currency ?? "USD"),
    location: buildLocationLabel(itemLocation ?? undefined),
    url: String(item.itemWebUrl ?? ""),
    imageUrls: buildImageUrls(item),
    postedAt: typeof item.itemCreationDate === "string" ? item.itemCreationDate : typeof item.itemStartDate === "string" ? item.itemStartDate : null,
    sellerName: typeof (item.seller as { username?: string } | undefined)?.username === "string" ? (item.seller as { username: string }).username : null,
    conditionRaw: typeof item.condition === "string" ? item.condition : null,
    metadata: {
      conditionId: item.conditionId,
      buyingOptions: item.buyingOptions,
      categories: item.categories,
      itemLocation,
      itemId: item.itemId
    }
  };

  if (!listing.sourceListingId || !listing.url) return null;
  return normalizeMarketplaceListing(listing);
}

export const ebayBrowseSourceDefinition: MarketplaceSourceDefinition = {
  key: "ebay_browse_api",
  label: "eBay Browse API",
  mode: "public_api",
  enabled: hasEbayBrowseConfig,
  legalSummary: "Official eBay Buy Browse API. Requires client credentials, respects eBay API terms and rate limits.",
  rateLimitLabel: "eBay API quota"
};

export async function fetchEbayBrowseListings(criteria: MarketplaceSearchCriteria): Promise<MarketplaceNormalizedListing[]> {
  if (!hasEbayBrowseConfig) {
    return [];
  }

  const allowSource = !criteria.sourceKeys.length || criteria.sourceKeys.includes("ebay_browse_api");
  if (!allowSource) {
    return [];
  }

  const query = buildMarketplaceSearchQuery(criteria);
  if (!query) {
    return [];
  }

  const token = await getAccessToken();
  const url = new URL(EBAY_BROWSE_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "40");

  const filter = buildFilter(criteria);
  if (filter) {
    url.searchParams.set("filter", filter);
  }

  if (criteria.postedWithinHours !== null) {
    url.searchParams.set("sort", "newlyListed");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE_ID
  };

  const endUserContext = buildEndUserContext(criteria);
  if (endUserContext) {
    headers["X-EBAY-C-ENDUSERCTX"] = endUserContext;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`eBay Browse search failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as { itemSummaries?: Array<Record<string, unknown>> };
  const items = Array.isArray(payload.itemSummaries) ? payload.itemSummaries : [];

  return items
    .map((item) => normalizeItem(item))
    .filter((item): item is MarketplaceNormalizedListing => Boolean(item))
    .filter((item) => matchesMarketplaceCriteria(item, criteria));
}
