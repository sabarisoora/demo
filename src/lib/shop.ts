// Shop-management logic: repair order line totals, stock movements and service reminders.
// Pure functions, unit-tested in shop.test.ts.

export type LineKind = "part" | "labor" | "fee";
export type Line = { kind: LineKind; description: string; qty: number; unitPrice: number; unitCost: number; partId?: string | null };
export type JobStatus = "estimate" | "open" | "completed";

export const STATUSES: { value: JobStatus; label: string }[] = [
  { value: "estimate", label: "Estimate" },
  { value: "open", label: "In progress" },
  { value: "completed", label: "Completed" },
];
export const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Totals for a repair order. Parts are revenue stream A; labor and fees are stream B.
 * Tax applies to parts, or to everything when `taxOnLabor` is set. Revenue figures exclude tax.
 */
export function lineTotals(lines: Line[], taxRatePct: number | null, taxOnLabor: boolean) {
  const amount = (l: Line) => r2(l.qty * l.unitPrice);
  const cost = (l: Line) => r2(l.qty * l.unitCost);
  const parts = lines.filter((l) => l.kind === "part");
  const service = lines.filter((l) => l.kind !== "part");
  const revenueA = r2(parts.reduce((s, l) => s + amount(l), 0));
  const revenueB = r2(service.reduce((s, l) => s + amount(l), 0));
  const costA = r2(parts.reduce((s, l) => s + cost(l), 0));
  const costB = r2(service.reduce((s, l) => s + cost(l), 0));
  const hours = r2(lines.filter((l) => l.kind === "labor").reduce((s, l) => s + l.qty, 0));
  const taxable = taxOnLabor ? revenueA + revenueB : revenueA;
  const tax = taxRatePct ? r2((taxable * taxRatePct) / 100) : 0;
  const subtotal = r2(revenueA + revenueB);
  return { revenueA, revenueB, costA, costB, hours, subtotal, tax, total: r2(subtotal + tax), lineAmount: amount };
}

/** Estimates don't take parts off the shelf; open and completed jobs do. */
export const consumesStock = (status: string) => status === "open" || status === "completed";

/**
 * How much each inventory part's stock should go DOWN when a repair order changes from
 * (oldLines, oldStatus) to (newLines, newStatus). Negative values put stock back.
 */
export function stockDeltas(
  oldLines: Pick<Line, "partId" | "qty">[],
  oldStatus: string | null,
  newLines: Pick<Line, "partId" | "qty">[],
  newStatus: string | null,
): Map<string, number> {
  const used = (lines: Pick<Line, "partId" | "qty">[], status: string | null) => {
    const m = new Map<string, number>();
    if (!status || !consumesStock(status)) return m;
    for (const l of lines) if (l.partId) m.set(l.partId, (m.get(l.partId) ?? 0) + l.qty);
    return m;
  };
  const before = used(oldLines, oldStatus);
  const after = used(newLines, newStatus);
  const out = new Map<string, number>();
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const d = r2((after.get(id) ?? 0) - (before.get(id) ?? 0));
    if (d !== 0) out.set(id, d);
  }
  return out;
}

// ───────────── Service reminders ─────────────

const addMonths = (iso: string, months: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, last));
  return t.toISOString().slice(0, 10);
};
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export type ReminderStatus = "overdue" | "due-soon" | "later" | "no-history";

/** When a vehicle is next due: its own date if set, else last visit + the shop's interval. */
export function nextService(lastVisit: string | null, override: string | null, months: number, todayIso: string) {
  const due = override ?? (lastVisit ? addMonths(lastVisit, months) : null);
  if (!due) return { due: null, days: null, status: "no-history" as ReminderStatus };
  const days = daysBetween(todayIso, due);
  const status: ReminderStatus = days < 0 ? "overdue" : days <= 30 ? "due-soon" : "later";
  return { due, days, status };
}

/** A friendly reminder message the shop can send by email or text. */
export function reminderMessage(o: { customer: string; vehicle: string; shop: string; phone: string; due: string | null; overdue: boolean }) {
  const first = o.customer.split(" ")[0] || "there";
  const when = o.overdue ? "is overdue for service" : "is due for service soon";
  const call = o.phone ? ` Call us at ${o.phone} or reply to book a time.` : " Reply to book a time.";
  return `Hi ${first}, this is ${o.shop}. Your ${o.vehicle || "vehicle"} ${when}.${call} Thank you!`;
}

export function vehicleLabel(v: { year: number | null; make: string; model: string; plate?: string }) {
  const name = [v.year, v.make, v.model].filter(Boolean).join(" ");
  return name || v.plate || "Vehicle";
}
