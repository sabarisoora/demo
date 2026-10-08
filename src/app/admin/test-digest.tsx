"use client";

import { useState, useTransition } from "react";
import { sendTestDigest } from "./actions";

export function TestDigestButton() {
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>();
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="btn btn-ghost" disabled={pending} onClick={() => start(async () => setMsg(await sendTestDigest()))}>
        {pending ? "Sending…" : "Send me a test weekly summary"}
      </button>
      {msg?.ok && <span className="text-sm text-good-ink">✓ {msg.ok}</span>}
      {msg?.error && <span className="text-sm text-critical-ink">{msg.error}</span>}
    </div>
  );
}
