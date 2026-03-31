import { ArchiveWorkspace } from "@/components/archive/archive-workspace";
import { getArchiveData } from "@/lib/services/archive-service";

export default async function ArchivePage() {
  const data = await getArchiveData();
  return <ArchiveWorkspace mode="overview" {...data} />;
}
