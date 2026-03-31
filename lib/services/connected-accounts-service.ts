import { dashboardRepository } from "@/lib/repositories/dashboard-repository";
import { getPortalData } from "@/lib/services/portal-service";
import type { IntegrationTarget, OverviewMetric } from "@/types/domain";

function getTargetNextStep(
  status: "active" | "warning" | "paused",
  targetType: IntegrationTarget["targetType"]
) {
  if (status === "warning") {
    if (targetType === "database") {
      return "Finalize schema mappings and credential policy before live writes.";
    }

    return "Review connector health and approve the blocked command path.";
  }

  if (status === "paused") {
    return "Reconnect or resume this target before dispatching commands.";
  }

  if (targetType === "meta_asset") {
    return "Ready for supported Meta business commands once tokens are connected.";
  }

  if (targetType === "website") {
    return "Ready for lead delivery and website workflow commands after auth handoff.";
  }

  if (targetType === "database") {
    return "Ready once guarded write contracts are promoted out of draft.";
  }

  return "Ready for internal operational mutations and retry commands.";
}

export async function getConnectedAccountsData() {
  const [businesses, assets, auditLogs, portal] = await Promise.all([
    dashboardRepository.getConnectedBusinesses(),
    dashboardRepository.getConnectedAssets(),
    dashboardRepository.getAuditLogs(),
    getPortalData()
  ]);

  const controlMetrics: OverviewMetric[] = [
    {
      label: "Connected Meta assets",
      value: `${assets.filter((asset) => asset.status === "active").length}`,
      delta: `${assets.length} supported business assets tracked`,
      tone: "positive"
    },
    {
      label: "Portal targets",
      value: `${portal.targets.length}`,
      delta: `${portal.targets.filter((target) => target.status === "active").length} targets ready for dispatch`,
      tone: "positive"
    },
    {
      label: "Approval-gated commands",
      value: `${portal.templates.filter((template) => template.requiresApproval).length}`,
      delta: "Guardrails stay on until website and database contracts are approved",
      tone: "warning"
    },
    {
      label: "Attention required",
      value: `${assets.filter((asset) => asset.syncStatus === "lagging" || asset.webhookHealth === "degraded").length + portal.targets.filter((target) => target.status === "warning").length}`,
      delta: "Lagging syncs and warning-state targets need review before go-live",
      tone: "warning"
    }
  ];

  const commandCoverage = portal.targets.map((target) => {
    const templates = portal.templates.filter((template) => template.targetType === target.targetType);
    const executions = portal.executions.filter((execution) => execution.targetId === target.id);

    return {
      id: target.id,
      name: target.name,
      targetType: target.targetType,
      status: target.status,
      connectionLabel: target.connectionLabel,
      commandCount: templates.length,
      approvalCount: templates.filter((template) => template.requiresApproval).length,
      latestExecutionAt: executions[0]?.requestedAt ?? null,
      nextStep: getTargetNextStep(target.status, target.targetType),
      capabilities: target.capabilities
    };
  });

  const systemTargetTypes: IntegrationTarget["targetType"][] = ["meta_asset", "website", "database", "table"];

  const systemCoverage = systemTargetTypes.map((targetType) => {
    const targets = portal.targets.filter((target) => target.targetType === targetType);
    const templates = portal.templates.filter((template) => template.targetType === targetType);
    const targetIds = new Set(targets.map((target) => target.id));
    const templateIds = new Set(templates.map((template) => template.id));
    const activeTargets = targets.filter((target) => target.status === "active").length;
    const latestExecution = portal.executions.find(
      (execution) => targetIds.has(execution.targetId) || templateIds.has(execution.commandTemplateId)
    );

    return {
      targetType,
      targetCount: targets.length,
      activeTargets,
      templateCount: templates.length,
      approvalCount: templates.filter((template) => template.requiresApproval).length,
      latestExecutionAt: latestExecution?.requestedAt ?? null
    };
  });

  return {
    businesses,
    assets,
    recentAudit: auditLogs.slice(0, 5),
    controlMetrics,
    commandCoverage,
    systemCoverage
  };
}
