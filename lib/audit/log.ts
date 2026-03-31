import { randomUUID } from "crypto";

import type { AuditLog } from "@/types/domain";

export function createAuditLogEntry(input: Omit<AuditLog, "id" | "occurredAt">): AuditLog {
  return {
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    ...input
  };
}
