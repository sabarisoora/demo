"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { lineTotals, STATUSES, vehicleLabel, type JobStatus, type LineKind } from "@/lib/shop";
import { saveRepairOrder } from "../shop-actions";

type PickerVehicle = { id: string; year: number | null; make: string; model: string; plate: string; mileage: number | null };
type PickerCustomer = { id: string; name: string; phone: string; vehicles: PickerVehicle[] };
type PartOption = { id: string; name: string; sku: string; unitPrice: number; unitCost: number; onHand: number };
type EditLine = { key: number; kind: LineKind; description: string; qty: string; unitPrice: string; unitCost: string; partId: string | null };

export type EditorInitial = {
  id?: string;
  status: JobStatus;
  date: string;
  ref: string;
  category: string;
  customerId: string | null;
  vehicleId: string | null;
  mileage: number | null;
  technician: string;
  notes: string;
  paid: boolean;
  comeback: boolean;
  lines: { kind: LineKind; description: string; qty: number; unitPrice: number; unitCost: number; partId: string | null }[];
};

// Defined at module level: a component created inside render would remount its inputs on every keystroke.
function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
let keySeq = 0;

export function RepairOrderEditor(props: {
  initial: EditorInitial;
  customers: PickerCustomer[];
  parts: PartOption[] | null; // null = inventory not available (not Elite)
  categories: string[];
  technicians: string[];
  laborRate: number;
  taxRate: number | null;
  taxOnLabor: boolean;
  taxLabel: string;
  symbol: string;
  labels: { singular: string; short: string; a: string; b: string; customer: string; technician: string; comeback: string };
}) {
  const { initial, labels } = props;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<JobStatus>(initial.status);
  const [date, setDate] = useState(initial.date);
  const [ref, setRef] = useState(initial.ref);
  const [category, setCategory] = useState(initial.category);
  const [technician, setTechnician] = useState(initial.technician);
  const [notes, setNotes] = useState(initial.notes);
  const [paid, setPaid] = useState(initial.paid);
  const [comeback, setComeback] = useState(initial.comeback);
  const [mileage, setMileage] = useState(initial.mileage ? String(initial.mileage) : "");

  // Customer: typed text matched against the list; unmatched text creates a new customer.
  const customerLabel = (c: PickerCustomer) => (props.customers.filter((x) => x.name.toLowerCase() === c.name.toLowerCase()).length > 1 && c.phone ? `${c.name} · ${c.phone}` : c.name);
  const byLabel = new Map(props.customers.map((c) => [customerLabel(c).toLowerCase(), c]));
  const initialCustomer = props.customers.find((c) => c.id === initial.customerId);
  const [customerText, setCustomerText] = useState(initialCustomer ? customerLabel(initialCustomer) : "");
  const customer = byLabel.get(customerText.trim().toLowerCase()) ?? null;
  const [vehicleId, setVehicleId] = useState<string>(initial.vehicleId ?? (initialCustomer?.vehicles.length === 1 ? initialCustomer.vehicles[0].id : ""));
  const [newVehicle, setNewVehicle] = useState({ year: "", make: "", model: "", plate: "" });
  const vehicleChoice = customer ? (customer.vehicles.some((v) => v.id === vehicleId) ? vehicleId : vehicleId === "new" ? "new" : "") : "new";

  const [lines, setLines] = useState<EditLine[]>(() =>
    initial.lines.length
      ? initial.lines.map((l) => ({ key: keySeq++, kind: l.kind, description: l.description, qty: String(l.qty), unitPrice: String(l.unitPrice), unitCost: String(l.unitCost), partId: l.partId }))
      : [{ key: keySeq++, kind: "labor", description: "", qty: "1", unitPrice: props.laborRate ? String(props.laborRate) : "", unitCost: "", partId: null }],
  );
  const [showCost, setShowCost] = useState(true);

  const parsed = lines.map((l) => ({ kind: l.kind, description: l.description, qty: num(l.qty), unitPrice: num(l.unitPrice), unitCost: num(l.unitCost), partId: l.partId }));
  const t = lineTotals(parsed, props.taxRate, props.taxOnLabor);
  const profit = t.subtotal - t.costA - t.costB;
  const fmt = (n: number) => `${n < 0 ? "-" : ""}${props.symbol}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const partLabel = (p: PartOption) => (p.sku ? `${p.name} (${p.sku})` : p.name);
  const partsByLabel = useMemo(() => new Map((props.parts ?? []).map((p) => [(p.sku ? `${p.name} (${p.sku})` : p.name).toLowerCase(), p])), [props.parts]);

  const update = (key: number, patch: Partial<EditLine>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const setDescription = (l: EditLine, value: string) => {
    const part = l.kind === "part" ? partsByLabel.get(value.trim().toLowerCase()) : undefined;
    if (part) update(l.key, { description: part.name, partId: part.id, unitPrice: String(part.unitPrice), unitCost: String(part.unitCost) });
    else update(l.key, { description: value, partId: l.partId && value !== l.description ? null : l.partId });
  };
  const add = (kind: LineKind) =>
    setLines((ls) => [
      ...ls,
      { key: keySeq++, kind, description: "", qty: "1", unitPrice: kind === "labor" && props.laborRate ? String(props.laborRate) : "", unitCost: "", partId: null },
    ]);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveRepairOrder({
        id: initial.id ?? null,
        status,
        date,
        ref,
        category,
        customerId: customer?.id ?? null,
        newCustomer: customer ? "" : customerText,
        vehicleId: vehicleChoice && vehicleChoice !== "new" ? vehicleChoice : null,
        newVehicle:
          vehicleChoice === "new" && (newVehicle.make || newVehicle.model || newVehicle.plate)
            ? { year: newVehicle.year ? Number(newVehicle.year) : null, make: newVehicle.make, model: newVehicle.model, plate: newVehicle.plate }
            : null,
        mileage: mileage ? Math.round(num(mileage)) : null,
        technician,
        notes,
        paid,
        comeback,
        lines: parsed,
      });
      if (res.error) setError(res.error);
      else if (res.id) router.push(`/app/jobs/${res.id}`);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="min-w-0 space-y-4 lg:col-span-2">
        <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Status">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={status === s.value}
                onClick={() => setStatus(s.value)}
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${status === s.value ? "border-brand bg-brand text-brand-ink" : "border-line-strong text-ink-2 hover:text-ink"}`}
              >
                {s.label}
              </button>
            ))}
            <span className="text-xs text-muted">{status === "completed" ? "Counts in your numbers." : "Not counted in revenue until completed."}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <L label="Date">
              <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </L>
            <L label={`${labels.short} # (optional)`}>
              <input className="field" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Auto" />
            </L>
            <L label="Category" className="col-span-2">
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {(props.categories.includes(category) ? props.categories : [category, ...props.categories]).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </L>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-display text-sm font-bold tracking-wide text-ink-2 uppercase">{labels.customer} & vehicle</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <L label={labels.customer} className="col-span-2">
              <input
                className="field"
                list="ro-customers"
                value={customerText}
                onChange={(e) => {
                  setCustomerText(e.target.value);
                  const c = byLabel.get(e.target.value.trim().toLowerCase());
                  setVehicleId(c?.vehicles.length === 1 ? c.vehicles[0].id : c ? "" : "new");
                }}
                placeholder="Start typing a name…"
                autoComplete="off"
              />
              <datalist id="ro-customers">
                {props.customers.map((c) => (
                  <option key={c.id} value={customerLabel(c)} />
                ))}
              </datalist>
              <span className="mt-1 block text-xs text-muted">{customerText.trim() ? (customer ? "Existing customer" : "New customer: will be added") : "Optional"}</span>
            </L>
            <L label="Vehicle" className="col-span-2">
              {customer ? (
                <select className="field" value={vehicleChoice} onChange={(e) => setVehicleId(e.target.value)}>
                  <option value="">No vehicle</option>
                  {customer.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {vehicleLabel(v)}
                      {v.plate ? ` · ${v.plate}` : ""}
                    </option>
                  ))}
                  <option value="new">+ New vehicle…</option>
                </select>
              ) : (
                <div className="field text-muted">{customerText.trim() ? "Add the vehicle below" : "Pick a customer first"}</div>
              )}
            </L>
            {customerText.trim() && vehicleChoice === "new" && (
              <>
                <L label="Year">
                  <input className="field num" inputMode="numeric" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                </L>
                <L label="Make">
                  <input className="field" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Ford" />
                </L>
                <L label="Model">
                  <input className="field" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="F-150" />
                </L>
                <L label="Plate">
                  <input className="field uppercase" value={newVehicle.plate} onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })} />
                </L>
              </>
            )}
            <L label="Mileage in">
              <input className="field num" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, "").slice(0, 7))} />
            </L>
            <L label={labels.technician}>
              <input className="field" list="ro-techs" value={technician} onChange={(e) => setTechnician(e.target.value)} autoComplete="off" />
              <datalist id="ro-techs">
                {props.technicians.map((x) => (
                  <option key={x} value={x} />
                ))}
              </datalist>
            </L>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-sm font-bold tracking-wide text-ink-2 uppercase">Work & parts</h2>
            <label className="flex items-center gap-2 text-xs text-ink-2">
              <input type="checkbox" checked={showCost} onChange={(e) => setShowCost(e.target.checked)} className="accent-[var(--brand)]" />
              Show my cost (never printed)
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs text-muted uppercase">
                <tr>
                  <th className="w-24 pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="w-20 pb-2 text-right font-semibold">{"Qty/hrs"}</th>
                  <th className="w-28 pb-2 text-right font-semibold">Price</th>
                  {showCost && <th className="w-24 pb-2 text-right font-semibold">My cost</th>}
                  <th className="w-24 pb-2 text-right font-semibold">Amount</th>
                  <th className="w-8 pb-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const part = l.partId ? props.parts?.find((p) => p.id === l.partId) : undefined;
                  return (
                    <tr key={l.key} className="border-t border-line align-top">
                      <td className="py-2 pr-2">
                        <select
                          aria-label={`Line ${i + 1} type`}
                          className="field px-2 py-1.5"
                          value={l.kind}
                          onChange={(e) => update(l.key, { kind: e.target.value as LineKind, partId: null })}
                        >
                          <option value="part">{labels.a}</option>
                          <option value="labor">{labels.b}</option>
                          <option value="fee">Fee</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          aria-label={`Line ${i + 1} description`}
                          className="field py-1.5"
                          list={l.kind === "part" && props.parts?.length ? "ro-parts" : undefined}
                          value={l.description}
                          onChange={(e) => setDescription(l, e.target.value)}
                          placeholder={l.kind === "part" ? (props.parts?.length ? "Type to search inventory…" : "Part name") : l.kind === "labor" ? "e.g. Replace front pads & rotors" : "e.g. Shop supplies"}
                        />
                        {part && (
                          <span className={`mt-1 block text-xs ${part.onHand <= 0 ? "text-critical-ink" : "text-muted"}`}>
                            From inventory · {part.onHand} in stock
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <input aria-label={`Line ${i + 1} quantity`} className="field num py-1.5 text-right" inputMode="decimal" value={l.qty} onChange={(e) => update(l.key, { qty: e.target.value })} />
                      </td>
                      <td className="py-2 pr-2">
                        <input aria-label={`Line ${i + 1} price`} className="field num py-1.5 text-right" inputMode="decimal" value={l.unitPrice} onChange={(e) => update(l.key, { unitPrice: e.target.value })} placeholder="0.00" />
                      </td>
                      {showCost && (
                        <td className="py-2 pr-2">
                          <input aria-label={`Line ${i + 1} cost`} className="field num py-1.5 text-right" inputMode="decimal" value={l.unitCost} onChange={(e) => update(l.key, { unitCost: e.target.value })} placeholder="0.00" />
                        </td>
                      )}
                      <td className="num py-3.5 pr-2 text-right">{fmt(t.lineAmount(parsed[i]))}</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          aria-label={`Remove line ${i + 1}`}
                          onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                          className="rounded px-1.5 text-lg leading-none text-muted hover:bg-critical/10 hover:text-critical-ink"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {props.parts && (
              <datalist id="ro-parts">
                {props.parts.map((p) => (
                  <option key={p.id} value={partLabel(p)} />
                ))}
              </datalist>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => add("part")}>
              + {labels.a}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => add("labor")}>
              + {labels.b}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => add("fee")}>
              + Fee
            </button>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
          <L label="Notes (printed on the invoice)">
            <textarea className="field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Findings, recommendations, warranty terms…" />
          </L>
          <div className="mt-3 flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
              Paid
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={comeback} onChange={(e) => setComeback(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
              {labels.comeback}
            </label>
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-6">
        <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-display text-sm font-bold tracking-wide text-ink-2 uppercase">Totals</h2>
          <dl className="num space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="font-sans text-ink-2">{labels.a}</dt>
              <dd>{fmt(t.revenueA)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-sans text-ink-2">{labels.b} & fees</dt>
              <dd>{fmt(t.revenueB)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5">
              <dt className="font-sans text-ink-2">Subtotal</dt>
              <dd>{fmt(t.subtotal)}</dd>
            </div>
            {props.taxRate ? (
              <div className="flex justify-between">
                <dt className="font-sans text-ink-2">
                  {props.taxLabel} {props.taxRate}%{props.taxOnLabor ? "" : ` on ${labels.a.toLowerCase()}`}
                </dt>
                <dd>{fmt(t.tax)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-line-strong pt-1.5 text-base font-semibold">
              <dt className="font-sans">Total</dt>
              <dd>{fmt(t.total)}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-lg bg-surface-2 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-2">Your profit</span>
              <span className={`num font-semibold ${profit < 0 ? "text-critical-ink" : "text-good-ink"}`}>{fmt(profit)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-ink-2">Gross margin</span>
              <span className="num">{t.subtotal ? `${((profit / t.subtotal) * 100).toFixed(0)}%` : "—"}</span>
            </div>
            {t.hours > 0 && (
              <div className="mt-1 flex justify-between">
                <span className="text-ink-2">{labels.b} hours</span>
                <span className="num">{t.hours}</span>
              </div>
            )}
            <p className="mt-2 text-muted">Only you see this. Customers see prices and totals.</p>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-critical-ink">
              {error}
            </p>
          )}
          <button type="button" onClick={save} disabled={pending} className="btn btn-primary mt-4 w-full">
            {pending ? "Saving…" : initial.id ? "Save changes" : `Save ${status === "estimate" ? "estimate" : labels.singular.toLowerCase()}`}
          </button>
        </section>
      </aside>
    </div>
  );
}
