// Calculations behind the Elite reports. Pure functions, unit-tested in elite-metrics.test.ts.
import type { Goals, Niche } from "@/niches/types";
import { jobCost, jobProfit, jobRevenue, lastMonths, monthKey, type ExpenseRow, type JobRow } from "./metrics";

type CustomerJob = JobRow & { customer: string };
/** A job with the optional detail fields (technician, hours, payment, comeback). */
export type DetailJob = JobRow & { customer?: string; ref?: string };

/** True once a business has started recording any job details. */
export const tracksDetails = (jobs: DetailJob[]) => jobs.some((j) => !!j.technician || (j.hours ?? 0) > 0 || j.comeback);

const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0);
const ratio = (a: number, b: number) => (b === 0 ? 0 : a / b);
const DAY = 24 * 60 * 60 * 1000;
const isoDay = (d: Date) => `${monthKey(d)}-${String(d.getDate()).padStart(2, "0")}`;

// ───────────── Trailing twelve months ─────────────

/** Totals for the last 12 months including the current one (the workbook's "TTM"). */
export function ttmSummary(jobs: DetailJob[], expenses: ExpenseRow[], today: Date) {
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
    comebacks: j.filter((x) => x.comeback).length,
    tracksDetails: tracksDetails(j),
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

/** Your trailing-12-month numbers vs the niche's reference points ([] when the niche has none). */
export function benchmarkRows(t: Ttm, niche: Niche): BenchRow[] {
  const b = niche.benchmarks;
  if (!b) return [];
  const { a, b: sb } = niche.streams;
  const streamRatio = ratio(t.revenueA, t.revenueB);
  const rows: BenchRow[] = [
    { label: `Average ${niche.job.short} value`, yours: t.avgTicket, benchmark: b.avgTicket, format: "money", better: t.avgTicket >= b.avgTicket, hint: "Raise with inspections, recommended services and package pricing." },
    { label: "Gross margin", yours: t.grossMargin, benchmark: b.grossMargin, format: "percent", better: t.grossMargin >= b.grossMargin, hint: `Review ${a.toLowerCase()} markup and your ${sb.toLowerCase()} rate.` },
    { label: "Net margin", yours: t.netMargin, benchmark: b.netMargin, format: "percent", better: t.netMargin >= b.netMargin, hint: "Overhead is the usual gap between gross and net." },
    { label: `${a}-to-${sb.toLowerCase()} revenue`, yours: streamRatio, benchmark: b.streamRatio, format: "ratio", better: streamRatio >= b.streamRatio, hint: `How much ${a.toLowerCase()} you sell per unit of ${sb.toLowerCase()}.` },
  ];
  // Only meaningful once comebacks are being recorded; otherwise 0% would look falsely good.
  if (t.tracksDetails) {
    const rate = ratio(t.comebacks, t.jobCount);
    rows.push({ label: `${niche.details.comeback} rate`, yours: rate, benchmark: b.comebackRate, format: "percent", better: rate <= b.comebackRate, hint: "Repeat repairs cost labor and trust; check them by technician." });
  }
  return rows;
}

// ───────────── Technicians and comebacks ─────────────

export function technicianStats(jobs: DetailJob[]) {
  const map = new Map<string, DetailJob[]>();
  for (const j of jobs) {
    const name = (j.technician ?? "").trim();
    if (!name) continue;
    map.set(name, [...(map.get(name) ?? []), j]);
  }
  const rows = [...map.entries()].map(([name, js]) => {
    const revenue = sum(js, jobRevenue);
    const hours = sum(js, (j) => j.hours ?? 0);
    const laborRevenue = sum(js, (j) => j.revenueB);
    const comebacks = js.filter((j) => j.comeback);
    return {
      name,
      jobs: js.length,
      hours,
      revenue,
      profit: sum(js, jobProfit),
      laborRevenue,
      // Effective labor rate: what each billed hour actually brought in.
      ratePerHour: ratio(laborRevenue, hours),
      revenuePerHour: ratio(revenue, hours),
      avgTicket: ratio(revenue, js.length),
      comebacks: comebacks.length,
      comebackRate: ratio(comebacks.length, js.length),
      comebackCost: sum(comebacks, jobCost),
    };
  });
  rows.sort((x, y) => y.revenue - x.revenue);
  return { rows, unassigned: jobs.filter((j) => !(j.technician ?? "").trim()).length };
}

/** Comebacks: repeat repairs. Their cost is the labor and parts spent redoing work. */
export function comebackStats(jobs: DetailJob[]) {
  const cbs = jobs.filter((j) => j.comeback);
  const byCategory = [...new Set(cbs.map((j) => j.category))]
    .map((category) => {
      const c = cbs.filter((j) => j.category === category);
      const all = jobs.filter((j) => j.category === category).length;
      return { category, count: c.length, rate: ratio(c.length, all), cost: sum(c, jobCost) };
    })
    .sort((x, y) => y.count - x.count);
  return {
    count: cbs.length,
    rate: ratio(cbs.length, jobs.length),
    cost: sum(cbs, jobCost),
    // Net cost after anything the customer was charged for the redo.
    netCost: Math.max(sum(cbs, jobCost) - sum(cbs, jobRevenue), 0),
    byCategory,
    recent: [...cbs].sort((x, y) => (x.date < y.date ? 1 : -1)).slice(0, 20),
  };
}

// ───────────── Accounts receivable ─────────────

export const AGING_BUCKETS = ["Current", "31–60 days", "61–90 days", "90+ days"] as const;
export type AgingBucket = (typeof AGING_BUCKETS)[number];

export function agingBucket(days: number): AgingBucket {
  return days <= 30 ? "Current" : days <= 60 ? "31–60 days" : days <= 90 ? "61–90 days" : "90+ days";
}

/** Unpaid jobs aged by days since the job date (the workbook's AR Center). */
export function receivables<J extends DetailJob>(jobs: J[], today: Date) {
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const open = jobs
    .filter((j) => j.paid === false)
    .map((j) => {
      const [y, m, d] = j.date.split("-").map(Number);
      const days = Math.max(0, Math.round((t - Date.UTC(y, m - 1, d)) / DAY));
      return { job: j, amount: jobRevenue(j), days, bucket: agingBucket(days) };
    })
    .sort((x, y) => y.days - x.days);
  const total = sum(open, (o) => o.amount);
  const buckets = AGING_BUCKETS.map((bucket) => {
    const b = open.filter((o) => o.bucket === bucket);
    const amount = sum(b, (o) => o.amount);
    return { bucket, count: b.length, amount, share: ratio(amount, total) };
  });
  const over90 = sum(open.filter((o) => o.days > 90), (o) => o.amount);
  return {
    open,
    total,
    buckets,
    over90,
    avgDays: ratio(sum(open, (o) => o.days * o.amount), total),
    currentShare: ratio(buckets[0].amount, total),
  };
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
