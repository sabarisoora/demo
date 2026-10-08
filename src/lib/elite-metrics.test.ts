import { describe, expect, it } from "vitest";
import { autoRepair } from "@/niches/auto-repair";
import { benchmarkRows, cashFlow, change, customerInsights, monthReview, monthsWithData, scorecard, segmentOf, shiftMonth, ttmSummary } from "./elite-metrics";
import { taxSummary } from "./metrics";

const { orders, expenses } = autoRepair.sample;
const today = new Date(2026, 6, 15); // sample covers Aug 2025 - Jul 2026

describe("ttm, scorecard, benchmarks", () => {
  const t = ttmSummary(orders, expenses, today);
  it("TTM equals all-time for the 12-month sample", () => {
    const all = taxSummary({ country: "United States", vatRegistered: false, vatRateOverride: null, reserveRateOverride: null, openingCash: 0, reserveSetAside: 0, fiscalYearStart: 1 }, orders, expenses.filter((e) => e.date <= "2026-07-31"), autoRepair.expenseCategories);
    expect(t.revenue).toBeCloseTo(all.revenue, 2);
    expect(t.jobCount).toBe(220);
    expect(t.avgTicket).toBeCloseTo(all.revenue / 220, 6);
  });
  it("scorecard progress and targets", () => {
    const rows = scorecard(t, { ...autoRepair.defaultGoals, revenue: t.revenue / 2 }, autoRepair);
    const rev = rows.find((r) => r.key === "revenue")!;
    expect(rev.progress).toBeCloseTo(2, 6);
    expect(rev.onTarget).toBe(true);
    expect(rows).toHaveLength(6);
  });
  it("benchmarks compare against niche reference points", () => {
    const rows = benchmarkRows(t, autoRepair);
    expect(rows[0].benchmark).toBe(450);
    expect(rows[3].yours).toBeCloseTo(t.revenueA / t.revenueB, 6);
  });
});

describe("customers", () => {
  it("segments follow the workbook thresholds", () => {
    expect(segmentOf(1500, autoRepair.segments)).toBe("VIP");
    expect(segmentOf(1499.99, autoRepair.segments)).toBe("Core");
    expect(segmentOf(600, autoRepair.segments)).toBe("Core");
    expect(segmentOf(10, autoRepair.segments)).toBe("Occasional");
  });

  it("groups by name ignoring case/spacing and finds lapsed regulars", () => {
    const j = (date: string, customer: string, rev: number) => ({ date, customer, category: "x", revenueA: rev, costA: 0, revenueB: 0, costB: 0 });
    const ins = customerInsights(
      [j("2025-01-10", "Ann Lee", 1000), j("2025-02-10", " ann  lee", 700), j("2026-07-01", "Bo", 100), j("2026-07-02", "", 50)],
      autoRepair,
      today,
    );
    expect(ins.count).toBe(2);
    expect(ins.top[0]).toMatchObject({ name: "Ann Lee", visits: 2, revenue: 1700, segment: "VIP" });
    expect(ins.atRisk.map((c) => c.name)).toEqual(["Ann Lee"]);
    expect(ins.repeatRate).toBe(0.5);
    expect(ins.unnamedJobs).toBe(1);
    expect(ins.newCustomers).toBe(1);
  });

  it("segment revenue adds up on the sample", () => {
    const ins = customerInsights(orders, autoRepair, today);
    const segTotal = ins.segments.reduce((s, x) => s + x.revenue, 0);
    const total = ins.customers.reduce((s, c) => s + c.revenue, 0);
    expect(segTotal).toBeCloseTo(total, 6);
    expect(ins.segments.reduce((s, x) => s + x.count, 0)).toBe(ins.count);
  });
});

describe("monthly review and cash flow", () => {
  it("compares month, prior month and last year", () => {
    const r = monthReview(orders, expenses, "2026-07");
    expect(r.prior.month).toBe("2026-06");
    expect(r.lastYear.month).toBe("2025-07");
    expect(r.lastYear.hasData).toBe(false);
    expect(r.current.netProfit).toBeCloseTo(r.current.revenue - r.current.totalExpenses, 6);
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(change(110, 100)).toBeCloseTo(0.1, 9);
    expect(change(5, 0)).toBeNull();
    expect(monthsWithData(orders, expenses)[0]).toBe("2026-08");
  });

  it("cumulative cash = opening + everything logged", () => {
    const cf = cashFlow(orders, expenses, 5000, today);
    expect(cf.rows).toHaveLength(12);
    const inWindow = cf.rows.reduce((s, r) => s + r.net, 0);
    expect(cf.endingCash).toBeCloseTo(cf.startingCash + inWindow, 6);
    expect(cf.startingCash).toBe(5000); // nothing before Aug 2025
    expect(cf.runwayMonths).toBeGreaterThan(0);
  });
});
