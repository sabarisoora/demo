"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { saveExpense, saveJob, type ActionState } from "./actions";

function Msg({ state }: { state: ActionState }) {
  if (state?.error)
    return (
      <p role="alert" className="text-sm text-critical-ink">
        {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p role="status" className="text-sm text-good-ink">
        ✓ {state.ok}
      </p>
    );
  return null;
}

function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

type JobInit = {
  id: string;
  ref: string;
  date: string;
  category: string;
  customer: string;
  revenueA: number;
  costA: number;
  revenueB: number;
  costB: number;
  technician: string;
  hours: number;
  paid: boolean;
  comeback: boolean;
};

export type DetailLabels = { technician: string; hours: string; comeback: string; comebackHint: string };

export function JobForm({
  categories,
  streams,
  labels,
  details,
  technicians,
  initial,
}: {
  categories: string[];
  streams: { a: string; b: string };
  labels: { singular: string; customer: string; short: string };
  details: DetailLabels;
  /** Names already used, offered as suggestions. */
  technicians: string[];
  initial?: JobInit;
}) {
  const [state, action, pending] = useActionState(saveJob, undefined);
  const hasDetails = !!initial && (!!initial.technician || initial.hours > 0 || !initial.paid || initial.comeback);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !initial) form.current?.reset();
  }, [state, initial]);
  // Keep a category that came from a CSV import selectable while editing.
  const cats = initial && !categories.includes(initial.category) ? [initial.category, ...categories] : categories;

  return (
    <form ref={form} action={action} className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <L label="Date">
        <input className="field" type="date" name="date" defaultValue={initial?.date ?? today()} required />
      </L>
      <L label={`${labels.short} # (optional)`}>
        <input className="field" name="ref" defaultValue={initial?.ref} placeholder="Auto" />
      </L>
      <L label="Category" className="col-span-2">
        <select className="field" name="category" defaultValue={initial?.category ?? categories[0]}>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </L>
      <L label={labels.customer} className="col-span-2 md:col-span-4">
        <input className="field" name="customer" defaultValue={initial?.customer} />
      </L>
      <L label={`${streams.a} revenue`}>
        <input className="field num" name="revenueA" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={initial?.revenueA ?? ""} placeholder="0.00" />
      </L>
      <L label={`${streams.a} cost`}>
        <input className="field num" name="costA" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={initial?.costA ?? ""} placeholder="0.00" />
      </L>
      <L label={`${streams.b} revenue`}>
        <input className="field num" name="revenueB" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={initial?.revenueB ?? ""} placeholder="0.00" />
      </L>
      <L label={`${streams.b} cost`}>
        <input className="field num" name="costB" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={initial?.costB ?? ""} placeholder="0.00" />
      </L>
      <details className="col-span-2 rounded-lg border border-line px-3 py-2 md:col-span-4" open={hasDetails}>
        <summary className="cursor-pointer text-sm font-semibold text-ink-2">
          More details <span className="font-normal text-muted">(optional: {details.technician.toLowerCase()}, hours, payment, {details.comeback.toLowerCase()})</span>
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 pb-1 md:grid-cols-4">
          <L label={details.technician}>
            <input className="field" name="technician" list="technician-names" defaultValue={initial?.technician} autoComplete="off" />
            <datalist id="technician-names">
              {technicians.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </L>
          <L label={details.hours}>
            <input className="field num" name="hours" type="number" step="0.1" min="0" inputMode="decimal" defaultValue={initial?.hours || ""} placeholder="0.0" />
          </L>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" name="unpaid" defaultChecked={initial ? !initial.paid : false} className="h-4 w-4 accent-[var(--brand)]" />
            Not paid yet
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm" title={details.comebackHint}>
            <input type="checkbox" name="comeback" defaultChecked={initial?.comeback} className="h-4 w-4 accent-[var(--brand)]" />
            {details.comeback}
          </label>
        </div>
      </details>
      <div className="col-span-2 flex flex-wrap items-center gap-3 md:col-span-4">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : `Add ${labels.singular.toLowerCase()}`}
        </button>
        {initial && (
          <Link href="/app/jobs" className="btn btn-ghost">
            Cancel
          </Link>
        )}
        <Msg state={state} />
      </div>
    </form>
  );
}

type ExpenseInit = { id: string; ref: string; date: string; category: string; vendor: string; amount: number };

export function ExpenseForm({ categories, initial }: { categories: string[]; initial?: ExpenseInit }) {
  const [state, action, pending] = useActionState(saveExpense, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !initial) form.current?.reset();
  }, [state, initial]);
  const cats = initial && !categories.includes(initial.category) ? [initial.category, ...categories] : categories;

  return (
    <form ref={form} action={action} className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <L label="Date">
        <input className="field" type="date" name="date" defaultValue={initial?.date ?? today()} required />
      </L>
      <L label="Amount">
        <input className="field num" name="amount" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={initial?.amount ?? ""} placeholder="0.00" required />
      </L>
      <L label="Category" className="col-span-2 md:col-span-1">
        <select className="field" name="category" defaultValue={initial?.category ?? categories[0]}>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </L>
      <L label="Vendor">
        <input className="field" name="vendor" defaultValue={initial?.vendor} />
      </L>
      <L label="Ref (optional)">
        <input className="field" name="ref" defaultValue={initial?.ref} placeholder="Auto" />
      </L>
      <div className="col-span-2 flex flex-wrap items-center gap-3 md:col-span-5">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Add expense"}
        </button>
        {initial && (
          <Link href="/app/expenses" className="btn btn-ghost">
            Cancel
          </Link>
        )}
        <Msg state={state} />
      </div>
    </form>
  );
}

export function DeleteButton({ action, id, label }: { action: (f: FormData) => Promise<void>; id: string; label: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete ${label}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-xs font-semibold text-critical-ink hover:underline" aria-label={`Delete ${label}`}>
        Delete
      </button>
    </form>
  );
}
