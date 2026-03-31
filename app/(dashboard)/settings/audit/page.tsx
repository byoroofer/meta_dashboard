import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";

export default async function SettingsAuditPage() {
  const auditLogs = await dashboardRepository.getAuditLogs();
  return <SettingsWorkspace section="audit" auditLogs={auditLogs} />;
}
