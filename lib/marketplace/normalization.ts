import type { MarketplaceListingCondition, MarketplaceNormalizedListing, MarketplaceSearchCriteria, MarketplaceSourceListing } from "@/types/marketplace";

const CONDITION_SYNONYMS: Array<{ condition: MarketplaceListingCondition; patterns: RegExp[] }> = [
  { condition: "for_parts", patterns: [/for parts/i, /repair/i, /not working/i] },
  { condition: "damaged", patterns: [/damaged/i, /crack/i, /broken/i, /issue/i] },
  { condition: "new", patterns: [/brand new/i, /new in box/i, /\bnib\b/i, /^new$/i] },
  { condition: "like_new", patterns: [/like new/i, /excellent/i, /mint/i] },
  { condition: "good", patterns: [/good/i, /clean/i, /tested/i] },
  { condition: "fair", patterns: [/fair/i, /wear/i, /heavy cosmetic/i] }
];

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((part) => part.length > 1);
}

export function normalizeCondition(value: string | null | undefined): MarketplaceListingCondition {
  const raw = value?.trim() ?? "";

  for (const entry of CONDITION_SYNONYMS) {
    if (entry.patterns.some((pattern) => pattern.test(raw))) {
      return entry.condition;
    }
  }

  return "unknown";
}

function firstString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function inferBrand(listing: MarketplaceSourceListing) {
  const metaBrand = firstString(listing.metadata.brand);
  if (metaBrand) return metaBrand;

  const title = listing.title.toLowerCase();
  for (const brand of ["Milwaukee", "DeWalt", "Makita", "Sony", "Canon", "Apple"]) {
    if (title.includes(brand.toLowerCase())) return brand;
  }

  return null;
}

function inferModel(listing: MarketplaceSourceListing) {
  const metaModel = firstString(listing.metadata.model);
  if (metaModel) return metaModel;

  const match = listing.title.match(/\b([A-Za-z]{0,4}\d{2,6}(?:-\d{2})?)\b/);
  return match?.[1] ?? null;
}

function inferCategory(listing: MarketplaceSourceListing) {
  const metaCategory = firstString(listing.metadata.category);
  if (metaCategory) return metaCategory;

  const text = `${listing.title} ${listing.description}`.toLowerCase();
  if (text.includes("drill") || text.includes("impact")) return "power tools";
  if (text.includes("camera") || text.includes("lens")) return "cameras";
  if (text.includes("macbook") || text.includes("laptop")) return "laptops";
  return null;
}

function titleKey(value: string) {
  return tokenize(value)
    .filter((token) => !["with", "and", "the", "kit", "body", "only"].includes(token))
    .slice(0, 8)
    .join("-");
}

export function buildDedupeKey(listing: MarketplaceSourceListing) {
  const brand = inferBrand(listing)?.toLowerCase() ?? "unknown";
  const model = inferModel(listing)?.toLowerCase() ?? titleKey(listing.title);
  const category = inferCategory(listing)?.toLowerCase() ?? "misc";
  return `${category}:${brand}:${model}`;
}

export function normalizeMarketplaceListing(listing: MarketplaceSourceListing): MarketplaceNormalizedListing {
  const normalizedTitle = normalizeText(listing.title);

  return {
    ...listing,
    dedupeKey: buildDedupeKey(listing),
    normalizedTitle,
    inferredBrand: inferBrand(listing),
    inferredModel: inferModel(listing),
    inferredCategory: inferCategory(listing),
    inferredCondition: normalizeCondition(listing.conditionRaw),
    searchableText: normalizeText(
      [
        listing.title,
        listing.description,
        inferBrand(listing),
        inferModel(listing),
        inferCategory(listing),
        listing.location
      ]
        .filter(Boolean)
        .join(" ")
    )
  };
}

function includesAllTerms(haystack: string, terms: string[]) {
  return terms.every((term) => haystack.includes(normalizeText(term)));
}

function includesAnyTerm(haystack: string, terms: string[]) {
  return terms.some((term) => haystack.includes(normalizeText(term)));
}

function uniqueParts(parts: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function buildMarketplaceSearchQuery(criteria: MarketplaceSearchCriteria) {
  const parts = uniqueParts([
    criteria.query,
    criteria.brand,
    criteria.model,
    criteria.category,
    ...criteria.keywords
  ]);

  return parts.join(" ").trim();
}

export function matchesMarketplaceCriteria(listing: MarketplaceNormalizedListing, criteria: MarketplaceSearchCriteria) {
  const haystack = listing.searchableText;

  if (criteria.query && !haystack.includes(normalizeText(criteria.query))) return false;
  if (criteria.category && !haystack.includes(normalizeText(criteria.category))) return false;
  if (criteria.brand && listing.inferredBrand?.toLowerCase() !== criteria.brand.toLowerCase()) return false;
  if (criteria.model && !(listing.inferredModel ?? "").toLowerCase().includes(criteria.model.toLowerCase())) return false;
  if (criteria.condition && criteria.condition !== "any" && listing.inferredCondition !== criteria.condition) return false;
  if (criteria.priceFloor !== null && listing.price < criteria.priceFloor) return false;
  if (criteria.priceCeiling !== null && listing.price > criteria.priceCeiling) return false;
  if (criteria.location && !listing.location.toLowerCase().includes(criteria.location.toLowerCase())) return false;
  if (criteria.keywords.length && !includesAnyTerm(haystack, criteria.keywords)) return false;
  if (criteria.mustIncludeWords.length && !includesAllTerms(haystack, criteria.mustIncludeWords)) return false;
  if (criteria.excludedWords.length && includesAnyTerm(haystack, criteria.excludedWords)) return false;

  if (criteria.postedWithinHours !== null && listing.postedAt) {
    const ageHours = (Date.now() - new Date(listing.postedAt).getTime()) / (60 * 60 * 1000);
    if (ageHours > criteria.postedWithinHours) return false;
  }

  return true;
}

export function createCriteriaLabel(criteria: MarketplaceSearchCriteria) {
  const parts = [
    criteria.query,
    criteria.brand,
    criteria.model,
    criteria.category,
    criteria.keywords.length ? criteria.keywords.join(" ") : ""
  ].filter(Boolean);
  return parts.join(" - ") || "Custom marketplace scan";
}
