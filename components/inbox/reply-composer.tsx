"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_REPLY_LENGTH = 1000;

export function ReplyComposer() {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-slate-50/80 p-4">
      <Textarea
        value={value}
        maxLength={MAX_REPLY_LENGTH}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Queue an outbound reply. Live delivery stays server-side and disabled until Meta credentials are connected."
        className="min-h-[132px] resize-none border-white bg-white"
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors hover:border-[var(--border-strong)] hover:bg-slate-50"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attachment
          </button>
          <span>{value.length}/{MAX_REPLY_LENGTH} characters</span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-[var(--muted)]">Replies are archived and state-tracked before live transport.</p>
          <Button disabled={!value.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Queue send
          </Button>
        </div>
      </div>
    </div>
  );
}
