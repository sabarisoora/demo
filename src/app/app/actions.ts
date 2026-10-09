"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, businesses, customers, expenses, jobLines, jobs, parts, vehicles } from "@/db";
import { requireOwner, requireWriter } from "@/lib/auth";
import { countries } from "@/lib/countries";
import { rateLimit } from "@/lib/tokens";
import { mapColumns, parseCsv, parseDate, parseMoney, type DateFormat } from "@/lib/csv";
import { getNiche } from "@/niches";
import { customerIdsByName, findOrCreateCustomer } from "@/lib/shop-data";

const refresh = () => revalidatePath("/app", "layout");

const money = z.coerce.number().finite().min(0, "Amounts can't be negative").max(1e10);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const optionalPercent = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 100), "Rates must be between 0 and 100");

export type ActionState = { error?: string; ok?: string } | undefined;

// ───────────── Jobs (repair orders) ─────────────

const jobSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  ref: z.string().trim().max(60),
  date: isoDate,
  category: z.string().trim().min(1, "Pick a category").max(120),
  customer: z.string().trim().max(160),
  revenueA: money,
  costA: money,
  revenueB: money,
  costB: money,
  technician: z.string().trim().max(80).default(""),
  hours: z.coerce.number().finite().min(0, "Hours can't be negative").max(10000).default(0),
  // Checkboxes: present ("on") when ticked, absent otherwise.
  unpaid: z.string().optional(),
  comeback: z.string().optional(),
});

async function nextRef(table: typeof jobs | typeof expenses, businessId: string, prefix: string, start: number) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(eq(table.businessId, businessId));
  return `${prefix}${start + n}`;
}

export async function saveJob(_: ActionState, form: FormData): Promise<ActionState> {
  const { business } = await requireWriter();
  const parsed = jobSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, unpaid, comeback, ...rest } = parsed.data;
  // Link the typed name to a customer record so it shows up under Customers.
  const customerId = await findOrCreateCustomer(db, business.id, rest.customer);
  const v = { ...rest, customerId, paid: unpaid !== "on", comeback: comeback === "on" };
  if (id) {
    await db.update(jobs).set(v).where(and(eq(jobs.id, id), eq(jobs.businessId, business.id)));
  } else {
    const niche = getNiche(business.niche);
    const ref = v.ref || (await nextRef(jobs, business.id, niche.job.refPrefix, 1000));
    await db.insert(jobs).values({ ...v, ref, businessId: business.id });
  }
  refresh();
  if (id) redirect("/app/jobs");
  return { ok: "Saved." };
}

export async function setJobPaid(form: FormData) {
  const { business } = await requireWriter();
  const id = z.string().uuid().parse(form.get("id"));
  const paid = form.get("paid") !== "false";
  await db.update(jobs).set({ paid }).where(and(eq(jobs.id, id), eq(jobs.businessId, business.id)));
  refresh();
}

export async function deleteJob(form: FormData) {
  const { business } = await requireWriter();
  const id = z.string().uuid().parse(form.get("id"));
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.businessId, business.id)));
  refresh();
}

// ───────────── Expenses ─────────────

const expenseSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  ref: z.string().trim().max(60),
  date: isoDate,
  category: z.string().trim().min(1, "Pick a category").max(120),
  vendor: z.string().trim().max(160),
  amount: money,
});

export async function saveExpense(_: ActionState, form: FormData): Promise<ActionState> {
  const { business } = await requireWriter();
  const parsed = expenseSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...v } = parsed.data;
  if (id) {
    await db.update(expenses).set(v).where(and(eq(expenses.id, id), eq(expenses.businessId, business.id)));
  } else {
    const ref = v.ref || (await nextRef(expenses, business.id, "EXP-", 2000));
    await db.insert(expenses).values({ ...v, ref, businessId: business.id });
  }
  refresh();
  if (id) redirect("/app/expenses");
  return { ok: "Saved." };
}

export async function deleteExpense(form: FormData) {
  const { business } = await requireWriter();
  const id = z.string().uuid().parse(form.get("id"));
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.businessId, business.id)));
  refresh();
}

// ───────────── Settings ─────────────

const settingsSchema = z.object({
  name: z.string().trim().max(120),
  ownerName: z.string().trim().max(120),
  country: z.string().refine((c) => countries.some((x) => x.name === c), "Pick a country"),
  vatRegistered: z.string().optional().transform((v) => v === "on"),
  vatRateOverride: optionalPercent,
  reserveRateOverride: optionalPercent,
  fiscalYearStart: z.coerce.number().int().min(1).max(12),
  openingCash: z.coerce.number().finite().min(-1e10).max(1e10),
  reserveSetAside: money,
});

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const { business } = await requireOwner();
  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.update(businesses).set(parsed.data).where(eq(businesses.id, business.id));
  refresh();
  return { ok: "Settings saved." };
}

