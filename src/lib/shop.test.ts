import { describe, expect, it } from "vitest";
import { consumesStock, lineTotals, nextService, reminderMessage, stockDeltas, vehicleLabel } from "./shop";

describe("lineTotals", () => {
  const lines = [
    { kind: "part" as const, description: "Brake pads", qty: 2, unitPrice: 45.5, unitCost: 20 },
    { kind: "labor" as const, description: "Install", qty: 1.5, unitPrice: 120, unitCost: 40 },
    { kind: "fee" as const, description: "Shop supplies", qty: 1, unitPrice: 10, unitCost: 0 },
  ];
  it("splits parts (A) from labor and fees (B)", () => {
    const t = lineTotals(lines, null, false);
    expect(t).toMatchObject({ revenueA: 91, costA: 40, revenueB: 190, costB: 60, hours: 1.5, subtotal: 281, tax: 0, total: 281 });
  });
  it("taxes parts only, or everything", () => {
    expect(lineTotals(lines, 8.25, false).tax).toBeCloseTo(7.51, 2); // 91 × 8.25%
    expect(lineTotals(lines, 8.25, true).tax).toBeCloseTo(23.18, 2); // 281 × 8.25%
    expect(lineTotals(lines, 8.25, true).total).toBeCloseTo(304.18, 2);
  });
  it("rounds each line to cents", () => {
    expect(lineTotals([{ kind: "part", description: "x", qty: 3, unitPrice: 0.333, unitCost: 0 }], null, false).revenueA).toBe(1);
  });
});

describe("stockDeltas", () => {
  const a = "part-a";
  const b = "part-b";
  it("estimates don't use stock; approving one does", () => {
    expect(consumesStock("estimate")).toBe(false);
    expect([...stockDeltas([], null, [{ partId: a, qty: 2 }], "estimate")]).toEqual([]);
    expect([...stockDeltas([{ partId: a, qty: 2 }], "estimate", [{ partId: a, qty: 2 }], "open")]).toEqual([[a, 2]]);
  });
  it("edits adjust by the difference, removals put stock back", () => {
    const d = stockDeltas([{ partId: a, qty: 2 }, { partId: b, qty: 1 }], "completed", [{ partId: a, qty: 3 }], "completed");
    expect(Object.fromEntries(d)).toEqual({ [a]: 1, [b]: -1 });
  });
  it("same part on two lines adds up; unchanged means no movement", () => {
    const lines = [{ partId: a, qty: 1 }, { partId: a, qty: 1 }, { partId: null, qty: 5 }];
    expect(Object.fromEntries(stockDeltas([], null, lines, "completed"))).toEqual({ [a]: 2 });
    expect(stockDeltas(lines, "completed", lines, "open").size).toBe(0);
  });
});

describe("service reminders", () => {
  it("due date = last visit + interval, unless overridden", () => {
    expect(nextService("2026-03-31", null, 6, "2026-10-09")).toEqual({ due: "2026-09-30", days: -9, status: "overdue" });
    expect(nextService("2026-04-20", null, 6, "2026-10-09")).toMatchObject({ due: "2026-10-20", status: "due-soon" });
    expect(nextService("2026-08-01", null, 6, "2026-10-09")).toMatchObject({ status: "later" });
    expect(nextService("2026-01-01", "2027-01-01", 6, "2026-10-09")).toMatchObject({ due: "2027-01-01", status: "later" });
    expect(nextService(null, null, 6, "2026-10-09").status).toBe("no-history");
  });
  it("writes a friendly message", () => {
    const m = reminderMessage({ customer: "Ann Lee", vehicle: "2019 Honda Civic", shop: "Rivera Auto", phone: "555-0100", due: "2026-10-01", overdue: true });
    expect(m).toBe("Hi Ann, this is Rivera Auto. Your 2019 Honda Civic is overdue for service. Call us at 555-0100 or reply to book a time. Thank you!");
    expect(vehicleLabel({ year: null, make: "", model: "", plate: "ABC-1" })).toBe("ABC-1");
  });
});
