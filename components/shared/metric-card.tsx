import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OverviewMetric } from "@/types/domain";

const toneConfig = {
  positive: {
    cardClass: "metric-positive",
    valueClass: "text-slate-950",
    deltaClass: "text-[var(--success)]",
    Icon: TrendingUp
  },
  warning: {
    cardClass: "metric-warning",
    valueClass: "text-slate-950",
    deltaClass: "text-[var(--warning)]",
    Icon: TrendingDown
  },
  neutral: {
    cardClass: "metric-neutral",
    valueClass: "text-slate-950",
    deltaClass: "text-[var(--muted)]",
    Icon: Minus
  },
  negative: {
    cardClass: "metric-negative",
    valueClass: "text-[var(--danger)]",
    deltaClass: "text-[var(--danger)]",
    Icon: TrendingDown
  }
};

export function MetricCard({ metric }: { metric: OverviewMetric }) {
  const tone = toneConfig[metric.tone as keyof typeof toneConfig] ?? toneConfig.neutral;
  const { cardClass, valueClass, deltaClass, Icon } = tone;

  return (
    <Card className={cn("rounded-xl", cardClass)}>
      <CardHeader className="pb-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{metric.label}</p>
        <p className={cn("mt-1 text-[32px] font-semibold leading-none tracking-[-0.04em]", valueClass)}>
          {metric.value}
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", deltaClass)} />
          <p className={cn("text-xs leading-5", deltaClass)}>{metric.delta}</p>
        </div>
      </CardContent>
    </Card>
  );
}
