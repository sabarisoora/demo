// Reads a ProfitIQS Excel workbook (Essential or Elite edition) so an Excel customer can move in
// with one upload. Uses the values Excel cached for formula cells.
import ExcelJS from "exceljs";

export type WbJob = {
  ref: string;
  date: string;
  category: string;
  customerKey: string | null;
  customer: string;
  vehicleKey: string | null;
  revenueA: number;
  costA: number;
  revenueB: number;
  costB: number;
  hours: number;
  technician: string;
  status: "open" | "completed";
  comeback: boolean;
};
export type WbCustomer = { key: string; name: string; phone: string; email: string };
export type WbVehicle = { key: string; customerKey: string; year: number | null; make: string; model: string; vin: string; plate: string; mileage: number | null };
export type WbPart = { sku: string; name: string; category: string; supplier: string; unitCost: number; unitPrice: number; onHand: number; reorderLevel: number };
export type WbExpense = { ref: string; date: string; category: string; vendor: string; amount: number };
export type ParsedWorkbook = {
  edition: "Essential" | "Elite";
  jobs: WbJob[];
  expenses: WbExpense[];
  customers: WbCustomer[];
  vehicles: WbVehicle[];
  parts: WbPart[];
  settings: { businessName?: string; country?: string; openingCash?: number };
};

type Cell = ExcelJS.CellValue;

