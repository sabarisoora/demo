"use client";

import { useActionState } from "react";
import { saveReserve } from "../actions";

export function ReserveForm({ value }: { value: number }) {
  const [state, action, pending] = useActionState(saveReserve, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-2">Set aside so far</span>
        <input className="field num w-40" name="reserveSetAside" type="number" min="0" step="0.01" defaultValue={value} />
      </label>
      <button className="btn btn-ghost" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </button>
      {state?.error && <span className="text-sm text-critical-ink">{state.error}</span>}
      {state?.ok && <span className="text-sm text-good-ink">✓ {state.ok}</span>}
    </form>
  );
}
