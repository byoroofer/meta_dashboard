import Link from "next/link";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { Contact, Conversation, Lead } from "@/types/domain";

export function ContactsWorkspace({
  contacts,
  selectedContact,
  linkedConversations,
  linkedLeads
}: {
  contacts: Contact[];
  selectedContact: Contact | null;
  linkedConversations: Conversation[];
  linkedLeads: Lead[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM history"
        title="Contacts"
        description="Unified contact records linked across messaging, lead forms, notes, ownership, and pipeline stage."
      />
      <FilterBar searchPlaceholder="Search contacts, source, owner, tags" filters={["Qualified", "Proposal", "Won", "Tagged"]} />
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Contacts</CardTitle>
            <CardDescription>Normalized CRM contacts created from supported Meta business interactions and forms.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Name", "Stage", "Owner", "Source", "Last activity"]}
              rows={contacts.map((contact) => [
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="font-medium text-white hover:text-[var(--accent)]">
                  {contact.displayName}
                </Link>,
                <StatusBadge key={`${contact.id}-stage`} value={contact.stage} />,
                contact.owner,
                contact.source,
                formatDateTime(contact.lastActivityAt)
              ])}
            />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          {selectedContact ? (
            <>
              <CardHeader>
                <CardTitle className="text-white">{selectedContact.displayName}</CardTitle>
                <CardDescription>{selectedContact.primaryEmail} · {selectedContact.primaryPhone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Owner</p>
                    <p className="mt-2 text-sm font-medium text-white">{selectedContact.owner}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Source</p>
                    <p className="mt-2 text-sm font-medium text-white">{selectedContact.source}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Stage</p>
                    <div className="mt-2">
                      <StatusBadge value={selectedContact.stage} />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Linked conversations</h3>
                    {linkedConversations.length ? (
                      <div className="space-y-3">
                        {linkedConversations.map((conversation) => (
                          <div key={conversation.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm font-medium text-white">{conversation.subject}</p>
                            <p className="mt-2 text-sm text-[var(--muted)]">{conversation.preview}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No conversations" description="Messaging history will appear here when this contact is linked to a supported business thread." />
                    )}
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Linked leads</h3>
                    {linkedLeads.length ? (
                      <div className="space-y-3">
                        {linkedLeads.map((lead) => (
                          <div key={lead.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm font-medium text-white">{lead.campaignName}</p>
                            <p className="mt-2 text-sm text-[var(--muted)]">{lead.adName}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No leads" description="Lead form submissions associated with this contact will be surfaced here." />
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6">
              <EmptyState title="No contact selected" description="Choose a contact to inspect the merged CRM view across inbox, leads, and pipeline." />
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}
