"use client";

import { useActionState } from "react";
import { importCsv } from "../actions";

export function ImportForm({ jobLabel }: { jobLabel: string }) {
  const [state, action, pending] = useActionState(importCsv, undefined);
  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-2">What's in the file?</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" value="jobs" defaultChecked className="accent-[var(--brand)]" /> {jobLabel}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" value="expenses" className="accent-[var(--brand)]" /> Expenses
          </label>
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-2">Date format in the file</span>
        <select name="dateFormat" className="field max-w-xs" defaultValue="mdy">
          <option value="mdy">MM/DD/YYYY (US)</option>
          <option value="dmy">DD/MM/YYYY (UK, EU, India…)</option>
          <option value="ymd">YYYY-MM-DD</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-2">CSV file</span>
        <input type="file" name="file" accept=".csv,text/csv" required className="field" />
      </label>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Importing…" : "Import"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-critical-ink">
          {state.error}
        </p>
      )}
      {state?.imported !== undefined && (
        <div role="status" className="rounded-md border border-line bg-surface-2 p-3 text-sm">
          <p className="font-semibold text-good-ink">
            ✓ Imported {state.imported.toLocaleString("en-US")} {state.kind}.
          </p>
          {state.skipped && state.skipped.length > 0 && (
            <>
              <p className="mt-2 text-ink-2">Skipped {state.skipped.length} row(s):</p>
              <ul className="mt-1 list-disc pl-5 text-xs text-muted">
                {state.skipped.slice(0, 8).map((s) => (
                  <li key={s}>{s}</li>
                ))}
                {state.skipped.length > 8 && <li>…and {state.skipped.length - 8} more</li>}
              </ul>
            </>
          )}
        </div>
      )}
    </form>
  );
}
