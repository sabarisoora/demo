"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, businesses, expenses, jobs } from "@/db";
import { requireSession } from "@/lib/auth";
import { countries } from "@/lib/countries";
import { mapColumns, parseCsv, parseDate, parseMoney, type DateFormat } from "@/lib/csv";
import { getNiche } from "@/niches";

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
});

async function nextRef(table: typeof jobs | typeof expenses, businessId: string, prefix: string, start: number) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(eq(table.businessId, businessId));
  return `${prefix}${start + n}`;
}

export async function saveJob(_: ActionState, form: FormData): Promise<ActionState> {
  const { business } = await requireSession();
  const parsed = jobSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...v } = parsed.data;
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

export async function deleteJob(form: FormData) {
  const { business } = await requireSession();
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
  const { business } = await requireSession();
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
  const { business } = await requireSession();
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
  const { business } = await requireSession();
  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.update(businesses).set(parsed.data).where(eq(businesses.id, business.id));
  refresh();
  return { ok: "Settings saved." };
}

export async function saveReserve(_: ActionState, form: FormData): Promise<ActionState> {
  const { business } = await requireSession();
  const parsed = money.safeParse(form.get("reserveSetAside"));
  if (!parsed.success) return { error: "Enter an amount of 0 or more." };
  await db.update(businesses).set({ reserveSetAside: parsed.data }).where(eq(businesses.id, business.id));
  refresh();
  return { ok: "Updated." };
}

/** Checklists: group is a month key ("2026-10") for the monthly list or "docs" for the accountant list. */
export async function toggleChecklist(form: FormData) {
  const { business } = await requireSession();
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
  const { business } = await requireSession();
  const { sample } = getNiche(business.niche);
  // Anchor on the newest job (not expenses, which can run a few days past the last job).
  const latest = sample.orders.map((r) => r.date).sort().at(-1)!;
  const [ly, lm] = latest.split("-").map(Number);
  const now = new Date();
  const offset = (now.getFullYear() - ly) * 12 + (now.getMonth() + 1 - lm);
  const today = now.toISOString().slice(0, 10);
  // Shifting can push a few late-month rows past today; clamp them so nothing is in the future.
  const shift = (d: string) => {
    const s = shiftMonths(d, offset);
    return s > today ? today : s;
  };

  await db.transaction(async (tx) => {
    await tx.delete(jobs).where(eq(jobs.businessId, business.id));
    await tx.delete(expenses).where(eq(expenses.businessId, business.id));
    await tx.insert(jobs).values(sample.orders.map((o) => ({ ...o, date: shift(o.date), businessId: business.id })));
    await tx.insert(expenses).values(sample.expenses.map((e) => ({ ...e, date: shift(e.date), businessId: business.id })));
  });
  refresh();
  redirect("/app");
}

export async function clearData() {
  const { business } = await requireSession();
  await db.transaction(async (tx) => {
    await tx.delete(jobs).where(eq(jobs.businessId, business.id));
    await tx.delete(expenses).where(eq(expenses.businessId, business.id));
  });
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
};

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
  const { business } = await requireSession();
  const kind = form.get("kind") === "expenses" ? "expenses" : "jobs";
  const dateFormat = (["ymd", "mdy", "dmy"].includes(String(form.get("dateFormat"))) ? form.get("dateFormat") : "mdy") as DateFormat;
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file to import." };
  if (file.size > 5 * 1024 * 1024) return { error: "That file is over 5 MB. Split it into smaller files." };

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
      });
    });
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
