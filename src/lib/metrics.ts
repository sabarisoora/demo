// The calculation engine. Mirrors the Essential workbook's formulas (TAX & DEDUCTIONS,
// DASHBOARD, BUSINESS HEALTH SNAPSHOT, ACCOUNTANT EXPORT) and adds the Elite analyses.
// Pure functions only — no database access — so every number is unit-testable.
import { getCountry } from "./countries";
import type { Niche } from "@/niches/types";

export type JobRow = {
  date: string; // YYYY-MM-DD
  category: string;
  revenueA: number;
  costA: number;
  revenueB: number;
  costB: number;
  // Optional details (Elite reports).
  technician?: string;
  hours?: number;
  paid?: boolean;
  comeback?: boolean;
};
export type ExpenseRow = { date: string; category: string; amount: number };
export type Settings = {
  country: string;
  vatRegistered: boolean;
  vatRateOverride: number | null; // percent
  reserveRateOverride: number | null; // percent
  openingCash: number;
  reserveSetAside: number;
  fiscalYearStart: number; // 1-12
};

export type Status = "Excellent" | "Good" | "Needs Attention" | "Critical";
export type Period = "all" | "fy" | "12m";

const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0);
const ratio = (a: number, b: number, fallback = 0) => (b === 0 ? fallback : a / b);
export const jobRevenue = (j: JobRow) => j.revenueA + j.revenueB;
export const jobCost = (j: JobRow) => j.costA + j.costB;
export const jobProfit = (j: JobRow) => jobRevenue(j) - jobCost(j);

export function monthKey(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** The last `n` month keys ending with the month of `today`, oldest first. */
export function lastMonths(today: Date, n = 12): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(monthKey(new Date(today.getFullYear(), today.getMonth() - i, 1)));
  return out;
}

export function periodStart(period: Period, today: Date, fiscalYearStart: number): string | null {
  if (period === "all") return null;
  if (period === "12m") return `${lastMonths(today, 12)[0]}-01`;
  const startMonth = fiscalYearStart - 1;
  const year = today.getMonth() >= startMonth ? today.getFullYear() : today.getFullYear() - 1;
  return `${monthKey(new Date(year, startMonth, 1))}-01`;
}

export function filterPeriod<T extends { date: string }>(rows: T[], start: string | null): T[] {
  return start ? rows.filter((r) => r.date >= start) : rows;
}

export function statusFor(score: number): Status {
  return score >= 85 ? "Excellent" : score >= 65 ? "Good" : score >= 35 ? "Needs Attention" : "Critical";
}

export function rates(s: Settings) {
  const c = getCountry(s.country);
  return {
    country: c,
    vatRate: (s.vatRateOverride ?? c.vat) / 100,
    reserveRate: (s.reserveRateOverride ?? c.reserve) / 100,
  };
}

/** TAX & DEDUCTIONS sheet. */
export function taxSummary(s: Settings, jobs: JobRow[], expenses: ExpenseRow[], expenseCategories: string[]) {
  const { vatRate, reserveRate, country } = rates(s);
  const revenue = sum(jobs, jobRevenue);
  const directCost = sum(jobs, jobCost);
  const overhead = sum(expenses, (e) => e.amount);
  const totalExpenses = directCost + overhead;
  const netProfit = revenue - totalExpenses;
  const recommendedReserve = Math.max(netProfit, 0) * reserveRate;
  const reserveFunded = ratio(s.reserveSetAside, recommendedReserve);
  const outputVat = s.vatRegistered ? revenue * vatRate : 0;
  const inputVat = s.vatRegistered ? (overhead + sum(jobs, (j) => j.costA)) * vatRate : 0;

  const known = new Set(expenseCategories);
  const deductions = expenseCategories.map((category) => {
    // Rows with a category outside the niche list (e.g. from a CSV import) count as "Other".
    const amount = sum(
      expenses.filter((e) => e.category === category || (category === "Other" && !known.has(e.category))),
      (e) => e.amount,
    );
    return { category, amount, share: ratio(amount, overhead) };
  });

  return {
    country,
    revenue,
    directCost,
    overhead,
    totalExpenses,
    netProfit,
    netMargin: ratio(netProfit, revenue),
    reserveRate,
    recommendedReserve,
    reserveSetAside: s.reserveSetAside,
    reserveFunded,
    vatRate,
    vatRegistered: s.vatRegistered,
    outputVat,
    inputVat,
    netVat: outputVat - inputVat,
    deductions,
    totalDeductible: sum(deductions, (d) => d.amount),
    cashPosition: s.openingCash + netProfit,
  };
}
export type TaxSummary = ReturnType<typeof taxSummary>;

