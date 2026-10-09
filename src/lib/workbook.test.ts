import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { parseWorkbook } from "./workbook";

async function essentialFixture() {
  const wb = new ExcelJS.Workbook();
  const setup = wb.addWorksheet("SETUP");
  setup.getCell("B4").value = "Business Name";
  setup.getCell("C4").value = "Rivera Auto";
  setup.getCell("B6").value = "Country";
  setup.getCell("C6").value = "Canada";
  setup.getCell("B16").value = "Opening Cash Balance";
  setup.getCell("C16").value = 5000;
  const ro = wb.addWorksheet("REPAIR ORDER ENTRY");
  ro.getCell("A1").value = "  REPAIR ORDER ENTRY";
  ro.getRow(3).values = ["RO ID", "Date", "Service Type", "Customer", "Parts Revenue", "Parts Cost", "Labor Revenue", "Labor Cost", "RO Profit"];
  ro.getRow(4).values = ["RO-1000", new Date(Date.UTC(2026, 2, 15)), "Brake Service", "Ann Lee", 100, 40, 200, { formula: "1+1", result: 80 }, { formula: "E4+G4-F4-H4", result: 180 }];
  ro.getRow(5).values = ["RO-1001", 46100, "Diagnostic", "Bo", 0, 0, "150.50", 50]; // Excel serial date + text number
  ro.getRow(6).values = ["", null, "", "", 0, 0, 0, 0]; // blank row ignored
  const ex = wb.addWorksheet("EXPENSE ENTRY");
  ex.getRow(3).values = ["Expense ID", "Date", "Category", "Vendor", "Amount"];
  ex.getRow(4).values = ["EXP-1", new Date(Date.UTC(2026, 2, 1)), "Shop Rent", "Landlord", 3000];
  return Buffer.from(await wb.xlsx.writeBuffer());
}

describe("parseWorkbook", () => {
  it("reads an Essential workbook, using cached formula results", async () => {
    const p = await parseWorkbook(await essentialFixture());
    expect(p.edition).toBe("Essential");
    expect(p.jobs).toHaveLength(2);
    expect(p.jobs[0]).toMatchObject({ ref: "RO-1000", date: "2026-03-15", category: "Brake Service", customer: "Ann Lee", revenueA: 100, costA: 40, revenueB: 200, costB: 80, status: "completed" });
    expect(p.jobs[1]).toMatchObject({ date: "2026-03-19", revenueB: 150.5 }); // Excel serial 46100
    expect(p.expenses).toEqual([{ ref: "EXP-1", date: "2026-03-01", category: "Shop Rent", vendor: "Landlord", amount: 3000 }]);
    expect(p.settings).toEqual({ businessName: "Rivera Auto", country: "Canada", openingCash: 5000 });
  });

  it("rejects files that aren't ProfitIQS workbooks", async () => {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet("Sheet1").getCell("A1").value = "hello";
    await expect(parseWorkbook(Buffer.from(await wb.xlsx.writeBuffer()))).rejects.toThrow(/doesn't look like a ProfitIQS workbook/);
  });
});
