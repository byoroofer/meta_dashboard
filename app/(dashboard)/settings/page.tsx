import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { getSettingsData } from "@/lib/services/settings-service";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getSettingsData(scope);
  return <SettingsWorkspace section="general" {...data} />;
}
