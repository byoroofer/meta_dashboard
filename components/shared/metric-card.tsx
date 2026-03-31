import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewMetric } from "@/types/domain";

const metricIcons = {
  positive: ArrowUpRight,
  warning: ArrowDownRight,
  neutral: Minus
} as const;

export function MetricCard({ metric }: { metric: OverviewMetric }) {
  const Icon = metricIcons[metric.tone];

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="pb-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</p>
        <CardTitle className="text-3xl text-white">{metric.value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
        {metric.delta}
      </CardContent>
    </Card>
  );
}
