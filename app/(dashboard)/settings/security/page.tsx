import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { getSettingsData } from "@/lib/services/settings-service";

export default async function SettingsSecurityPage() {
  const data = await getSettingsData();
  return <SettingsWorkspace section="security" {...data} />;
}
