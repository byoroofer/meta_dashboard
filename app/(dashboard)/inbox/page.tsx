import { InboxWorkspace } from "@/components/inbox/inbox-workspace";
import { getInboxData } from "@/lib/services/inbox-service";

export default async function InboxPage() {
  const data = await getInboxData();
  return <InboxWorkspace {...data} />;
}
