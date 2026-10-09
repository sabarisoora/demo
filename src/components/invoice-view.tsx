import type { Business, Customer, Job, JobLine, Vehicle } from "@/db";
import { getCountry } from "@/lib/countries";
import { dateLabel, moneyFormatter } from "@/lib/format";
import { lineTotals, vehicleLabel, type LineKind } from "@/lib/shop";
import type { Niche } from "@/niches/types";

/** The customer-facing document: estimate, work order or invoice. Used in-app and on the public link. */
export function InvoiceView({
  business,
  job,
  lines,
  customer,
  vehicle,
  niche,
}: {
  business: Business;
  job: Job;
  lines: JobLine[];
  customer: Customer | null;
  vehicle: Vehicle | null;
  niche: Niche;
}) {
  const money = moneyFormatter(business.country);
  const country = getCountry(business.country);
  // Totals-only jobs show as one line per stream.
  const shown = lines.length
    ? lines.map((l) => ({ kind: l.kind as LineKind, description: l.description, qty: l.qty, unitPrice: l.unitPrice, unitCost: l.unitCost }))
    : [
        ...(job.revenueA ? [{ kind: "part" as const, description: niche.streams.a, qty: 1, unitPrice: job.revenueA, unitCost: 0 }] : []),
        ...(job.revenueB ? [{ kind: "labor" as const, description: niche.streams.b, qty: 1, unitPrice: job.revenueB, unitCost: 0 }] : []),
      ];
  const t = lineTotals(shown, business.invoiceTaxRate, business.invoiceTaxOnLabor);
  const title = job.status === "estimate" ? "Estimate" : job.status === "open" ? "Work order" : "Invoice";
  const taxLabel = country.vat > 0 ? country.vatLabel.split(" ")[0] : "Tax";
  const groups: { label: string; kinds: LineKind[] }[] = [
    { label: niche.streams.b, kinds: ["labor"] },
    { label: niche.streams.a, kinds: ["part"] },
    { label: "Fees", kinds: ["fee"] },
  ];

  return (
    <article className="invoice rounded-xl border border-line bg-surface p-6 text-sm sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
        <div>
          <div className="font-display text-2xl font-extrabold">{business.name || "Your shop"}</div>
          <div className="mt-1 whitespace-pre-line text-ink-2">{business.address}</div>
          <div className="text-ink-2">{[business.phone, business.email].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-extrabold tracking-wide uppercase">{title}</div>
          <div className="num mt-1 text-ink-2">{job.ref}</div>
          <div className="text-ink-2">{dateLabel(job.date)}</div>
          {job.status === "completed" && (
            <div className={`mt-2 inline-block rounded border-2 px-2 py-0.5 text-xs font-extrabold tracking-widest uppercase ${job.paid ? "border-good text-good-ink" : "border-critical text-critical-ink"}`}>
              {job.paid ? "Paid" : "Balance due"}
            </div>
          )}
        </div>
      </header>

      <section className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
        <div>
          <div className="text-xs font-bold tracking-wider text-muted uppercase">{niche.job.customerLabel}</div>
          <div className="mt-1 font-semibold">{customer?.name || job.customer || "—"}</div>
          {customer && <div className="text-ink-2">{[customer.phone, customer.email].filter(Boolean).join(" · ")}</div>}
        </div>
        {vehicle && (
          <div>
            <div className="text-xs font-bold tracking-wider text-muted uppercase">Vehicle</div>
            <div className="mt-1 font-semibold">{vehicleLabel(vehicle)}</div>
            <div className="text-ink-2">
              {[vehicle.plate && `Plate ${vehicle.plate}`, vehicle.vin && `VIN ${vehicle.vin}`, (job.mileage ?? vehicle.mileage) && `${(job.mileage ?? vehicle.mileage)!.toLocaleString("en-US")} mi`]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        )}
      </section>

      <table className="mt-6 w-full">
        <thead className="text-left text-xs text-muted uppercase">
          <tr className="border-b border-line">
            <th className="pb-2 font-semibold">Description</th>
            <th className="w-20 pb-2 text-right font-semibold">Qty</th>
            <th className="w-28 pb-2 text-right font-semibold">Rate</th>
            <th className="w-28 pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        {groups.map((g) => {
          const rows = shown.filter((l) => g.kinds.includes(l.kind));
          if (!rows.length) return null;
          return (
            <tbody key={g.label}>
              <tr>
                <td colSpan={4} className="pt-4 pb-1 text-xs font-bold tracking-wider text-ink-2 uppercase">
                  {g.label}
                </td>
              </tr>
              {rows.map((l, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-2 pr-3">{l.description || "—"}</td>
                  <td className="num py-2 text-right">{l.qty}</td>
                  <td className="num py-2 text-right">{money(l.unitPrice)}</td>
                  <td className="num py-2 text-right">{money(t.lineAmount(l))}</td>
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>

      <div className="mt-6 flex flex-wrap justify-between gap-6">
        <div className="max-w-md text-ink-2">
          {job.notes && (
            <>
              <div className="text-xs font-bold tracking-wider text-muted uppercase">Notes</div>
              <p className="mt-1 whitespace-pre-line">{job.notes}</p>
            </>
          )}
        </div>
        <dl className="num w-full max-w-xs space-y-1.5">
          <div className="flex justify-between">
            <dt className="font-sans text-ink-2">Subtotal</dt>
            <dd>{money(t.subtotal)}</dd>
          </div>
          {t.tax > 0 && (
            <div className="flex justify-between">
              <dt className="font-sans text-ink-2">
                {taxLabel} ({business.invoiceTaxRate}%{business.invoiceTaxOnLabor ? "" : ` on ${niche.streams.a.toLowerCase()}`})
              </dt>
              <dd>{money(t.tax)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line-strong pt-2 text-lg font-semibold">
            <dt className="font-sans">{job.status === "estimate" ? "Estimated total" : "Total"}</dt>
            <dd>{money(t.total)}</dd>
          </div>
        </dl>
      </div>

      {(business.invoiceFooter || job.status === "estimate") && (
        <footer className="mt-8 border-t border-line pt-4 text-xs whitespace-pre-line text-muted">
          {job.status === "estimate" && "This is an estimate. Final price may change if additional work is approved. "}
          {business.invoiceFooter}
        </footer>
      )}
    </article>
  );
}
