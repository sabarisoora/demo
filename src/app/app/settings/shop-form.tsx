"use client";

import { useActionState } from "react";
import { saveShopSettings } from "../shop-actions";

type Init = {
  address: string;
  phone: string;
  email: string;
  invoiceTaxRate: number | null;
  invoiceTaxOnLabor: boolean;
  invoiceFooter: string;
  laborRate: number;
  reminderMonths: number;
};

function L({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function ShopForm({ initial, taxLabel, laborLabel }: { initial: Init; taxLabel: string; laborLabel: string }) {
  const [state, action, pending] = useActionState(saveShopSettings, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <L label="Shop address" className="sm:col-span-2">
        <textarea className="field min-h-16" name="address" defaultValue={initial.address} placeholder={"123 Main St\nSpringfield, IL 62701"} />
      </L>
      <L label="Shop phone">
        <input className="field" name="phone" type="tel" defaultValue={initial.phone} />
      </L>
      <L label="Shop email">
        <input className="field" name="email" type="email" defaultValue={initial.email} />
      </L>
      <L label={`${taxLabel} on invoices (%)`} hint="Leave blank for none. Revenue in reports never includes it.">
        <input className="field num" name="invoiceTaxRate" type="number" step="0.001" min="0" max="50" defaultValue={initial.invoiceTaxRate ?? ""} placeholder="e.g. 8.25" />
      </L>
      <label className="flex items-center gap-2 self-center text-sm">
        <input type="checkbox" name="invoiceTaxOnLabor" defaultChecked={initial.invoiceTaxOnLabor} className="h-4 w-4 accent-[var(--brand)]" />
        Also charge {taxLabel.toLowerCase()} on {laborLabel.toLowerCase()} and fees
      </label>
      <L label={`Default ${laborLabel.toLowerCase()} rate (per hour)`} hint="Pre-filled on new labor lines.">
        <input className="field num" name="laborRate" type="number" step="0.01" min="0" defaultValue={initial.laborRate || ""} placeholder="e.g. 125" />
      </L>
      <L label="Service reminder interval (months)" hint="A vehicle is due this long after its last visit.">
        <input className="field num" name="reminderMonths" type="number" min="1" max="36" defaultValue={initial.reminderMonths} required />
      </L>
      <L label="Invoice footer" className="sm:col-span-2" hint="Payment terms, warranty, thank-you note…">
        <textarea className="field min-h-16" name="invoiceFooter" defaultValue={initial.invoiceFooter} placeholder="Payment due on pickup. 12-month / 12,000-mile warranty on parts and labor." />
      </L>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save shop details"}
        </button>
        {state?.error && <span className="text-sm text-critical-ink">{state.error}</span>}
        {state?.ok && <span className="text-sm text-good-ink">✓ {state.ok}</span>}
      </div>
    </form>
  );
}
