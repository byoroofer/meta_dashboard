import Link from "next/link";
import { Bot, MessageSquare, MessageSquareReply, Paperclip, Send, UserPlus } from "lucide-react";

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
import type { AutoResponderRule, Conversation, ConversationNote, Message } from "@/types/domain";

export function InboxWorkspace({
  conversations,
  selectedConversation,
  threadMessages,
  notes,
  autoResponderRules,
  scopeQuery
}: {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  threadMessages: Message[];
  notes: ConversationNote[];
  autoResponderRules: AutoResponderRule[];
  scopeQuery?: string;
}) {
  const activeRules = autoResponderRules.filter((rule) => rule.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Unified inbox"
        title="Inbox"
        description="Shared Facebook Page and Instagram professional inbox with assignment, automation, and archive visibility in one Business Center-style workspace."
        actions={
          <>
            <Button variant="secondary" className="bg-slate-50">
              <Bot className="mr-2 h-4 w-4 text-[var(--accent)]" />
              Auto responders
            </Button>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Assign rules
            </Button>
          </>
        }
      />

      <FilterBar searchPlaceholder="Search threads, contacts, tags, and message text" filters={["Open", "Unread", "Assigned", "Instagram"]} />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.25fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conversation queue</CardTitle>
            <CardDescription>Recent business conversations sorted by latest activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Contact", "Platform", "Status", "Assigned", "Last activity"]}
              rows={conversations.map((item) => [
                <Link
                  key={item.id}
                  href={scopeQuery ? `/inbox/${item.id}?${scopeQuery}` : `/inbox/${item.id}`}
                  className="font-medium text-slate-900 hover:text-[var(--accent-strong)]"
                >
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

        <Card>
          {selectedConversation ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{selectedConversation.subject}</CardTitle>
                    <CardDescription className="mt-2">
                      {selectedConversation.contactName} - {selectedConversation.platform} - assigned to {selectedConversation.assignedTo}
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
                      className={`rounded-xl border p-4 ${
                        message.direction === "outbound"
                          ? "ml-8 border-blue-200 bg-blue-50"
                          : "mr-8 border-[var(--border)] bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{message.senderLabel}</p>
                        <p className="text-xs text-[var(--muted)]">{formatDateTime(message.sentAt)}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{message.body}</p>
                      {message.attachments.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
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
                  <Textarea placeholder="Queue an outbound reply. Live delivery stays server-side and disabled until Meta credentials are connected." />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-[var(--muted)]">Outbound replies remain state-tracked and archived instead of being destructively overwritten.</p>
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
              <EmptyState icon={MessageSquare} title="No conversation selected" description="Choose a thread to review message history, attachments, auto-response posture, and internal notes." />
            </CardContent>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[var(--accent)]" />
                Auto responders
              </CardTitle>
              <CardDescription>Rule coverage for supported Page and professional account messaging only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rule.name}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{rule.summary}</p>
                    </div>
                    <StatusBadge value={rule.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1">{rule.trigger.replaceAll("_", " ")}</span>
                    <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1">{rule.responseWindowLabel}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareReply className="h-5 w-5 text-[var(--accent)]" />
                Internal notes
              </CardTitle>
              <CardDescription>Operator-only annotations for assignment context and compliance-safe commentary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length ? (
                notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{note.author}</p>
                      <p className="text-xs text-[var(--muted)]">{formatDateTime(note.createdAt)}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{note.body}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No notes yet" description="Use notes for handoff context, escalation details, and operational reminders." />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
