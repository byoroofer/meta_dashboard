import { demoMarketplaceListings } from "@/lib/marketplace/demo-data";
import { matchesMarketplaceCriteria, normalizeMarketplaceListing } from "@/lib/marketplace/normalization";
import { ebayBrowseSourceDefinition, fetchEbayBrowseListings } from "@/lib/marketplace/adapters/ebay-browse";
import { serpApiSourceDefinition, fetchSerpApiListings } from "@/lib/marketplace/adapters/serpapi";
import type { MarketplaceNormalizedListing, MarketplaceSearchCriteria, MarketplaceSourceDefinition } from "@/types/marketplace";

export interface MarketplaceSourceAdapter {
  definition: MarketplaceSourceDefinition;
  search(criteria: MarketplaceSearchCriteria): Promise<MarketplaceNormalizedListing[]>;
}

class DemoMarketplaceAdapter implements MarketplaceSourceAdapter {
  constructor(
    readonly definition: MarketplaceSourceDefinition,
    private readonly sourceKey: string
  ) {}

  async search(criteria: MarketplaceSearchCriteria) {
    const allowSource = !criteria.sourceKeys.length || criteria.sourceKeys.includes(this.sourceKey);

    if (!allowSource) {
      return [];
    }

    return demoMarketplaceListings
      .filter((listing) => listing.source === this.sourceKey)
      .map(normalizeMarketplaceListing)
      .filter((listing) => matchesMarketplaceCriteria(listing, criteria));
  }
}

const demoDefinitions: MarketplaceSourceDefinition[] = [
  {
    key: "marketplace_demo_feed",
    label: "Marketplace Demo Feed",
    mode: "demo",
    enabled: true,
    legalSummary: "Curated demo adapter for local development and UI verification. No live scraping.",
    rateLimitLabel: "local dataset"
  },
  {
    key: "community_classifieds_demo",
    label: "Community Classifieds Demo",
    mode: "demo",
    enabled: true,
    legalSummary: "Curated demo adapter that simulates a public classifieds source without live crawling.",
    rateLimitLabel: "local dataset"
  },
  {
    key: "estate_finds_demo",
    label: "Estate Finds Demo",
    mode: "demo",
    enabled: true,
    legalSummary: "Curated demo adapter for comparing across multiple source shapes while live safe sources are pending.",
    rateLimitLabel: "local dataset"
  }
];

export const marketplaceSourceDefinitions: MarketplaceSourceDefinition[] = [
  ...demoDefinitions,
  ebayBrowseSourceDefinition,
  serpApiSourceDefinition
];

export const marketplaceSourceAdapters: MarketplaceSourceAdapter[] = [
  ...demoDefinitions.map((definition) => new DemoMarketplaceAdapter(definition, definition.key)),
  { definition: ebayBrowseSourceDefinition, search: fetchEbayBrowseListings },
  { definition: serpApiSourceDefinition, search: fetchSerpApiListings }
];