export async function saveReserve(_: ActionState, form: FormData): Promise<ActionState> {
  const { business } = await requireOwner();
  const parsed = money.safeParse(form.get("reserveSetAside"));
  if (!parsed.success) return { error: "Enter an amount of 0 or more." };
  await db.update(businesses).set({ reserveSetAside: parsed.data }).where(eq(businesses.id, business.id));
  refresh();
  return { ok: "Updated." };
}

/** Checklists: group is a month key ("2026-10") for the monthly list or "docs" for the accountant list. */
export async function toggleChecklist(form: FormData) {
  const { business } = await requireWriter();
  const group = z.string().regex(/^(\d{4}-\d{2}|docs)$/).parse(form.get("group"));
  const key = z.string().regex(/^[a-z-]{1,40}$/).parse(form.get("key"));
  const current = business.checklist ?? {};
  const g = { ...(current[group] ?? {}) };
  g[key] = !g[key];
  await db.update(businesses).set({ checklist: { ...current, [group]: g } }).where(eq(businesses.id, business.id));
  refresh();
}

// ───────────── Sample data ─────────────

function shiftMonths(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

/** Loads the niche's demo data, shifted so the newest month is the current month. */
export async function loadSample() {
  const { business } = await requireOwner();
  const { sample } = getNiche(business.niche);
  // Anchor on the newest job (not expenses, which can run a few days past the last job).
  const latest = sample.orders.map((r) => r.date).sort().at(-1)!;
  const [ly, lm] = latest.split("-").map(Number);
  const now = new Date();
  // Land the newest sample month on LAST month: every month is complete and nothing has to be
  // squeezed into the days of the current month that have passed so far.
  const offset = (now.getFullYear() - ly) * 12 + (now.getMonth() + 1 - lm) - 1;
  const today = now.toISOString().slice(0, 10);
  // A few stray expenses run past the last job; clamp them so nothing is in the future.
  const shift = (d: string) => {
    const s = shiftMonths(d, offset);
    return s > today ? today : s;
  };

  await db.transaction(async (tx) => {
    await wipe(tx, business.id);

    // Customers and their vehicles.
    const vehicleIds = new Map<string, string[]>(); // customer name -> vehicle ids
    const customerIds = new Map<string, string>();
    for (const c of sample.customers ?? []) {
      const [row] = await tx.insert(customers).values({ businessId: business.id, name: c.name, phone: c.phone, email: c.email }).returning({ id: customers.id });
      customerIds.set(c.name, row.id);
      if (c.vehicles.length) {
        const vs = await tx
          .insert(vehicles)
          .values(c.vehicles.map((v) => ({ ...v, businessId: business.id, customerId: row.id })))
          .returning({ id: vehicles.id });
        vehicleIds.set(c.name, vs.map((v) => v.id));
      }
    }
    if (!sample.customers) for (const [k, id] of await customerIdsByName(tx, business.id, sample.orders.map((o) => o.customer))) customerIds.set(k, id);

    // Jobs, each with a labor line and (if any) a parts line that add up to the original totals.
    const rows = sample.orders.map((o) => ({
      ...o,
      vehicle: undefined,
      date: shift(o.date),
      businessId: business.id,
      status: "completed",
      customerId: customerIds.get(o.customer) ?? customerIds.get(o.customer.toLowerCase()) ?? null,
      vehicleId: o.vehicle !== undefined ? (vehicleIds.get(o.customer)?.[o.vehicle] ?? null) : null,
      mileage: o.mileage ?? null,
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const batch = rows.slice(i, i + 200);
      const ids = await tx.insert(jobs).values(batch).returning({ id: jobs.id });
      const lines = batch.flatMap((o, k) => [
        ...(o.revenueB || o.costB
          ? [{ jobId: ids[k].id, businessId: business.id, kind: "labor", description: `${o.category}${o.hours ? ` (${o.hours} hrs)` : ""}`, qty: 1, unitPrice: o.revenueB, unitCost: o.costB, sort: 0 }]
          : []),
        ...(o.revenueA || o.costA ? [{ jobId: ids[k].id, businessId: business.id, kind: "part", description: `Parts: ${o.category}`, qty: 1, unitPrice: o.revenueA, unitCost: o.costA, sort: 1 }] : []),
      ]);
      if (lines.length) await tx.insert(jobLines).values(lines);
    }
    await tx.insert(expenses).values(sample.expenses.map((e) => ({ ...e, date: shift(e.date), businessId: business.id })));
    if (sample.parts?.length) await tx.insert(parts).values(sample.parts.map((p) => ({ ...p, businessId: business.id })));
  });
  refresh();
  redirect("/app");
}

/** Removes every entry: jobs (and their lines), expenses, customers (and vehicles) and parts. */
async function wipe(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], businessId: string) {
  await tx.delete(jobs).where(eq(jobs.businessId, businessId));
  await tx.delete(expenses).where(eq(expenses.businessId, businessId));
  await tx.delete(customers).where(eq(customers.businessId, businessId));
  await tx.delete(parts).where(eq(parts.businessId, businessId));
}

export async function clearData() {
  const { business } = await requireOwner();
  await db.transaction((tx) => wipe(tx, business.id));
  refresh();
  redirect("/app");
}

// ───────────── CSV import ─────────────

const JOB_ALIASES = {
  ref: ["ref", "id", "ro", "ro id", "ro number", "ro #", "repair order", "invoice", "invoice number", "invoice #", "order id", "job id"],
  date: ["date", "ro date", "invoice date", "job date", "order date", "created", "completed", "posted date"],
  category: ["category", "service type", "service", "job type", "type", "service category"],
  customer: ["customer", "customer name", "client", "name"],
  revenueA: ["parts revenue", "parts sales", "parts", "parts total", "parts price", "revenue a"],
  costA: ["parts cost", "parts cogs", "cost of parts", "cost a"],
  revenueB: ["labor revenue", "labor sales", "labor", "labour", "labor total", "labour revenue", "revenue b"],
  costB: ["labor cost", "labour cost", "tech cost", "technician cost", "cost b"],
  total: ["total", "total revenue", "revenue", "amount", "sales", "grand total"],
  totalCost: ["total cost", "cost", "cogs"],
  technician: ["technician", "tech", "technician name", "mechanic", "staff", "employee", "stylist", "provider"],
  hours: ["hours", "labor hours", "labour hours", "billed hours", "hrs", "hours billed"],
  paid: ["paid", "status", "payment status", "paid status", "is paid"],
  comeback: ["comeback", "is comeback", "redo", "warranty redo", "repeat repair"],
};

/** "Paid", "yes", "closed" → true; "unpaid", "open", "due" → false; blank → paid. */
function parsePaid(v: string) {
  const s = v.trim().toLowerCase();
  if (!s) return true;
  return !["unpaid", "no", "false", "0", "open", "due", "owing", "outstanding", "pending", "invoiced"].includes(s);
}
const parseYes = (v: string) => ["yes", "y", "true", "1", "x", "comeback"].includes(v.trim().toLowerCase());

const EXPENSE_ALIASES = {
  ref: ["ref", "id", "expense id", "reference", "transaction id", "bill number"],
  date: ["date", "expense date", "transaction date", "posted date", "bill date"],
  category: ["category", "account", "expense category", "type"],
  vendor: ["vendor", "payee", "supplier", "merchant", "description", "name"],
  amount: ["amount", "total", "cost", "debit", "expense", "value"],
};

export type ImportState = { error?: string; imported?: number; skipped?: string[]; kind?: string } | undefined;

const MAX_ROWS = 5000;

export async function importCsv(_: ImportState, form: FormData): Promise<ImportState> {
  const { business } = await requireOwner();
  const kind = form.get("kind") === "expenses" ? "expenses" : "jobs";
  const dateFormat = (["ymd", "mdy", "dmy"].includes(String(form.get("dateFormat"))) ? form.get("dateFormat") : "mdy") as DateFormat;
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file to import." };
  if (file.size > 4 * 1024 * 1024) return { error: "That file is over 4 MB. Split it into smaller files." };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { error: "The file needs a header row and at least one data row." };
  // Spreadsheets often have a title above the real header; use the first row that names a date column.
  const dateAliases = { date: (kind === "jobs" ? JOB_ALIASES : EXPENSE_ALIASES).date };
  const headerAt = Math.max(0, rows.slice(0, 10).findIndex((r) => mapColumns(r, dateAliases).date >= 0));
  const [header, ...data] = rows.slice(headerAt);
  if (data.length > MAX_ROWS) return { error: `Import up to ${MAX_ROWS} rows at a time.` };
  const first = headerAt + 2; // spreadsheet row number of the first data row

  const niche = getNiche(business.niche);
  const skipped: string[] = [];
  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");

  if (kind === "jobs") {
    const col = mapColumns(header, JOB_ALIASES);
    if (col.date < 0) return { error: "Couldn't find a date column. Name it “Date”." };
    if (col.revenueA < 0 && col.revenueB < 0 && col.total < 0)
      return { error: `Couldn't find revenue columns. Use “${niche.streams.a} Revenue” / “${niche.streams.b} Revenue”, or a single “Total”.` };
    const values: (typeof jobs.$inferInsert)[] = [];
    data.forEach((r, i) => {
      const line = i + first;
      const date = parseDate(cell(r, col.date), dateFormat);
      if (!date) return void skipped.push(`Row ${line}: date “${cell(r, col.date)}” isn't valid`);
      // A single total column is treated as stream B (labor/service) when streams aren't split.
      const split = col.revenueA >= 0 || col.revenueB >= 0;
      const nums = {
        revenueA: split ? parseMoney(cell(r, col.revenueA)) : 0,
        costA: parseMoney(cell(r, col.costA)),
        revenueB: split ? parseMoney(cell(r, col.revenueB)) : parseMoney(cell(r, col.total)),
        costB: col.costB >= 0 ? parseMoney(cell(r, col.costB)) : col.costA < 0 ? parseMoney(cell(r, col.totalCost)) : 0,
      };
      if (Object.values(nums).some((n) => !Number.isFinite(n) || n < 0 || n > 1e10))
        return void skipped.push(`Row ${line}: an amount isn't a valid number`);
      values.push({
        businessId: business.id,
        ref: cell(r, col.ref).slice(0, 60),
        date,
        category: (cell(r, col.category) || "Uncategorized").slice(0, 120),
        customer: cell(r, col.customer).slice(0, 160),
        ...nums,
        technician: cell(r, col.technician).slice(0, 80),
        hours: Math.max(0, Number.isFinite(parseMoney(cell(r, col.hours))) ? parseMoney(cell(r, col.hours)) : 0),
        paid: parsePaid(cell(r, col.paid)),
        comeback: parseYes(cell(r, col.comeback)),
      });
    });
    // Link each customer name to a customer record (created if new).
    const ids = await customerIdsByName(db, business.id, values.map((v) => v.customer ?? ""));
    for (const v of values) v.customerId = ids.get((v.customer ?? "").trim().replace(/\s+/g, " ").toLowerCase()) ?? null;
    for (let i = 0; i < values.length; i += 500) await db.insert(jobs).values(values.slice(i, i + 500));
    refresh();
    return { imported: values.length, skipped, kind: niche.job.plural.toLowerCase() };
  }

  const col = mapColumns(header, EXPENSE_ALIASES);
  if (col.date < 0 || col.amount < 0) return { error: "Couldn't find “Date” and “Amount” columns." };
  const values: (typeof expenses.$inferInsert)[] = [];
  data.forEach((r, i) => {
    const line = i + first;
    const date = parseDate(cell(r, col.date), dateFormat);
    if (!date) return void skipped.push(`Row ${line}: date “${cell(r, col.date)}” isn't valid`);
    // Bank exports often show spending as negative numbers.
    const amount = Math.abs(parseMoney(cell(r, col.amount)));
    if (!Number.isFinite(amount) || amount > 1e10) return void skipped.push(`Row ${line}: amount isn't a valid number`);
    values.push({
      businessId: business.id,
      ref: cell(r, col.ref).slice(0, 60),
      date,
      category: (cell(r, col.category) || "Other").slice(0, 120),
      vendor: cell(r, col.vendor).slice(0, 160),
      amount,
    });
  });
  for (let i = 0; i < values.length; i += 500) await db.insert(expenses).values(values.slice(i, i + 500));
  refresh();
  return { imported: values.length, skipped, kind: "expenses" };
}

// ───────────── Excel workbook import (ProfitIQS Essential / Elite) ─────────────

export type WorkbookState = { error?: string; summary?: string[] } | undefined;

export async function importWorkbook(_: WorkbookState, form: FormData): Promise<WorkbookState> {
  const { business } = await requireOwner();
  const file = form.get("file");
  const replace = form.get("mode") === "replace";
  if (!(file instanceof File) || file.size === 0) return { error: "Choose your ProfitIQS .xlsx workbook." };
  if (file.size > 4 * 1024 * 1024) return { error: "That file is over 4 MB." };
  if (!(await rateLimit(`wb-import:${business.id}`, 10, 3600))) return { error: "Too many imports in the last hour. Try again later." };

  const { parseWorkbook } = await import("@/lib/workbook");
  let wb;
  try {
    wb = await parseWorkbook(await file.arrayBuffer());
  } catch (e) {
    return { error: e instanceof Error && e.message.startsWith("This doesn't") ? e.message : "Couldn't read that file. Make sure it's an .xlsx workbook (not .xls or .csv)." };
  }
  if (!wb.jobs.length && !wb.expenses.length) return { error: "The workbook has no repair orders or expenses to import." };

  await db.transaction(async (tx) => {
    if (replace) await wipe(tx, business.id);

    // Customers (Elite has a customer database; Essential has names on each RO).
    const customerByKey = new Map<string, string>();
    for (let i = 0; i < wb.customers.length; i += 500) {
      const batch = wb.customers.slice(i, i + 500);
      const rows = await tx.insert(customers).values(batch.map((c) => ({ businessId: business.id, name: c.name, phone: c.phone, email: c.email }))).returning({ id: customers.id });
      batch.forEach((c, k) => customerByKey.set(c.key, rows[k].id));
    }
    const byName = await customerIdsByName(tx, business.id, wb.jobs.filter((j) => !j.customerKey || !customerByKey.has(j.customerKey)).map((j) => j.customer));
    const vehicleByKey = new Map<string, string>();
    const vs = wb.vehicles.filter((v) => customerByKey.has(v.customerKey));
    for (let i = 0; i < vs.length; i += 500) {
      const batch = vs.slice(i, i + 500);
      const rows = await tx
        .insert(vehicles)
        .values(batch.map(({ key: _k, customerKey, ...v }) => ({ ...v, businessId: business.id, customerId: customerByKey.get(customerKey)! })))
        .returning({ id: vehicles.id });
      batch.forEach((v, k) => vehicleByKey.set(v.key, rows[k].id));
    }

    for (let i = 0; i < wb.jobs.length; i += 400) {
      const batch = wb.jobs.slice(i, i + 400);
      const rows = await tx
        .insert(jobs)
        .values(
          batch.map(({ customerKey, vehicleKey, ...j }) => ({
            ...j,
            businessId: business.id,
            customerId: (customerKey && customerByKey.get(customerKey)) || byName.get(j.customer.trim().replace(/\s+/g, " ").toLowerCase()) || null,
            vehicleId: (vehicleKey && vehicleByKey.get(vehicleKey)) || null,
          })),
        )
        .returning({ id: jobs.id });
      const lines = batch.flatMap((j, k) => [
        ...(j.revenueB || j.costB
          ? [{ jobId: rows[k].id, businessId: business.id, kind: "labor", description: `${j.category}${j.hours ? ` (${j.hours} hrs)` : ""}`, qty: 1, unitPrice: j.revenueB, unitCost: j.costB, sort: 0 }]
          : []),
        ...(j.revenueA || j.costA ? [{ jobId: rows[k].id, businessId: business.id, kind: "part", description: `Parts: ${j.category}`, qty: 1, unitPrice: j.revenueA, unitCost: j.costA, sort: 1 }] : []),
      ]);
      if (lines.length) await tx.insert(jobLines).values(lines);
    }
    for (let i = 0; i < wb.expenses.length; i += 500) await tx.insert(expenses).values(wb.expenses.slice(i, i + 500).map((e) => ({ ...e, businessId: business.id })));
    for (let i = 0; i < wb.parts.length; i += 500) await tx.insert(parts).values(wb.parts.slice(i, i + 500).map((p) => ({ ...p, businessId: business.id })));

    // Essential workbooks carry the shop's setup; fill in only what's still blank/default.
    const s = wb.settings;
    const patch: Partial<typeof businesses.$inferInsert> = {};
    if (s.country && countries.some((c) => c.name === s.country)) patch.country = s.country;
    if (s.businessName && s.businessName !== "Your Auto Repair Shop LLC" && !business.name) patch.name = s.businessName;
    if (s.openingCash && !business.openingCash) patch.openingCash = s.openingCash;
    if (Object.keys(patch).length) await tx.update(businesses).set(patch).where(eq(businesses.id, business.id));
  });
  refresh();

  const n = (x: number, w: string) => `${x.toLocaleString("en-US")} ${w}`;
  return {
    summary: [
      `${wb.edition} workbook imported${replace ? " (replaced your previous data)" : ""}:`,
      n(wb.jobs.length, "repair orders") + (wb.jobs.some((j) => j.status === "open") ? ` (${wb.jobs.filter((j) => j.status === "open").length} still open)` : ""),
      n(wb.expenses.length, "expenses"),
      ...(wb.customers.length ? [n(wb.customers.length, "customers"), n(wb.vehicles.length, "vehicles")] : []),
      ...(wb.parts.length ? [n(wb.parts.length, "inventory parts")] : []),
    ],
  };
}