/** DASHBOARD monthly table: rolling 12 months of revenue vs. all expenses (direct + overhead). */
export function monthlySeries(jobs: JobRow[], expenses: ExpenseRow[], today: Date, n = 12) {
  return lastMonths(today, n).map((month) => {
    const mj = jobs.filter((j) => monthKey(j.date) === month);
    const me = expenses.filter((e) => monthKey(e.date) === month);
    const revenue = sum(mj, jobRevenue);
    const expensesTotal = sum(me, (e) => e.amount) + sum(mj, jobCost);
    return { month, revenue, expenses: expensesTotal, profit: revenue - expensesTotal, jobs: mj.length };
  });
}
export type MonthPoint = ReturnType<typeof monthlySeries>[number];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthName = (key: string) => MONTH_NAMES[Number(key.slice(5, 7)) - 1];

/**
 * The two most recent COMPLETE months [before, latest] for month-over-month checks.
 * The last entry of a rolling series is the current, partial month, so it's skipped.
 */
export function completeMonths(months: MonthPoint[]): [MonthPoint, MonthPoint] {
  const n = months.length;
  return n >= 3 ? [months[n - 3], months[n - 2]] : [months[0], months[n - 1]];
}

/** BUSINESS HEALTH SNAPSHOT sheet. */
export function healthSnapshot(t: TaxSummary, months: MonthPoint[]) {
  const [lastMonth, thisMonth] = completeMonths(months);
  const monthlyBurn = t.totalExpenses / 12;
  const expenseShare = ratio(t.totalExpenses, t.revenue, 1);

  const profit = t.netProfit < 0 ? 10 : t.netMargin < 0.1 ? 40 : t.netMargin >= 0.2 ? 100 : 70;
  const cash = t.cashPosition < 0 ? 10 : t.cashPosition < monthlyBurn ? 40 : t.cashPosition >= monthlyBurn * 3 ? 100 : 70;
  const tax = t.reserveFunded >= 0.8 ? 100 : t.reserveFunded >= 0.5 ? 70 : t.reserveFunded >= 0.2 ? 40 : 10;
  const expense = expenseShare > 1 ? 10 : expenseShare > 0.85 ? 40 : expenseShare <= 0.7 ? 100 : 70;
  const trend =
    t.revenue <= 0
      ? 10
      : thisMonth.revenue < lastMonth.revenue
        ? 40
        : thisMonth.revenue >= lastMonth.revenue * 1.1
          ? 100
          : 70;

  const components = [
    { key: "profit", label: "Profit", score: profit, why: "Based on net margin" },
    { key: "cash", label: "Cash", score: cash, why: "Months of expenses covered by cash on hand" },
    { key: "tax", label: "Tax readiness", score: tax, why: "How much of the recommended tax reserve is funded" },
    { key: "expense", label: "Expense health", score: expense, why: "Total expenses as a share of revenue" },
    { key: "trend", label: "Revenue trend", score: trend, why: "Last complete month vs. the month before" },
  ].map((c) => ({ ...c, status: statusFor(c.score) }));
  const overall = sum(components, (c) => c.score) / components.length;
  return { components, overall, status: statusFor(overall) };
}

