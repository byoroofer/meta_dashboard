import type { Route } from "next";
import Link from "next/link";
import { CircleDollarSign, Globe, Route as RouteIcon, UserRound, UserRoundSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { Lead, LeadActivity, LeadDestination } from "@/types/domain";

const stages = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "nurturing", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
] as const;

export function LeadsWorkspace({
  leads,
  selectedLead,
  activities,
  leadDestinations,
  scopeQuery
}: {
  leads: Lead[];
  selectedLead: Lead | null;
  activities: LeadActivity[];
  leadDestinations: LeadDestination[];
  scopeQuery?: string;
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
            {leads.length ? (
              <div className="grid gap-4 2xl:grid-cols-5">
                {stages.map((stage) => {
                  const stageLeads = leads.filter((lead) => lead.status === stage.key);

                  return (
                    <div key={stage.key} className="rounded-2xl border border-[var(--border)] bg-slate-50/70 p-3">
                      <div className="flex items-center justify-between gap-3 px-1 pb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                          <p className="text-xs text-[var(--muted)]">{stageLeads.length} leads</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {stageLeads.length ? (
                          stageLeads.map((lead) => (
                            <Link
                              key={lead.id}
                              href={(scopeQuery ? `/leads/${lead.id}?${scopeQuery}` : `/leads/${lead.id}`) as Route}
                              className={`block rounded-2xl border bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card)] ${
                                selectedLead?.id === lead.id ? "border-[var(--accent)] bg-[var(--accent-subtle)]" : "border-[var(--border)]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{lead.fullName}</p>
                                  <p className="mt-1 text-xs text-[var(--muted)]">{lead.email || lead.phone}</p>
                                </div>
                                <StatusBadge value={lead.status} />
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-[var(--muted)]">
                                {lead.sourcePlatform ? (
                                  <span className="rounded-full border border-[var(--border)] bg-slate-50 px-2.5 py-1">
                                    {lead.sourcePlatform}
                                  </span>
                                ) : null}
                                {lead.sourceChannel ? (
                                  <span className="rounded-full border border-[var(--border)] bg-slate-50 px-2.5 py-1">
                                    {lead.sourceChannel}
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-4 space-y-2 text-xs text-[var(--muted)]">
                                <p className="truncate font-medium text-slate-700">{lead.campaignName || "Unattributed campaign"}</p>
                                <p className="truncate">{lead.adsetName || "No ad set linked"}</p>
                                <div className="flex items-center justify-between gap-2 pt-1">
                                  <span>{lead.owner}</span>
                                  <span>{formatDateTime(lead.createdAt)}</span>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/80 px-4 py-8 text-center text-sm text-[var(--muted)]">
                            No leads in {stage.label.toLowerCase()}.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={UserRound}
                title="No leads available"
                description="Lead cards will populate here once Meta lead permissions are enabled and synced data reaches the pipeline."
              />
            )}
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
                    { label: "Ad set", value: selectedLead.adsetName, icon: RouteIcon },
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
              <EmptyState icon={UserRound} title="No lead selected" description="Choose a lead to inspect attribution, ownership, and website delivery targets." />
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}
