import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ListingDetailPanel } from "@/components/marketplace/listing-detail-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getMarketplaceListingDetail } from "@/lib/services/marketplace-deals-service";

export const dynamic = "force-dynamic";

export default async function MarketplaceDealsListingPage({
  params
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const detail = await getMarketplaceListingDetail(listingId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace intelligence"
        title="Listing Detail"
        description="Full reasoning, comparable listings, operator notes, and score breakdown for a single candidate."
        actions={
          <Link href={"/marketplace-deals" as Route} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-slate-800">
            <ArrowLeft className="h-4 w-4" />
            Back to deals
          </Link>
        }
      />

      {detail ? (
        <ListingDetailPanel detail={detail} compact />
      ) : (
        <EmptyState title="Listing not found" description="The requested listing either has not been scanned yet or is no longer available in the stored result set." />
      )}
    </div>
  );
}