/** DASHBOARD "BUSINESS HEALTH" label. */
export function businessStatus(t: TaxSummary): Status {
  if (t.netProfit < 0) return "Critical";
  if (t.netMargin < 0.1 || t.reserveFunded < 0.3) return "Needs Attention";
  if (t.netMargin >= 0.2 && t.reserveFunded >= 0.8) return "Excellent";
  return "Good";
}

export type Insight = { ok: boolean; text: string };

/** DASHBOARD "INSIGHTS — WHAT THIS MEANS". */
export function insights(t: TaxSummary, months: MonthPoint[], niche: Niche): Insight[] {
  const [lastMonth, thisMonth] = completeMonths(months);
  const vs = `in ${monthName(thisMonth.month)} vs. ${monthName(lastMonth.month)}`;
  const pct = Math.round(niche.thresholds.netMargin * 100);
  return [
    t.netMargin < niche.thresholds.netMargin
      ? { ok: false, text: `Net margin is below the ${pct}% planning threshold. ${niche.copy.lowMarginTip}` }
      : { ok: true, text: `Net margin is healthy (${pct}%+).` },
    t.reserveFunded < 0.8
      ? { ok: false, text: "Tax reserve is underfunded. Set aside more to avoid a surprise bill." }
      : { ok: true, text: "Tax reserve is on track." },
    t.netProfit < 0
      ? { ok: false, text: "You're running at a loss: expenses exceed revenue for this period." }
      : { ok: true, text: "The business is profitable for this period." },
    thisMonth.revenue < lastMonth.revenue
      ? { ok: false, text: `Revenue is down ${vs}.` }
      : { ok: true, text: `Revenue is flat or up ${vs}.` },
    thisMonth.expenses > lastMonth.expenses
      ? { ok: false, text: `Expenses are up ${vs}.` }
      : { ok: true, text: `Expenses are flat or down ${vs}.` },
  ];
}

// ───────────────────────────── Elite ─────────────────────────────

