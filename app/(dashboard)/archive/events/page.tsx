import { ArchiveWorkspace } from "@/components/archive/archive-workspace";
import { getArchiveData } from "@/lib/services/archive-service";

export default async function ArchiveEventsPage() {
  const data = await getArchiveData();
  return <ArchiveWorkspace mode="events" {...data} />;
}
