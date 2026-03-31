import Link from "next/link";
import { MessageSquareReply, Paperclip, Send, UserPlus } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import type { Conversation, ConversationNote, Message } from "@/types/domain";

export function InboxWorkspace({
  conversations,
  selectedConversation,
  threadMessages,
  notes
}: {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  threadMessages: Message[];
  notes: ConversationNote[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer messaging"
        title="Inbox"
        description="Unified operational inbox for Facebook Page messages and Instagram professional account DMs, with routing, notes, and archive visibility."
        actions={
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Assign rules
          </Button>
        }
      />

      <FilterBar searchPlaceholder="Search threads, contacts, tags, message text" filters={["Open", "Unread", "Assigned", "Tagged"]} />

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.25fr_0.8fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Conversation queue</CardTitle>
            <CardDescription>Latest business conversations sorted by last message activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Contact", "Platform", "Status", "Assigned", "Last activity"]}
              rows={conversations.map((item) => [
                <Link key={item.id} href={`/inbox/${item.id}`} className="font-medium text-white hover:text-[var(--accent)]">
                  {item.contactName}
                </Link>,
                item.platform,
                <StatusBadge key={`${item.id}-status`} value={item.status} />,
                item.assignedTo,
                formatDateTime(item.lastMessageAt)
              ])}
            />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20">
          {selectedConversation ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">{selectedConversation.subject}</CardTitle>
                    <CardDescription className="mt-2">
                      {selectedConversation.contactName} · {selectedConversation.platform} · assigned to {selectedConversation.assignedTo}
                    </CardDescription>
                  </div>
                  <StatusBadge value={selectedConversation.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {threadMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl border p-4 ${
                        message.direction === "outbound"
                          ? "ml-6 border-[var(--accent)]/20 bg-[var(--accent)]/10"
                          : "mr-6 border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white">{message.senderLabel}</p>
                        <p className="text-xs text-[var(--muted)]">{formatDateTime(message.sentAt)}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--text)]">{message.body}</p>
                      {message.attachments.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
                              <Paperclip className="h-3.5 w-3.5" />
                              {attachment.fileName}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-3">
                  <Textarea placeholder="Outbound reply placeholder. Live send action remains server-side and disabled until Meta credentials are connected." />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-[var(--muted)]">Outgoing messages will be archived and state-tracked, not overwritten.</p>
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Queue send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6">
              <EmptyState title="No conversation selected" description="Choose a thread to review message history, attachments, internal notes, and archive state." />
            </CardContent>
          )}
        </Card>

        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquareReply className="h-5 w-5 text-[var(--accent-strong)]" />
              Internal notes
            </CardTitle>
            <CardDescription>Non-customer-visible operational annotations for the selected conversation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.length ? (
              notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{note.author}</p>
                    <p className="text-xs text-[var(--muted)]">{formatDateTime(note.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{note.body}</p>
                </div>
              ))
            ) : (
              <EmptyState title="No notes yet" description="Use notes for assignment context, escalation detail, and compliance-safe internal commentary." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