/** Revenue, cost and margin by job category. */
export function categoryBreakdown(jobs: JobRow[], categories: string[]) {
  const seen = new Set(categories);
  const all = [...categories, ...new Set(jobs.map((j) => j.category).filter((c) => !seen.has(c)))];
  const revenueTotal = sum(jobs, jobRevenue);
  return all
    .map((category) => {
      const cj = jobs.filter((j) => j.category === category);
      const revenue = sum(cj, jobRevenue);
      const cost = sum(cj, jobCost);
      return {
        category,
        count: cj.length,
        revenue,
        cost,
        profit: revenue - cost,
        margin: ratio(revenue - cost, revenue),
        share: ratio(revenue, revenueTotal),
        avgTicket: ratio(revenue, cj.length),
        avgProfit: ratio(revenue - cost, cj.length),
        revenueA: sum(cj, (j) => j.revenueA),
        costA: sum(cj, (j) => j.costA),
        revenueB: sum(cj, (j) => j.revenueB),
        costB: sum(cj, (j) => j.costB),
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.profit - a.profit);
}

export type Leak = {
  key: string;
  title: string;
  metric: string;
  value: number;
  threshold: number;
  format: "money" | "percent" | "count";
  leaking: boolean;
  /** Estimated money lost per period to this leak (0 when healthy or not estimable). */
  impact: number;
  detail: string;
};

/** Elite "Profit Leak Detector": traffic-light checks with an estimated $ impact each. */
export function profitLeaks(t: TaxSummary, jobs: JobRow[], expenses: ExpenseRow[], months: MonthPoint[], niche: Niche): Leak[] {
  const th = niche.thresholds;
  const { a, b } = niche.streams;
  const leaks: Leak[] = [];

  // 1. Low-margin jobs: profit lost vs. pricing each at the threshold gross margin.
  const low = jobs.filter((j) => jobRevenue(j) > 0 && ratio(jobProfit(j), jobRevenue(j)) < th.jobGrossMargin);
  const lowLoss = sum(low, (j) => jobRevenue(j) * th.jobGrossMargin - jobProfit(j));
  const lowShare = ratio(low.length, jobs.length);
  leaks.push({
    key: "low-margin-jobs",
    title: `Low-margin ${niche.job.plural.toLowerCase()}`,
    metric: `${niche.job.plural} under ${Math.round(th.jobGrossMargin * 100)}% gross margin`,
    value: low.length,
    threshold: Math.ceil(jobs.length * 0.1),
    format: "count",
    leaking: lowShare > 0.1,
    impact: lowShare > 0.1 ? lowLoss : 0,
    detail: `${Math.round(lowShare * 100)}% of ${niche.job.plural.toLowerCase()}. Pricing them at ${Math.round(th.jobGrossMargin * 100)}% would add about this much profit.`,
  });

  // 2 & 3. Stream margins (e.g. parts and labor).
  for (const [key, label, rev, cost, target] of [
    ["stream-a", a, sum(jobs, (j) => j.revenueA), sum(jobs, (j) => j.costA), th.streamAMargin],
    ["stream-b", b, sum(jobs, (j) => j.revenueB), sum(jobs, (j) => j.costB), th.streamBMargin],
  ] as const) {
    const margin = ratio(rev - cost, rev);
    const leaking = rev > 0 && margin < target;
    leaks.push({
      key,
      title: `${label} margin`,
      metric: `${label} gross margin`,
      value: margin,
      threshold: target,
      format: "percent",
      leaking,
      impact: leaking ? rev * target - (rev - cost) : 0,
      detail: leaking
        ? `${label} is below the ${Math.round(target * 100)}% target. Review ${label.toLowerCase()} pricing and supplier costs.`
        : `${label} pricing covers its cost with room to spare.`,
    });
  }

  // 4. Overhead as a share of revenue.
  const overheadShare = ratio(t.overhead, t.revenue);
  const overLeak = t.revenue > 0 && overheadShare > th.overheadShare;
  leaks.push({
    key: "overhead",
    title: "Overhead creep",
    metric: "Overhead as % of revenue",
    value: overheadShare,
    threshold: th.overheadShare,
    format: "percent",
    leaking: overLeak,
    impact: overLeak ? t.overhead - t.revenue * th.overheadShare : 0,
    detail: overLeak
      ? `Biggest overhead line: ${[...t.deductions].sort((x, y) => y.amount - x.amount)[0]?.category ?? "n/a"}.`
      : "Rent, insurance and other fixed costs are in proportion to sales.",
  });

  // 5. Expense categories that grew fastest: last 3 months vs. the 3 before.
  const recent = new Set(months.slice(-3).map((m) => m.month));
  const prior = new Set(months.slice(-6, -3).map((m) => m.month));
  const growth = [...new Set(expenses.map((e) => e.category))]
    .map((category) => {
      const ce = expenses.filter((e) => e.category === category);
      const now = sum(ce.filter((e) => recent.has(monthKey(e.date))), (e) => e.amount);
      const before = sum(ce.filter((e) => prior.has(monthKey(e.date))), (e) => e.amount);
      return { category, now, before, delta: now - before };
    })
    .sort((x, y) => y.delta - x.delta)[0];
  const growthLeak = !!growth && growth.before > 0 && growth.now > growth.before * 1.25;
  leaks.push({
    key: "expense-growth",
    title: "Rising expense",
    metric: growth ? `${growth.category}: last 3 months vs. prior 3` : "Expense growth",
    value: growth && growth.before > 0 ? growth.now / growth.before - 1 : 0,
    threshold: 0.25,
    format: "percent",
    leaking: growthLeak,
    impact: growthLeak ? growth.delta : 0,
    detail: growthLeak ? `${growth.category} spending jumped. Check for price increases or duplicate charges.` : "No expense category is growing unusually fast.",
  });

  // 6. Losing categories.
  const losers = categoryBreakdown(jobs, niche.jobCategories).filter((c) => c.margin < th.jobGrossMargin);
  leaks.push({
    key: "weak-categories",
    title: "Weak service lines",
    metric: `Categories under ${Math.round(th.jobGrossMargin * 100)}% gross margin`,
    value: losers.length,
    threshold: 0,
    format: "count",
    leaking: losers.length > 0,
    impact: sum(losers, (c) => c.revenue * th.jobGrossMargin - c.profit),
    detail: losers.length ? `Reprice or upsell: ${losers.map((c) => c.category).join(", ")}.` : "Every service line clears the margin target.",
  });

  // 6b. Comebacks (repeat repairs): only once the business records them.
  const cbs = jobs.filter((j) => j.comeback);
  if (cbs.length || jobs.some((j) => j.technician || (j.hours ?? 0) > 0)) {
    const rate = ratio(cbs.length, jobs.length);
    const target = niche.benchmarks?.comebackRate ?? 0.03;
    const netCost = Math.max(sum(cbs, jobCost) - sum(cbs, jobRevenue), 0);
    leaks.push({
      key: "comebacks",
      title: `${niche.details.comeback} cost`,
      metric: `${niche.details.comeback} rate`,
      value: rate,
      threshold: target,
      format: "percent",
      leaking: rate > target,
      impact: rate > target ? netCost : 0,
      detail:
        rate > target
          ? `${cbs.length} repeat repairs cost about this much in labor and ${a.toLowerCase()}. See which technicians and services they come from.`
          : "Repeat repairs are at or below the target rate.",
    });
  }

  // 6c. Overdue invoices: unpaid more than 90 days (money at risk, not yet lost).
  const unpaid = jobs.filter((j) => j.paid === false);
  if (unpaid.length) {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const overdue = sum(unpaid.filter((j) => j.date < cutoff), jobRevenue);
    leaks.push({
      key: "overdue",
      title: "Overdue invoices",
      metric: "Unpaid for more than 90 days",
      value: overdue,
      threshold: 0,
      format: "money",
      leaking: overdue > 0,
      impact: 0,
      detail: overdue > 0 ? "The older a balance, the less likely it gets paid. Chase these first (see Receivables)." : "No balances older than 90 days.",
    });
  }

  // 7. Unfunded tax reserve (not lost money, but money that isn't really yours).
  const gap = Math.max(t.recommendedReserve - t.reserveSetAside, 0);
  leaks.push({
    key: "tax-gap",
    title: "Unfunded tax reserve",
    metric: "Recommended reserve not yet set aside",
    value: gap,
    threshold: t.recommendedReserve * 0.2,
    format: "money",
    leaking: t.reserveFunded < 0.8 && gap > 0,
    impact: 0,
    detail: "Not a loss yet, but this cash is owed to the tax office. Move it to a separate account.",
  });

  return leaks;
}

/** Elite forecast: least-squares trend on the last 12 months, projected 6 months ahead. */
export function forecast(months: MonthPoint[], today: Date, ahead = 6) {
  const fit = (ys: number[]) => {
    const n = ys.length;
    const mx = (n - 1) / 2;
    const my = ys.reduce((s, y) => s + y, 0) / n;
    let num = 0;
    let den = 0;
    ys.forEach((y, x) => {
      num += (x - mx) * (y - my);
      den += (x - mx) ** 2;
    });
    const slope = den === 0 ? 0 : num / den;
    return (x: number) => Math.max(0, my + slope * (x - mx));
  };
  // Ignore the current (partial) month so it doesn't drag the trend down.
  const history = months.slice(0, -1);
  const rev = fit(history.map((m) => m.revenue));
  const exp = fit(history.map((m) => m.expenses));
  return Array.from({ length: ahead }, (_, i) => {
    const x = history.length + 1 + i;
    const revenue = rev(x);
    const expensesF = exp(x);
    return {
      month: monthKey(new Date(today.getFullYear(), today.getMonth() + 1 + i, 1)),
      conservative: revenue * 0.9 - expensesF,
      expected: revenue - expensesF,
      aggressive: revenue * 1.1 - expensesF,
      revenue,
      expenses: expensesF,
    };
  });
}