/** A cell's value with formulas resolved to Excel's cached result. */
function val(v: Cell): string | number | boolean | Date | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date || typeof v !== "object") return v as string | number | boolean | Date;
  if ("result" in v) return val(v.result as Cell);
  if ("richText" in v) return v.richText.map((t) => t.text).join("");
  if ("text" in v) return String(v.text);
  if ("error" in v) return null;
  return null;
}
const str = (v: Cell) => {
  const x = val(v);
  return x === null ? "" : x instanceof Date ? x.toISOString().slice(0, 10) : String(x).trim();
};
const num = (v: Cell) => {
  const x = val(v);
  const n = typeof x === "number" ? x : Number(String(x ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};
const isoDate = (v: Cell) => {
  const x = val(v);
  if (x instanceof Date) return x.toISOString().slice(0, 10);
  if (typeof x === "number") return new Date(Date.UTC(1899, 11, 30) + x * 86_400_000).toISOString().slice(0, 10); // Excel serial
  const s = String(x ?? "");
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
};

/** Rows below the header row of a sheet, as objects keyed by lower-cased header text. */
function table(ws: ExcelJS.Worksheet | undefined, mustHave: string) {
  if (!ws) return [];
  let headerRow = 0;
  let headers: string[] = [];
  for (let r = 1; r <= 12 && !headerRow; r++) {
    const vals = (ws.getRow(r).values as Cell[]).map((c) => str(c).toLowerCase());
    if (vals.includes(mustHave)) [headerRow, headers] = [r, vals];
  }
  if (!headerRow) return [];
  const out: Record<string, Cell>[] = [];
  ws.eachRow((row, i) => {
    if (i <= headerRow) return;
    const vals = row.values as Cell[];
    if (!str(vals[1])) return;
    const o: Record<string, Cell> = {};
    headers.forEach((h, idx) => h && (o[h] = vals[idx]));
    out.push(o);
  });
  return out;
}

export async function parseWorkbook(data: ArrayBuffer | Buffer): Promise<ParsedWorkbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data as ArrayBuffer);
  const sheet = (name: string) => wb.worksheets.find((w) => w.name.trim().toUpperCase() === name.toUpperCase());

  // ── Elite edition
  const roCenter = sheet("06 Repair Order Center");
  if (roCenter) {
    const payRate = new Map(table(sheet("08 Technician Performance"), "tech id").map((t) => [str(t["tech id"]), num(t["hourly pay rate"])]));
    const suppliers = new Map(table(sheet("12 Supplier Database"), "supplier id").map((s) => [str(s["supplier id"]), str(s["supplier"])]));
    const customers = table(sheet("04 Customer Database"), "customer id").map((c) => ({
      key: str(c["customer id"]),
      name: [str(c["first name"]), str(c["last name"])].filter(Boolean).join(" ") || str(c["company"]) || str(c["customer id"]),
      phone: str(c["phone"]),
      email: str(c["email"]).toLowerCase(),
    }));
    const vehicles = table(sheet("05 Vehicle Database"), "vehicle id").map((v) => ({
      key: str(v["vehicle id"]),
      customerKey: str(v["customer id"]),
      year: num(v["year"]) || null,
      make: str(v["make"]),
      model: str(v["model"]),
      vin: str(v["vin"]).toUpperCase(),
      plate: str(v["plate"]).toUpperCase(),
      mileage: num(v["mileage"]) || null,
    }));
    const jobs: WbJob[] = [];
    for (const r of table(roCenter, "ro number")) {
      const date = isoDate(r["ro date"]);
      if (!date) continue;
      const hours = num(r["labor hours"]);
      const status = str(r["status"]).toLowerCase();
      jobs.push({
        ref: str(r["ro number"]),
        date,
        category: str(r["service category"]) || "General Repair",
        customerKey: str(r["customer id"]) || null,
        customer: str(r["customer name"]),
        vehicleKey: str(r["vehicle id"]) || null,
        revenueA: num(r["parts revenue"]),
        costA: num(r["parts cost"]),
        revenueB: num(r["labor revenue"]),
        // The workbook has no labor cost per RO; the technician's hourly pay × hours is its own basis.
        costB: Math.round(hours * (payRate.get(str(r["technician id"])) ?? 0) * 100) / 100,
        hours,
        technician: str(r["technician"]),
        status: status === "closed" || status === "completed" || status === "" ? "completed" : "open",
        comeback: str(r["is comeback"]).toLowerCase() === "yes",
      });
    }
    const expenses = table(sheet("15 Expense Tracker"), "expense id").flatMap((e) => {
      const date = isoDate(e["date"]);
      return date ? [{ ref: str(e["expense id"]), date, category: str(e["category"]) || "Other", vendor: str(e["vendor"]), amount: Math.abs(num(e["amount"])) }] : [];
    });
    const parts = table(sheet("11 Inventory Control Center"), "part number").map((p) => ({
      sku: str(p["part number"]),
      name: str(p["description"]) || str(p["part number"]),
      category: str(p["category"]),
      supplier: suppliers.get(str(p["supplier id"])) ?? "",
      unitCost: num(p["unit cost"]),
      unitPrice: num(p["unit price"]),
      onHand: num(p["quantity on hand"]),
      reorderLevel: num(p["reorder level"]),
    }));
    return { edition: "Elite", jobs, expenses, customers, vehicles, parts, settings: {} };
  }

  // ── Essential edition
  const entry = wb.worksheets.find((w) => /ENTRY$/i.test(w.name.trim()) && !/EXPENSE/i.test(w.name));
  const expense = sheet("EXPENSE ENTRY");
  if (entry && expense) {
    const rows = table(entry, "date");
    const keys = rows[0] ? Object.keys(rows[0]) : [];
    const pick = (re: RegExp) => keys.find((k) => re.test(k)) ?? "";
    const [kRef, kCat, kCust] = [keys[1 - 1] ?? "", pick(/service type|category|type/), pick(/customer|client|name/)];
    const [kRevA, kCostA, kRevB, kCostB] = [pick(/^parts revenue$/), pick(/^parts cost$/), pick(/^labor revenue$/), pick(/^labor cost$/)];
    const jobs: WbJob[] = rows.flatMap((r) => {
      const date = isoDate(r["date"]);
      if (!date) return [];
      return [
        {
          ref: str(r[kRef]),
          date,
          category: str(r[kCat]) || "General Repair",
          customerKey: null,
          customer: str(r[kCust]),
          vehicleKey: null,
          revenueA: num(r[kRevA]),
          costA: num(r[kCostA]),
          revenueB: num(r[kRevB]),
          costB: num(r[kCostB]),
          hours: 0,
          technician: "",
          status: "completed" as const,
          comeback: false,
        },
      ];
    });
    const expenses = table(expense, "date").flatMap((e) => {
      const date = isoDate(e["date"]);
      const k = Object.keys(e);
      return date ? [{ ref: str(e[k[0]]), date, category: str(e["category"]) || "Other", vendor: str(e["vendor"]), amount: Math.abs(num(e["amount"])) }] : [];
    });
    const setup = sheet("SETUP");
    const settings: ParsedWorkbook["settings"] = {};
    if (setup) {
      setup.eachRow((row) => {
        const label = str(row.getCell(2).value).toLowerCase();
        const value = row.getCell(3).value;
        if (label === "business name") settings.businessName = str(value);
        if (label === "country") settings.country = str(value);
        if (label === "opening cash balance") settings.openingCash = num(value);
      });
    }
    return { edition: "Essential", jobs, expenses, customers: [], vehicles: [], parts: [], settings };
  }

  throw new Error("This doesn't look like a ProfitIQS workbook. Upload the Essential or Elite .xlsx file, or use CSV import.");
}
