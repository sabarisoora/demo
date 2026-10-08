import { describe, expect, it } from "vitest";
import { autoRepair } from "@/niches/auto-repair";
import {
  businessStatus,
  forecast,
  healthSnapshot,
  jobProfit,
  monthlySeries,
  periodStart,
  profitLeaks,
  taxSummary,
  type Settings,
} from "./metrics";

const { orders, expenses } = autoRepair.sample;
const usDefaults: Settings = {
  country: "United States",
  vatRegistered: false,
  vatRateOverride: null,
  reserveRateOverride: null,
  openingCash: 0,
  reserveSetAside: 0,
  fiscalYearStart: 1,
};
const t = taxSummary(usDefaults, orders, expenses, autoRepair.expenseCategories);

// Expected values are the cached results Excel computed in the Essential workbook.
describe("matches the Essential workbook", () => {
  it("TAX & DEDUCTIONS profit summary", () => {
    expect(t.revenue).toBeCloseTo(262198.76, 2);
    expect(t.directCost).toBeCloseTo(129467.96, 2);
    expect(t.overhead).toBeCloseTo(59221.51, 2);
    expect(t.totalExpenses).toBeCloseTo(188689.47, 2);
    expect(t.netProfit).toBeCloseTo(73509.29, 2);
  });

  it("tax reserve and VAT", () => {
    expect(t.recommendedReserve).toBeCloseTo(19847.5083, 3);
    expect(t.reserveFunded).toBe(0);
    expect(t.netVat).toBe(0);
    expect(t.totalDeductible).toBeCloseTo(59221.51, 2);
  });

  it("DASHBOARD average RO profit", () => {
    const avg = orders.reduce((s, o) => s + jobProfit(o), 0) / orders.length;
    expect(avg).toBeCloseTo(603.3218, 3);
  });

  it("BUSINESS HEALTH SNAPSHOT components", () => {
    // Revenue grew >10% month over month, matching the workbook's cached trend score of 100.
    // The last point is the current (partial) month and is ignored by the trend.
    const months = [
      { month: "2026-06", revenue: 100, expenses: 0, profit: 0, jobs: 0 },
      { month: "2026-07", revenue: 120, expenses: 0, profit: 0, jobs: 0 },
      { month: "2026-08", revenue: 5, expenses: 0, profit: 0, jobs: 0 },
    ];
    const h = healthSnapshot(t, months);
    expect(h.components.map((c) => c.score)).toEqual([100, 100, 10, 70, 100]);
    expect(h.overall).toBe(76);
    expect(h.status).toBe("Good");
  });
});

describe("tax settings", () => {
  it("VAT on revenue minus VAT on overhead + parts when registered", () => {
    const uk = taxSummary({ ...usDefaults, country: "United Kingdom", vatRegistered: true }, orders, expenses, autoRepair.expenseCategories);
    const parts = orders.reduce((s, o) => s + o.costA, 0);
    expect(uk.outputVat).toBeCloseTo(t.revenue * 0.2, 6);
    expect(uk.inputVat).toBeCloseTo((t.overhead + parts) * 0.2, 6);
  });

  it("overrides beat country defaults", () => {
    const o = taxSummary({ ...usDefaults, reserveRateOverride: 30, reserveSetAside: 11025 }, orders, expenses, autoRepair.expenseCategories);
    expect(o.reserveRate).toBe(0.3);
    expect(o.reserveFunded).toBeCloseTo(11025 / (t.netProfit * 0.3), 6);
  });

  it("no reserve is recommended on a loss", () => {
    const loss = taxSummary(usDefaults, [], expenses, autoRepair.expenseCategories);
    expect(loss.netProfit).toBeLessThan(0);
    expect(loss.recommendedReserve).toBe(0);
    expect(businessStatus(loss)).toBe("Critical");
  });

  it("unknown expense categories count as Other", () => {
    const x = taxSummary(usDefaults, [], [{ date: "2026-01-01", category: "Coffee", amount: 10 }], autoRepair.expenseCategories);
    expect(x.deductions.find((d) => d.category === "Other")?.amount).toBe(10);
  });
});

describe("periods and series", () => {
  const today = new Date(2026, 6, 15); // July 2026

  it("rolling 12 months ends with the current month", () => {
    const m = monthlySeries(orders, expenses, today);
    expect(m).toHaveLength(12);
    expect(m[0].month).toBe("2025-08");
    expect(m[11].month).toBe("2026-07");
    const totalRevenue = m.reduce((s, p) => s + p.revenue, 0);
    expect(totalRevenue).toBeCloseTo(t.revenue, 2); // sample spans exactly Aug 2025 - Jul 2026
  });

  it("fiscal year start", () => {
    expect(periodStart("fy", today, 1)).toBe("2026-01-01");
    expect(periodStart("fy", today, 10)).toBe("2025-10-01");
    expect(periodStart("12m", today, 1)).toBe("2025-08-01");
    expect(periodStart("all", today, 1)).toBeNull();
  });
});

describe("elite", () => {
  const today = new Date(2026, 6, 15);
  const months = monthlySeries(orders, expenses, today);

  it("profit leaks report non-negative impact and flag the tax gap", () => {
    const leaks = profitLeaks(t, orders, expenses, months, autoRepair);
    expect(leaks.length).toBeGreaterThanOrEqual(6);
    for (const l of leaks) expect(l.impact).toBeGreaterThanOrEqual(0);
    expect(leaks.find((l) => l.key === "tax-gap")?.leaking).toBe(true);
  });

  it("forecast projects 6 months after the current month", () => {
    const f = forecast(months, today);
    expect(f.map((p) => p.month)).toEqual(["2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01"]);
    for (const p of f) expect(p.aggressive).toBeGreaterThanOrEqual(p.conservative);
  });
});

describe("month-over-month uses complete months", () => {
  it("ignores the current partial month and names the months", async () => {
    const { completeMonths, insights } = await import("./metrics");
    const months = [
      { month: "2026-08", revenue: 100, expenses: 50, profit: 50, jobs: 1 },
      { month: "2026-09", revenue: 150, expenses: 40, profit: 110, jobs: 1 },
      { month: "2026-10", revenue: 1, expenses: 0, profit: 1, jobs: 1 },
    ];
    const [before, latest] = completeMonths(months);
    expect([before.month, latest.month]).toEqual(["2026-08", "2026-09"]);
    const tips = insights(t, months, autoRepair);
    expect(tips[3]).toEqual({ ok: true, text: "Revenue is flat or up in September vs. August." });
    expect(tips[4]).toEqual({ ok: true, text: "Expenses are flat or down in September vs. August." });
  });
});
