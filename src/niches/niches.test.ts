import { describe, expect, it } from "vitest";
import { taxSummary } from "@/lib/metrics";
import { niches } from ".";

// Excel's own cached totals per niche, written by scripts/niche-from-workbook.py.
const expected = import.meta.glob<{ default: { revenue: number; directCost: number; overhead: number; netProfit: number } }>("./expected/*.json", { eager: true });
const settings = { country: "United States", vatRegistered: false, vatRateOverride: null, reserveRateOverride: null, openingCash: 0, reserveSetAside: 0, fiscalYearStart: 1 };

describe("every niche", () => {
  for (const niche of Object.values(niches)) {
    describe(niche.name, () => {
      it("has consistent config", () => {
        expect(niche.slug).toMatch(/^[a-z0-9-]+$/);
        expect(niche.jobCategories.length).toBeGreaterThan(0);
        expect(niche.expenseCategories).toContain("Other");
        expect(niche.sample.orders.length).toBeGreaterThan(0);
        expect(niche.segments.vip).toBeGreaterThan(niche.segments.core);
      });

      const exp = expected[`./expected/${niche.slug}.json`]?.default;
      it.skipIf(!exp)("matches the Excel workbook's totals", () => {
        const t = taxSummary(settings, niche.sample.orders, niche.sample.expenses, niche.expenseCategories);
        expect(t.revenue).toBeCloseTo(exp!.revenue, 2);
        expect(t.directCost).toBeCloseTo(exp!.directCost, 2);
        expect(t.overhead).toBeCloseTo(exp!.overhead, 2);
        expect(t.netProfit).toBeCloseTo(exp!.netProfit, 2);
      });
    });
  }
});
