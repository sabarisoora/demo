"use client";

import { useActionState } from "react";
import { importWorkbook } from "../actions";

export function WorkbookForm() {
  const [state, action, pending] = useActionState(importWorkbook, undefined);
  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(e) => {
        const replace = (e.currentTarget.elements.namedItem("mode") as RadioNodeList).value === "replace";
        if (replace && !confirm("Replace ALL your current data with the workbook's?")) e.preventDefault();
      }}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-2">Your ProfitIQS workbook (.xlsx)</span>
        <input type="file" name="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="field" />
      </label>
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="sr-only">Import mode</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" value="add" defaultChecked className="accent-[var(--brand)]" /> Add to my data
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" value="replace" className="accent-[var(--brand)]" /> Replace everything
        </label>
      </fieldset>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Importing… (large Elite files take ~30 seconds)" : "Import workbook"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-critical-ink">
          {state.error}
        </p>
      )}
      {state?.summary && (
        <div role="status" className="rounded-md border border-good/40 bg-good/10 p-3 text-sm">
          <p className="font-semibold text-good-ink">✓ {state.summary[0]}</p>
          <ul className="mt-1 list-disc pl-5 text-ink-2">
            {state.summary.slice(1).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
