import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewMetric } from "@/types/domain";

export function MetricCard({ metric }: { metric: OverviewMetric }) {
  return (
    <Card className="rounded-xl border-slate-200">
      <CardHeader className="pb-2">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{metric.label}</p>
        <CardTitle className="text-[30px] font-semibold text-slate-950">{metric.value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-[var(--muted)]">{metric.delta}</CardContent>
    </Card>
  );
}
