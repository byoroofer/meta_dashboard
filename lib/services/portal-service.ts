import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import type { CommandExecution, CommandTemplate, IntegrationTarget } from "@/types/domain";

interface IntegrationTargetRow {
  id: string;
  target_name: string;
  target_type: IntegrationTarget["targetType"];
  status: IntegrationTarget["status"];
  connection_label: string | null;
  summary: string | null;
  capabilities: string[] | null;
  last_heartbeat_at: string | null;
}

interface CommandTemplateRow {
  id: string;
  template_name: string;
  target_type: CommandTemplate["targetType"];
  command_key: string;
  status: CommandTemplate["status"];
  summary: string | null;
  requires_approval: boolean;
  input_shape_label: string | null;
  updated_at: string | null;
  created_at: string | null;
}

interface CommandExecutionRow {
  id: string;
  command_template_id: string;
  integration_target_id: string;
  requested_by_label: string;
  status: CommandExecution["status"];
  result_summary: string | null;
  requested_at: string;
  completed_at: string | null;
}

function mapTarget(row: IntegrationTargetRow): IntegrationTarget {
  return {
    id: row.id,
    name: row.target_name,
    targetType: row.target_type,
    status: row.status,
    connectionLabel: row.connection_label ?? "unlabeled connection",
    summary: row.summary ?? "No summary provided.",
    capabilities: row.capabilities ?? [],
    lastHeartbeatAt: row.last_heartbeat_at ?? new Date().toISOString()
  };
}

function mapTemplate(row: CommandTemplateRow): CommandTemplate {
  return {
    id: row.id,
    name: row.template_name,
    targetType: row.target_type,
    commandKey: row.command_key,
    status: row.status,
    summary: row.summary ?? "No summary provided.",
    requiresApproval: row.requires_approval,
    inputShapeLabel: row.input_shape_label ?? "unspecified payload",
    lastUsedAt: row.updated_at ?? row.created_at ?? new Date().toISOString()
  };
}

function mapExecution(
  row: CommandExecutionRow,
  templates: Map<string, CommandTemplate>,
  targets: Map<string, IntegrationTarget>
): CommandExecution {
  const template = templates.get(row.command_template_id);
  const target = targets.get(row.integration_target_id);

  return {
    id: row.id,
    commandTemplateId: row.command_template_id,
    targetId: row.integration_target_id,
    targetName: target?.name ?? "Unknown target",
    commandLabel: template?.name ?? "Unknown command",
    requestedBy: row.requested_by_label,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    status: row.status,
    resultSummary: row.result_summary ?? "No result summary recorded."
  };
}

export async function getPortalData() {
  const client = getSupabaseAdminClient();

  if (!client) {
    const [targets, templates, executions] = await Promise.all([
      dashboardRepository.getIntegrationTargets(),
      dashboardRepository.getCommandTemplates(),
      dashboardRepository.getCommandExecutions()
    ]);

    return { targets, templates, executions };
  }

  try {
    const [targetsResult, templatesResult, executionsResult] = await Promise.all([
      client
        .from("integration_targets")
        .select("id,target_name,target_type,status,connection_label,summary,capabilities,last_heartbeat_at")
        .order("target_name"),
      client
        .from("command_templates")
        .select("id,template_name,target_type,command_key,status,summary,requires_approval,input_shape_label,updated_at,created_at")
        .order("template_name"),
      client
        .from("command_executions")
        .select("id,command_template_id,integration_target_id,requested_by_label,status,result_summary,requested_at,completed_at")
        .order("requested_at", { ascending: false })
        .limit(12)
    ]);

    if (targetsResult.error || templatesResult.error || executionsResult.error) {
      throw targetsResult.error ?? templatesResult.error ?? executionsResult.error;
    }

    const targets = (targetsResult.data ?? []).map((row) => mapTarget(row as IntegrationTargetRow));
    const templates = (templatesResult.data ?? []).map((row) => mapTemplate(row as CommandTemplateRow));

    if (targets.length || templates.length || (executionsResult.data ?? []).length) {
      const targetMap = new Map(targets.map((target) => [target.id, target]));
      const templateMap = new Map(templates.map((template) => [template.id, template]));
      const executions = (executionsResult.data ?? []).map((row) =>
        mapExecution(row as CommandExecutionRow, templateMap, targetMap)
      );

      return { targets, templates, executions };
    }
  } catch {
    // Fall through to mock data until live portal tables are populated.
  }

  const [targets, templates, executions] = await Promise.all([
    dashboardRepository.getIntegrationTargets(),
    dashboardRepository.getCommandTemplates(),
    dashboardRepository.getCommandExecutions()
  ]);

  return { targets, templates, executions };
}

export async function queuePortalCommand(input: {
  commandTemplateId: string;
  targetId: string;
  requestedBy: string;
}) {
  const client = getSupabaseAdminClient();

  if (client) {
    const [templateResult, targetResult] = await Promise.all([
      client
        .from("command_templates")
        .select("id,template_name,target_type,command_key,status,summary,requires_approval,input_shape_label,updated_at,created_at")
        .eq("id", input.commandTemplateId)
        .maybeSingle(),
      client
        .from("integration_targets")
        .select("id,target_name,target_type,status,connection_label,summary,capabilities,last_heartbeat_at")
        .eq("id", input.targetId)
        .maybeSingle()
    ]);

    if (templateResult.data && targetResult.data) {
      const inserted = await client
        .from("command_executions")
        .insert({
          command_template_id: templateResult.data.id,
          integration_target_id: targetResult.data.id,
          requested_by_label: input.requestedBy,
          status: "queued",
          result_summary: "Portal command queued and waiting for live transport integration.",
          input_payload: {}
        })
        .select("id,command_template_id,integration_target_id,requested_by_label,status,result_summary,requested_at,completed_at")
        .single();

      if (!inserted.error && inserted.data) {
        const template = mapTemplate(templateResult.data as CommandTemplateRow);
        const target = mapTarget(targetResult.data as IntegrationTargetRow);
        const execution = mapExecution(
          inserted.data as CommandExecutionRow,
          new Map([[template.id, template]]),
          new Map([[target.id, target]])
        );

        return {
          success: true as const,
          execution,
          warning: "Portal command queued in Supabase. Connector transport is still scaffolded."
        };
      }
    }
  }

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
