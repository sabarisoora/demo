"use client";

import { useActionState } from "react";
import type { Goals } from "@/niches/types";
import { saveGoals } from "../actions";

export function GoalsForm({ goals, labels }: { goals: Goals; labels: { avgTicket: string; jobCount: string } }) {
  const [state, action, pending] = useActionState(saveGoals, undefined);
  const f = (name: keyof Goals, label: string, opts: { pct?: boolean; step?: string } = {}) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-2">
        {label}
        {opts.pct && " (%)"}
      </span>
      <input
        className="field num"
        name={name}
        type="number"
        step={opts.step ?? (opts.pct ? "0.1" : "1")}
        min={name === "netProfit" ? undefined : 0}
        max={opts.pct ? 100 : undefined}
        defaultValue={opts.pct ? Math.round(goals[name] * 1000) / 10 : goals[name]}
        required
      />
    </label>
  );
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {f("revenue", "Annual revenue")}
        {f("netProfit", "Annual net profit")}
        {f("avgTicket", labels.avgTicket, { step: "0.01" })}
        {f("jobCount", labels.jobCount)}
        {f("grossMargin", "Gross margin", { pct: true })}
        {f("netMargin", "Net margin", { pct: true })}
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save goals"}
        </button>
        {state?.error && <span className="text-sm text-critical-ink">{state.error}</span>}
        {state?.ok && <span className="text-sm text-good-ink">✓ {state.ok}</span>}
      </div>
    </form>
  );
}
