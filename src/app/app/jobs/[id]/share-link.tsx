"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <input readOnly value={url} className="field min-w-0 flex-1 py-1.5 text-xs" onFocus={(e) => e.currentTarget.select()} aria-label="Customer link" />
      <button
        type="button"
        className="btn btn-ghost shrink-0"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard blocked: the field is selectable */
          }
        }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
