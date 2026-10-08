import { describe, expect, it } from "vitest";
import { autoRepair } from "@/niches/auto-repair";
import { buildDigest, weekWindow } from "./digest";

const settings = { country: "United States", vatRegistered: false, vatRateOverride: null, reserveRateOverride: null, openingCash: 0, reserveSetAside: 0, fiscalYearStart: 1 };
const money = (n: number) => `$${n.toFixed(2)}`;
const job = (date: string, rev: number, o: object = {}) => ({ date, category: "Brakes", customer: "Ann", revenueA: 0, costA: 0, revenueB: rev, costB: 0, ...o });
const base = { name: "Sam Rivera", businessName: "Rivera Auto", niche: autoRepair, settings, expenses: [], money, appUrl: "https://x.test", unsubscribeUrl: "https://x.test/u?t=1" };

describe("weekly digest", () => {
  const today = new Date("2026-10-12T13:00:00Z"); // a Monday

  it("covers the 7 days before today", () => {
    expect(weekWindow(today)).toEqual({ start: "2026-10-05", end: "2026-10-11", prevStart: "2026-09-28" });
  });

  it("totals the week and compares with the week before", () => {
    const d = buildDigest({ ...base, elite: false, today, jobs: [job("2026-10-06", 300), job("2026-10-11", 200), job("2026-09-30", 250), job("2026-10-12", 999)] });
    expect(d.week).toEqual({ revenue: 500, profit: 500, jobs: 2 });
    expect(d.subject).toBe("Rivera Auto: $500.00 revenue this week");
    expect(d.text).toContain("Revenue: $500.00 (▲ 100% vs the week before)");
    expect(d.text).toContain("Unsubscribe: https://x.test/u?t=1");
    expect(d.nudge.path).toBe("/app/elite/leaks"); // free users get the Elite pitch
  });

  it("nudges to log entries when the week is empty, and to chase old invoices for Elite", () => {
    expect(buildDigest({ ...base, elite: true, today, jobs: [job("2026-09-01", 100)] }).nudge.path).toBe("/app/jobs");
    const d = buildDigest({ ...base, elite: true, today, jobs: [job("2026-10-06", 100), job("2026-05-01", 400, { paid: false })] });
    expect(d.nudge.path).toBe("/app/elite/receivables");
    expect(d.text).toContain("Owed to you: $400.00");
  });

  it("escapes HTML in names", () => {
    const d = buildDigest({ ...base, name: "<b>x</b>", elite: false, today, jobs: [job("2026-10-06", 1)] });
    expect(d.html).not.toContain("<b>x</b>");
    expect(d.html).toContain("&lt;b&gt;x&lt;/b&gt;");
  });
});
