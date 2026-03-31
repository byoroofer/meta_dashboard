import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export default async function SettingsPage() {
  const auditLogs = await dashboardRepository.getAuditLogs();
  return <SettingsWorkspace section="general" auditLogs={auditLogs} />;
}
