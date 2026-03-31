import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export default async function SettingsSecurityPage() {
  const auditLogs = await dashboardRepository.getAuditLogs();
  return <SettingsWorkspace section="security" auditLogs={auditLogs} />;
}
