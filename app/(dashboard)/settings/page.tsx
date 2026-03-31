import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { getSettingsData } from "@/lib/services/settings-service";

export default async function SettingsPage() {
  const data = await getSettingsData();
  return <SettingsWorkspace section="general" {...data} />;
}
