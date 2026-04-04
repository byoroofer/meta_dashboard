"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { withBasePath } from "@/lib/config/base-path";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onClick() {
    setSubmitting(true);

    try {
      const response = await fetch(withBasePath("/api/auth/logout"), {
        method: "POST"
      });

      if (response.redirected) {
        router.replace(response.url as never);
        router.refresh();
        return;
      }

      router.replace(withBasePath("/login") as never);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting}
      className="rounded-lg border border-[var(--border-strong)] bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      Sign out
    </button>
  );
}
