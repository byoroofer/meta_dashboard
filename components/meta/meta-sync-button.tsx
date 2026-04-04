"use client";

import { CheckCircle2, LoaderCircle, RefreshCw, TriangleAlert, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

interface MetaStatus {
  config: {
    supabaseAdmin: boolean;
    metaAppCredentials: boolean;
    metaSystemUser: boolean;
    metaWebhook: boolean;
    encryptionKey: boolean;
  };
  lastSync: {
    status: string;
    detail: string;
    startedAt: string;
    completedAt: string | null;
    counts: Record<string, number> | null;
  } | null;
  verdict: "ready" | "no_businesses" | "missing_config" | "never_run";
}

function VerdictBadge({ verdict }: { verdict: MetaStatus["verdict"] }) {
  if (verdict === "ready") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Live
      </span>
    );
  }
  if (verdict === "no_businesses") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
        <TriangleAlert className="h-3.5 w-3.5" /> No businesses visible
      </span>
    );
  }
  if (verdict === "missing_config") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
        <XCircle className="h-3.5 w-3.5" /> Config incomplete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
      <TriangleAlert className="h-3.5 w-3.5" /> Never synced
    </span>
  );
}

function ConfigRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      {ok ? (
        <span className="font-medium text-emerald-700">configured</span>
      ) : (
        <span className="font-medium text-rose-700">missing</span>
      )}
    </div>
  );
}

export function MetaSyncButton() {
  const router = useRouter();
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/meta/status");
      if (res.ok) {
        const data = (await res.json()) as MetaStatus;
        setStatus(data);
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  async function onImport() {
    setIsSubmitting(true);
    setImportMessage(null);

    try {
      const res = await fetch("/api/meta/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const payload = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { counts?: Record<string, number> };
      };

      if (!res.ok || !payload.success) {
        throw new Error(payload.error ?? "Meta import failed.");
      }

      const c = payload.data?.counts ?? {};
      const summary = `${c.businesses ?? 0} businesses, ${c.adAccounts ?? 0} ad accounts, ${c.leads ?? 0} leads`;
      setImportMessage({ ok: true, text: `Import complete — ${summary}` });
      startTransition(() => router.refresh());
      await fetchStatus();
    } catch (error) {
      setImportMessage({
        ok: false,
        text: error instanceof Error ? error.message : "Meta import failed."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          className="bg-slate-50"
          disabled={isSubmitting || isPending}
          onClick={onImport}
        >
          {isSubmitting || isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4 text-[var(--accent)]" />
          )}
          Sync Meta data
        </Button>
        {status && !isLoadingStatus && <VerdictBadge verdict={status.verdict} />}
      </div>

      {importMessage && (
        <p className={`text-xs ${importMessage.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {importMessage.text}
        </p>
      )}

      {/* Config diagnostic panel */}
      {status && !isLoadingStatus && (
        <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-3.5 text-xs">
          <p className="mb-2.5 font-semibold uppercase tracking-[0.14em] text-slate-500">Integration health</p>
          <div className="space-y-1.5">
            <ConfigRow label="Supabase admin client" ok={status.config.supabaseAdmin} />
            <ConfigRow label="Meta app credentials (ID + secret)" ok={status.config.metaAppCredentials} />
            <ConfigRow label="Meta system user token" ok={status.config.metaSystemUser} />
            <ConfigRow label="Meta webhook tokens" ok={status.config.metaWebhook} />
          </div>

          {status.verdict === "no_businesses" && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-800">
              <p className="font-semibold">Token works but no businesses returned from /me/businesses.</p>
              <p className="mt-1 leading-5">
                Attach the system user to the Elite Cleaning business in Meta Business Settings, grant the app role, then re-sync.
              </p>
            </div>
          )}

          {status.verdict === "missing_config" && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-800">
              <p className="font-semibold">Required environment variables are not set.</p>
              <p className="mt-1 leading-5">
                Set <code className="rounded bg-rose-100 px-1">META_APP_ID</code>,{" "}
                <code className="rounded bg-rose-100 px-1">META_APP_SECRET</code>, and{" "}
                <code className="rounded bg-rose-100 px-1">META_SYSTEM_USER_ACCESS_TOKEN</code> in Vercel.
              </p>
            </div>
          )}

          {status.lastSync && (
            <div className="mt-3 border-t border-[var(--border)] pt-2.5">
              <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">Last sync</p>
              <p className="mt-1 text-[var(--muted)]">
                {status.lastSync.status.toUpperCase()} ·{" "}
                {new Date(status.lastSync.startedAt).toLocaleString()}
              </p>
              <p className="mt-0.5 text-[var(--muted)]">{status.lastSync.detail}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
