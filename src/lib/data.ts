import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, expenses, jobs, type Business } from "@/db";
import { filterPeriod, periodStart, type Period, type Settings } from "./metrics";

export function settingsOf(b: Business): Settings {
  return {
    country: b.country,
    vatRegistered: b.vatRegistered,
    vatRateOverride: b.vatRateOverride,
    reserveRateOverride: b.reserveRateOverride,
    openingCash: b.openingCash,
    reserveSetAside: b.reserveSetAside,
    fiscalYearStart: b.fiscalYearStart,
  };
}

export async function loadEntries(businessId: string) {
  const [j, e] = await Promise.all([
    db.select().from(jobs).where(eq(jobs.businessId, businessId)).orderBy(desc(jobs.date), desc(jobs.createdAt)),
    db.select().from(expenses).where(eq(expenses.businessId, businessId)).orderBy(desc(expenses.date), desc(expenses.createdAt)),
  ]);
  return { jobs: j, expenses: e };
}

export function parsePeriod(v: string | undefined): Period {
  return v === "fy" || v === "12m" ? v : "all";
}

/** Entries limited to the selected period (all time, fiscal year to date, last 12 months). */
export async function loadPeriod(b: Business, period: Period, today = new Date()) {
  const all = await loadEntries(b.id);
  const start = periodStart(period, today, b.fiscalYearStart);
  return { ...all, periodJobs: filterPeriod(all.jobs, start), periodExpenses: filterPeriod(all.expenses, start) };
}
