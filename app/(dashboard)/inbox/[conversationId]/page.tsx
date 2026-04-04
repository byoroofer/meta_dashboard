import { notFound } from "next/navigation";

import { InboxWorkspace } from "@/components/inbox/inbox-workspace";
import { resolveDashboardScope, scopeToQueryString } from "@/lib/dashboard/scope";
import { getInboxData } from "@/lib/services/inbox-service";

export default async function ConversationPage({
  params,
  searchParams
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { conversationId } = await params;
  const scope = await resolveDashboardScope(searchParams);
  const data = await getInboxData(scope, conversationId);

  if (!data.selectedConversation) {
    notFound();
  }

  return <InboxWorkspace {...data} scopeQuery={scopeToQueryString(scope)} />;
}
