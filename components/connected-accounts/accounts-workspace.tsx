import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog, ConnectedAsset, ConnectedBusiness } from "@/types/domain";

export function AccountsWorkspace({
  businesses,
  assets,
  recentAudit
}: {
  businesses: ConnectedBusiness[];
  assets: ConnectedAsset[];
  recentAudit: AuditLog[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business connectivity"
        title="Connected Accounts"
        description="Supported Meta business assets, granted scopes, sync health, token lifecycle visibility, and webhook status."
      />
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Connected businesses</CardTitle>
            <CardDescription>Business-level connection state for the assets this dashboard can operate on.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Business", "Status", "Sync", "Webhook", "Scopes", "Last sync"]}
              rows={businesses.map((business) => [
                business.name,
                <StatusBadge key={`${business.id}-status`} value={business.status} />,
                <StatusBadge key={`${business.id}-sync`} value={business.syncStatus} />,
                <StatusBadge key={`${business.id}-webhook`} value={business.webhookHealth} />,
                `${business.grantedScopes.length} scopes`,
                formatDateTime(business.lastSyncedAt)
              ])}
            />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Asset inventory</CardTitle>
            <CardDescription>Pages, Instagram professional accounts, ad accounts, and lead forms only.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Asset", "Type", "Status", "Sync", "Webhook", "Rotated"]}
              rows={assets.map((asset) => [
                asset.name,
                asset.type.replaceAll("_", " "),
                <StatusBadge key={`${asset.id}-status`} value={asset.status} />,
                <StatusBadge key={`${asset.id}-sync`} value={asset.syncStatus} />,
                <StatusBadge key={`${asset.id}-webhook`} value={asset.webhookHealth} />,
                formatDateTime(asset.tokenLastRotatedAt)
              ])}
            />
          </CardContent>
        </Card>
      </section>
      <Card className="border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white">Recent account audit</CardTitle>
          <CardDescription>Security-sensitive account lifecycle actions and automated archive tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={["Action", "Target", "Actor", "Outcome", "Occurred", "Detail"]}
            rows={recentAudit.map((entry) => [
              entry.action,
              `${entry.targetType}:${entry.targetId}`,
              entry.actor,
              <StatusBadge key={`${entry.id}-outcome`} value={entry.outcome} />,
              formatDateTime(entry.occurredAt),
              entry.detail
            ])}
          />
        </CardContent>
      </Card>
    </div>
  );
}
