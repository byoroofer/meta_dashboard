import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import type { CommandExecution } from "@/types/domain";

export async function getPortalData() {
  const [targets, templates, executions] = await Promise.all([
    dashboardRepository.getIntegrationTargets(),
    dashboardRepository.getCommandTemplates(),
    dashboardRepository.getCommandExecutions()
  ]);

  return {
    targets,
    templates,
    executions
  };
}

export async function queuePortalCommand(input: {
  commandTemplateId: string;
  targetId: string;
  requestedBy: string;
}) {
  const [template, target] = await Promise.all([
    dashboardRepository.getCommandTemplateById(input.commandTemplateId),
    dashboardRepository.getIntegrationTargetById(input.targetId)
  ]);

  if (!template || !target) {
    return {
      success: false as const,
      execution: null,
      warning: "Template or target not found."
    };
  }

  const execution: CommandExecution = {
    id: `cmd_exec_${Date.now()}`,
    commandTemplateId: template.id,
    targetId: target.id,
    targetName: target.name,
    commandLabel: template.name,
    requestedBy: input.requestedBy,
    requestedAt: new Date().toISOString(),
    completedAt: null,
    status: "queued",
    resultSummary: "Portal command accepted and waiting for live transport integration."
  };

  return {
    success: true as const,
    execution,
    warning: "Command dispatch is scaffolded and ready for live integrations."
  };
}
