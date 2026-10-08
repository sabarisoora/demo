// Calculations behind the Elite reports. Pure functions, unit-tested in elite-metrics.test.ts.
import type { Goals, Niche } from "@/niches/types";
import { jobCost, jobProfit, jobRevenue, lastMonths, monthKey, type ExpenseRow, type JobRow } from "./metrics";

type CustomerJob = JobRow & { customer: string };

const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0);
const ratio = (a: number, b: number) => (b === 0 ? 0 : a / b);
const DAY = 24 * 60 * 60 * 1000;
const isoDay = (d: Date) => `${monthKey(d)}-${String(d.getDate()).padStart(2, "0")}`;

// ───────────── Trailing twelve months ─────────────

/** Totals for the last 12 months including the current one (the workbook's "TTM"). */
export function ttmSummary(jobs: JobRow[], expenses: ExpenseRow[], today: Date) {
  const start = `${lastMonths(today, 12)[0]}-01`;
  const j = jobs.filter((x) => x.date >= start);
  const e = expenses.filter((x) => x.date >= start);
  const revenue = sum(j, jobRevenue);
  const directCost = sum(j, jobCost);
  const overhead = sum(e, (x) => x.amount);
  const netProfit = revenue - directCost - overhead;
  return {
    revenue,
    directCost,
    overhead,
    grossProfit: revenue - directCost,
    netProfit,
    grossMargin: ratio(revenue - directCost, revenue),
    netMargin: ratio(netProfit, revenue),
    jobCount: j.length,
    avgTicket: ratio(revenue, j.length),
    revenueA: sum(j, (x) => x.revenueA),
    revenueB: sum(j, (x) => x.revenueB),
  };
}
export type Ttm = ReturnType<typeof ttmSummary>;

// ───────────── KPI scorecard ─────────────

export type ScoreRow = { key: keyof Goals; label: string; goal: number; actual: number; format: "money" | "percent" | "count"; progress: number; onTarget: boolean };

export function scorecard(t: Ttm, goals: Goals, niche: Niche): ScoreRow[] {
  const rows: [keyof Goals, string, number, ScoreRow["format"]][] = [
    ["revenue", "Annual revenue", t.revenue, "money"],
    ["netProfit", "Annual net profit", t.netProfit, "money"],
    ["avgTicket", `Average ${niche.job.short} value`, t.avgTicket, "money"],
    ["jobCount", `${niche.job.plural} per year`, t.jobCount, "count"],
    ["grossMargin", "Gross margin", t.grossMargin, "percent"],
    ["netMargin", "Net margin", t.netMargin, "percent"],
  ];
  return rows.map(([key, label, actual, format]) => ({
    key,
    label,
    goal: goals[key],
    actual,
    format,
    progress: ratio(actual, goals[key]),
    onTarget: actual >= goals[key],
  }));
}

// ───────────── Benchmarks ─────────────

export type BenchRow = { label: string; yours: number; benchmark: number; format: "money" | "percent" | "ratio"; better: boolean; hint: string };

export function benchmarkRows(t: Ttm, niche: Niche): BenchRow[] {
  const b = niche.benchmarks;
  const { a, b: sb } = niche.streams;
  const streamRatio = ratio(t.revenueA, t.revenueB);
  return [
    { label: `Average ${niche.job.short} value`, yours: t.avgTicket, benchmark: b.avgTicket, format: "money", better: t.avgTicket >= b.avgTicket, hint: "Raise with inspections, recommended services and package pricing." },
    { label: "Gross margin", yours: t.grossMargin, benchmark: b.grossMargin, format: "percent", better: t.grossMargin >= b.grossMargin, hint: `Review ${a.toLowerCase()} markup and your ${sb.toLowerCase()} rate.` },
    { label: "Net margin", yours: t.netMargin, benchmark: b.netMargin, format: "percent", better: t.netMargin >= b.netMargin, hint: "Overhead is the usual gap between gross and net." },
    { label: `${a}-to-${sb.toLowerCase()} revenue`, yours: streamRatio, benchmark: b.streamRatio, format: "ratio", better: streamRatio >= b.streamRatio, hint: `How much ${a.toLowerCase()} you sell per unit of ${sb.toLowerCase()}.` },
  ];
}

// ───────────── Customers ─────────────

export type Segment = "VIP" | "Core" | "Occasional";

export function segmentOf(revenue: number, s: Niche["segments"]): Segment {
  return revenue >= s.vip ? "VIP" : revenue >= s.core ? "Core" : "Occasional";
}

