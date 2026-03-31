import { Badge } from "@/components/ui/badge";

const variantByValue: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  active: "success",
  healthy: "success",
  processed: "success",
  sent: "success",
  delivered: "success",
  queued: "info",
  pending: "warning",
  lagging: "warning",
  warning: "warning",
  running: "info",
  new: "info",
  proposal: "warning",
  failed: "danger",
  revoked: "danger",
  lost: "danger",
  archived: "default",
  resolved: "default",
  paused: "warning",
  qualified: "success",
  success: "success",
  error: "danger"
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge variant={variantByValue[value] ?? "default"}>{value.replaceAll("_", " ")}</Badge>;
}
