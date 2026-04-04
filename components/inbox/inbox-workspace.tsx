import type { Route } from "next";
import Link from "next/link";
import { Bot, MessageCircleMore, MessageSquare, MessageSquareReply, Paperclip, UserPlus } from "lucide-react";

import { ReplyComposer } from "@/components/inbox/reply-composer";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, initials } from "@/lib/utils";
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
  const selectedConversationId = selectedConversation?.id;

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
          <CardContent className="space-y-2">
            {conversations.length ? (
              conversations.map((item) => {
                const href = (scopeQuery ? `/inbox/${item.id}?${scopeQuery}` : `/inbox/${item.id}`) as Route;
                const isSelected = item.id === selectedConversationId;
                const PlatformIcon = item.platform === "instagram" ? MessageSquare : MessageCircleMore;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`block rounded-2xl border px-4 py-3 transition-all ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] shadow-[var(--shadow-soft)]"
                        : "border-transparent bg-slate-50/70 hover:border-[var(--border)] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-strong)]">
                        {initials(item.contactName)}
                        {item.unreadCount > 0 ? (
                          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--accent)]" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">{item.contactName}</p>
                              <PlatformIcon className="h-3.5 w-3.5 shrink-0 text-[var(--muted-soft)]" />
                            </div>
                            <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-[var(--muted-soft)]">{item.assignedTo}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-[var(--muted)]">{formatDateTime(item.lastMessageAt)}</p>
                            {item.unreadCount > 0 ? (
                              <p className="mt-1 text-xs font-semibold text-[var(--accent)]">{item.unreadCount} unread</p>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-2 truncate text-sm text-[var(--muted)]">{item.preview}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <StatusBadge value={item.status} />
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="New Page and Instagram threads will appear here once live messaging data is synced."
              />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-[var(--border)] bg-slate-50/70">
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
                <div className="space-y-4">
                  {threadMessages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.direction === "outbound" ? "justify-end" : "items-end"}`}>
                      {message.direction === "inbound" ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-xs font-semibold text-[var(--accent-strong)] shadow-[var(--shadow-soft)]">
                          {initials(message.senderLabel)}
                        </div>
                      ) : null}
                      <div
                        className={`max-w-[85%] rounded-2xl border px-4 py-3 md:max-w-[72%] ${
                          message.direction === "outbound"
                            ? "border-[var(--accent)]/20 bg-[var(--accent-soft)]"
                            : "border-[var(--border)] bg-slate-50"
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
                              <div
                                key={attachment.id}
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs text-[var(--muted)]"
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                {attachment.fileName}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <ReplyComposer />
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