/** Customers keyed by name (case/space-insensitive), with lifetime value, visits and recency. */
export function customerInsights(jobs: CustomerJob[], niche: Niche, today: Date, atRiskDays = 180) {
  const map = new Map<string, { name: string; revenue: number; profit: number; visits: number; first: string; last: string }>();
  for (const j of jobs) {
    const name = j.customer.trim().replace(/\s+/g, " ");
    if (!name) continue;
    const key = name.toLowerCase();
    const c = map.get(key) ?? { name, revenue: 0, profit: 0, visits: 0, first: j.date, last: j.date };
    c.revenue += jobRevenue(j);
    c.profit += jobProfit(j);
    c.visits += 1;
    if (j.date < c.first) c.first = j.date;
    if (j.date > c.last) c.last = j.date;
    map.set(key, c);
  }
  const all = [...map.values()].map((c) => ({ ...c, segment: segmentOf(c.revenue, niche.segments), avgTicket: c.revenue / c.visits }));
  all.sort((x, y) => y.revenue - x.revenue);

  const totalRevenue = sum(all, (c) => c.revenue);
  const cutoff = isoDay(new Date(today.getTime() - atRiskDays * DAY));
  const newSince = isoDay(new Date(today.getTime() - 90 * DAY));
  const segments = (["VIP", "Core", "Occasional"] as Segment[]).map((segment) => {
    const cs = all.filter((c) => c.segment === segment);
    const revenue = sum(cs, (c) => c.revenue);
    return { segment, count: cs.length, revenue, share: ratio(revenue, totalRevenue), avg: ratio(revenue, cs.length) };
  });

  return {
    customers: all,
    top: all.slice(0, 25),
    segments,
    count: all.length,
    repeatRate: ratio(all.filter((c) => c.visits >= 2).length, all.length),
    top10Share: ratio(sum(all.slice(0, 10), (c) => c.revenue), totalRevenue),
    newCustomers: all.filter((c) => c.first >= newSince).length,
    // Regulars (2+ visits) who haven't been back in `atRiskDays`: the win-back list.
    atRisk: all.filter((c) => c.visits >= 2 && c.last < cutoff),
    atRiskDays,
    unnamedJobs: jobs.filter((j) => !j.customer.trim()).length,
  };
}

// ───────────── Monthly business review ─────────────

export function monthFigures(jobs: JobRow[], expenses: ExpenseRow[], month: string) {
  const j = jobs.filter((x) => monthKey(x.date) === month);
  const e = expenses.filter((x) => monthKey(x.date) === month);
  const revenue = sum(j, jobRevenue);
  const directCost = sum(j, jobCost);
  const overhead = sum(e, (x) => x.amount);
  const netProfit = revenue - directCost - overhead;
  return {
    month,
    revenue,
    revenueA: sum(j, (x) => x.revenueA),
    revenueB: sum(j, (x) => x.revenueB),
    grossProfit: revenue - directCost,
    grossMargin: ratio(revenue - directCost, revenue),
    overhead,
    totalExpenses: directCost + overhead,
    netProfit,
    netMargin: ratio(netProfit, revenue),
    jobCount: j.length,
    avgTicket: ratio(revenue, j.length),
    hasData: j.length + e.length > 0,
  };
}
export type MonthFigures = ReturnType<typeof monthFigures>;

export function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + by, 1));
}

/** Percent change, or null when there's nothing to compare against. */
export function change(now: number, before: number) {
  return before === 0 ? null : (now - before) / Math.abs(before);
}

export function monthReview(jobs: JobRow[], expenses: ExpenseRow[], month: string) {
  return {
    current: monthFigures(jobs, expenses, month),
    prior: monthFigures(jobs, expenses, shiftMonth(month, -1)),
    lastYear: monthFigures(jobs, expenses, shiftMonth(month, -12)),
  };
}

/** Months that have any entries, newest first. */
export function monthsWithData(jobs: { date: string }[], expenses: { date: string }[]) {
  return [...new Set([...jobs, ...expenses].map((r) => monthKey(r.date)))].sort().reverse();
}

// ───────────── Cash flow ─────────────

/**
 * Cash basis view: revenue counted as collected in the month of the job, all costs paid that month.
 * Cash starts from the opening balance and includes everything logged before the 12-month window.
 */
export function cashFlow(jobs: JobRow[], expenses: ExpenseRow[], openingCash: number, today: Date) {
  const months = lastMonths(today, 12);
  const start = `${months[0]}-01`;
  const before =
    openingCash + sum(jobs.filter((j) => j.date < start), jobProfit) - sum(expenses.filter((e) => e.date < start), (e) => e.amount);
  let cash = before;
  const rows = months.map((month) => {
    const f = monthFigures(jobs, expenses, month);
    const net = f.revenue - f.totalExpenses;
    cash += net;
    return { month, inflow: f.revenue, outflow: f.totalExpenses, net, cash };
  });
  // Average outflow of the last 3 complete months (the current month is partial).
  const complete = rows.slice(-4, -1);
  const avgOutflow = ratio(sum(complete, (r) => r.outflow), complete.length);
  return {
    rows,
    startingCash: before,
    endingCash: cash,
    negativeMonths: rows.filter((r) => r.net < 0).length,
    avgOutflow,
    runwayMonths: avgOutflow > 0 ? Math.max(cash, 0) / avgOutflow : null,
    lowest: rows.reduce((m, r) => (r.cash < m.cash ? r : m), rows[0]),
  };
}
