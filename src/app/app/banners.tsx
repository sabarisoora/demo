"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resendVerification } from "../(auth)/actions";

export function VerifyBanner({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendVerification, undefined);
  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-warning/60 bg-warning/10 px-4 py-3 text-sm">
      <span aria-hidden="true" style={{ color: "var(--warning)" }}>
        ◆
      </span>
      <span className="flex-1">
        Confirm your email (<strong>{email}</strong>) so you can reset your password and link Elite purchases.
      </span>
      {state?.ok ? (
        <span className="text-good-ink">✓ {state.ok}</span>
      ) : (
        <form action={action}>
          <button className="font-semibold text-brand hover:underline" disabled={pending}>
            {pending ? "Sending…" : "Resend email"}
          </button>
        </form>
      )}
      {state?.error && <span className="w-full text-critical-ink">{state.error}</span>}
    </div>
  );
}

const NOTICES: Record<string, Record<string, { ok: boolean; text: string }>> = {
  verify: {
    ok: { ok: true, text: "Email confirmed. Thanks!" },
    invalid: { ok: false, text: "That confirmation link has expired or was already used. Use “Resend email” to get a new one." },
  },
  reset: { "1": { ok: true, text: "Password changed. You're signed in, and other devices were signed out." } },
  password: { "1": { ok: true, text: "Password changed. Other devices were signed out." } },
};

/** One-off messages driven by ?verify=ok etc. after a redirect. */
export function Notices() {
  const sp = useSearchParams();
  const [hidden, setHidden] = useState(false);
  const found = Object.entries(NOTICES)
    .map(([k, m]) => m[sp.get(k) ?? ""])
    .find(Boolean);
  if (!found || hidden) return null;
  return (
    <div
      role="status"
      className={`no-print mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${found.ok ? "border-good/40 bg-good/10" : "border-critical/40 bg-critical/10"}`}
    >
      <span className={found.ok ? "text-good-ink" : "text-critical-ink"}>{found.ok ? "✓" : "!"}</span>
      <span className="flex-1">{found.text}</span>
      <button onClick={() => setHidden(true)} aria-label="Dismiss" className="text-muted hover:text-ink">
        ✕
      </button>
    </div>
  );
}
