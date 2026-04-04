"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { withBasePath } from "@/lib/config/base-path";

export function LoginForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("password", password);

      const response = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        body: formData
      });

      if (response.redirected) {
        router.replace(response.url as never);
        router.refresh();
        return;
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Login failed.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Password</span>
        <Input
          name="password"
          type="password"
          required
          placeholder="Enter admin password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      <Button type="submit" className="w-full" disabled={disabled || submitting}>
        Enter dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
