import Link from "next/link";
import { CircleDollarSign, FileDigit, UserRoundSearch } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { Lead, LeadActivity } from "@/types/domain";

export function LeadsWorkspace({
  leads,
  selectedLead,
  activities
}: {
  leads: Lead[];
  selectedLead: Lead | null;
  activities: LeadActivity[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lead operations"
        title="Leads"
        description="Normalized lead form submissions mapped to campaigns, ad sets, ads, contacts, and pipeline ownership."
      />
      <FilterBar searchPlaceholder="Search leads, forms, campaigns, owners" filters={["New", "Qualified", "Owned", "Campaign"]} />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Lead pipeline</CardTitle>
            <CardDescription>Captured lead records ready for assignment, qualification, and downstream CRM work.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Lead", "Status", "Campaign", "Owner", "Created"]}
              rows={leads.map((lead) => [
                <Link key={lead.id} href={`/leads/${lead.id}`} className="font-medium text-white hover:text-[var(--accent)]">
                  {lead.fullName}
                </Link>,
                <StatusBadge key={`${lead.id}-status`} value={lead.status} />,
                lead.campaignName,
                lead.owner,
                formatDateTime(lead.createdAt)
              ])}
            />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          {selectedLead ? (
            <>
              <CardHeader>
                <CardTitle className="text-white">{selectedLead.fullName}</CardTitle>
                <CardDescription>{selectedLead.email} · {selectedLead.phone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { label: "Pipeline status", value: selectedLead.status, icon: UserRoundSearch },
                    { label: "Campaign", value: selectedLead.campaignName, icon: CircleDollarSign },
                    { label: "Ad set", value: selectedLead.adsetName, icon: FileDigit },
                    { label: "Assigned owner", value: selectedLead.owner, icon: UserRoundSearch }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <item.icon className="h-4 w-4 text-[var(--accent)]" />
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Activity history</h3>
                  {activities.length ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">{activity.type.replaceAll("_", " ")}</p>
                          <p className="text-xs text-[var(--muted)]">{formatDateTime(activity.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">{activity.summary}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--accent)]">{activity.actor}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No activities yet" description="Lead activities will capture notes, status changes, outreach attempts, and system enrichment events." />
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6">
              <EmptyState title="No lead selected" description="Choose a lead to inspect campaign attribution, ownership, and activity history." />
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}
