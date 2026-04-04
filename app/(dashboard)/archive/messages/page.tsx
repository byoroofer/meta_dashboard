import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { ArchiveWorkspace } from "@/components/archive/archive-workspace";
import { getArchiveData } from "@/lib/services/archive-service";

export default async function ArchiveMessagesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getArchiveData(scope);
  return <ArchiveWorkspace mode="messages" {...data} />;
}
