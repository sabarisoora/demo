"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { savePart } from "../shop-actions";

type Init = { id: string; sku: string; name: string; category: string; supplier: string; unitCost: number; unitPrice: number; onHand: number; reorderLevel: number };

function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

export function PartForm({ initial, categories }: { initial?: Init; categories: string[] }) {
  const [state, action, pending] = useActionState(savePart, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !initial) form.current?.reset();
  }, [state, initial]);
  return (
    <form ref={form} action={action} className="grid grid-cols-2 gap-3">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <L label="Part name" className="col-span-2">
        <input className="field" name="name" defaultValue={initial?.name} required placeholder="Brake pads, front, ceramic" />
      </L>
      <L label="SKU / part #">
        <input className="field" name="sku" defaultValue={initial?.sku} />
      </L>
      <L label="Category">
        <input className="field" name="category" list="part-categories" defaultValue={initial?.category} />
        <datalist id="part-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </L>
      <L label="Your cost">
        <input className="field num" name="unitCost" type="number" step="0.01" min="0" defaultValue={initial?.unitCost ?? ""} required />
      </L>
      <L label="Sell price">
        <input className="field num" name="unitPrice" type="number" step="0.01" min="0" defaultValue={initial?.unitPrice ?? ""} required />
      </L>
      <L label="On hand">
        <input className="field num" name="onHand" type="number" step="1" defaultValue={initial?.onHand ?? 0} required />
      </L>
      <L label="Reorder at">
        <input className="field num" name="reorderLevel" type="number" step="1" min="0" defaultValue={initial?.reorderLevel ?? 0} required />
      </L>
      <L label="Supplier" className="col-span-2">
        <input className="field" name="supplier" defaultValue={initial?.supplier} />
      </L>
      <div className="col-span-2 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save part" : "Add part"}
        </button>
        {initial && (
          <Link href="/app/inventory" className="btn btn-ghost">
            Cancel
          </Link>
        )}
        {state?.error && <span className="text-sm text-critical-ink">{state.error}</span>}
        {state?.ok && <span className="text-sm text-good-ink">✓ {state.ok}</span>}
      </div>
    </form>
  );
}
