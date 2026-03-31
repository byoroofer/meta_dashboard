import Link from "next/link";
import { CircleDollarSign, Globe, Route, UserRoundSearch } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { Lead, LeadActivity, LeadDestination } from "@/types/domain";

export function LeadsWorkspace({
  leads,
  selectedLead,
  activities,
  leadDestinations
}: {
  leads: Lead[];
  selectedLead: Lead | null;
  activities: LeadActivity[];
  leadDestinations: LeadDestination[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lead operations"
        title="Leads"
        description="Meta-originated lead records can be normalized, qualified, and delivered into website intake paths without losing attribution or raw event traceability."
      />
      <FilterBar searchPlaceholder="Search leads, campaigns, owners, or websites" filters={["New", "Qualified", "Owned", "Delivered"]} />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead pipeline</CardTitle>
            <CardDescription>Captured lead records ready for assignment, qualification, and website delivery workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Lead", "Status", "Campaign", "Owner", "Created"]}
              rows={leads.map((lead) => [
                <Link key={lead.id} href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-[var(--accent-strong)]">
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
        <Card>
          {selectedLead ? (
            <>
              <CardHeader>
                <CardTitle>{selectedLead.fullName}</CardTitle>
                <CardDescription>{selectedLead.email} - {selectedLead.phone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { label: "Pipeline status", value: selectedLead.status, icon: UserRoundSearch },
                    { label: "Campaign", value: selectedLead.campaignName, icon: CircleDollarSign },
                    { label: "Ad set", value: selectedLead.adsetName, icon: Route },
                    { label: "Assigned owner", value: selectedLead.owner, icon: UserRoundSearch }
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                      <item.icon className="h-4 w-4 text-[var(--accent)]" />
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[var(--accent)]" />
                    <h3 className="text-sm font-semibold text-slate-900">Website delivery targets</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {leadDestinations.map((destination) => (
                      <div key={destination.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{destination.name}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">{destination.websiteLabel}</p>
                          </div>
                          <StatusBadge value={destination.status} />
                        </div>
                        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{destination.destinationUrl}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                          <span className="rounded-full border border-[var(--border)] bg-slate-50 px-2.5 py-1">{destination.destinationType.replaceAll("_", " ")}</span>
                          <span className="rounded-full border border-[var(--border)] bg-slate-50 px-2.5 py-1">{destination.retryPolicy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Activity history</h3>
                  {activities.length ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{activity.type.replaceAll("_", " ")}</p>
                          <p className="text-xs text-[var(--muted)]">{formatDateTime(activity.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">{activity.summary}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{activity.actor}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No activities yet" description="Lead activities will capture notes, status changes, outreach attempts, and website delivery events." />
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6">
              <EmptyState title="No lead selected" description="Choose a lead to inspect attribution, ownership, and website delivery targets." />
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}
