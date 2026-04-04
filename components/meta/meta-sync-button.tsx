"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function MetaSyncButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onClick() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/meta/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const payload = (await response.json()) as { success?: boolean; error?: string; data?: { counts?: Record<string, number> } };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Meta import failed.");
      }

      const counts = payload.data?.counts ?? {};
      setMessage(`Imported ${counts.businesses ?? 0} businesses, ${counts.adAccounts ?? 0} ad accounts, and ${counts.leads ?? 0} leads.`);
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Meta import failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="secondary" className="bg-slate-50" disabled={isSubmitting || isPending} onClick={onClick}>
        {isSubmitting || isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 text-[var(--accent)]" />}
        Import Meta data
      </Button>
      {message ? <p className="max-w-[320px] text-right text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
