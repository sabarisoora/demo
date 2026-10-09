import { asc, eq } from "drizzle-orm";
import { db, customers, parts, vehicles } from "@/db";
import { getSession, isElite } from "@/lib/auth";
import { customerInsights } from "@/lib/elite-metrics";
import { toCsv } from "@/lib/csv";
import { loadAllJobs, loadEntries } from "@/lib/data";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { getNiche } from "@/niches";

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  // Same rule as the app: team members need the shop on Elite.
  if (session.role !== "owner" && !isElite(session.user)) return new Response("Team access is paused", { status: 403 });
  const { kind } = await params;
  if (!["jobs", "expenses", "all", "lapsed", "customers", "parts"].includes(kind)) return new Response("Not found", { status: 404 });
  if (kind === "parts" && !isElite(session.user)) return new Response("Elite only", { status: 403 });
  if (kind === "lapsed" && !isElite(session.user)) return new Response("Elite only", { status: 403 });

  const { business, user } = session;
  const niche = getNiche(business.niche);
  const [{ jobs: completed, expenses }, allJobs] = await Promise.all([loadEntries(business.id), loadAllJobs(business.id)]);
  // Exports include estimates and open work (with a Status column); analyses use completed jobs only.
  const jobs = kind === "lapsed" ? completed : allJobs;
  const slug = (business.name || "profitiqs").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profitiqs";
  const today = new Date().toISOString().slice(0, 10);

  if (kind === "all") {
    // Everything we hold for this account (data portability). Password hash is never included.
    const { passwordHash: _omit, ...account } = user;
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), account, business, jobs, expenses }, null, 2);
    return new Response(body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${slug}-profitiqs-export-${today}.json"`,
        "cache-control": "no-store",
      },
    });
  }
  const { a, b } = niche.streams;

  const csv = (rows: (string | number)[][], name: string) =>
    new Response(toCsv(rows), {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${slug}-${name}-${today}.csv"`, "cache-control": "no-store" },
    });

  if (kind === "customers") {
    const [cs, vs] = await Promise.all([
      db.select().from(customers).where(eq(customers.businessId, business.id)).orderBy(asc(customers.name)),
      db.select().from(vehicles).where(eq(vehicles.businessId, business.id)),
    ]);
    const rows: (string | number)[][] = [["Customer", "Phone", "Email", "Notes", "Year", "Make", "Model", "Plate", "VIN", "Mileage"]];
    for (const c of cs) {
      const mine = vs.filter((v) => v.customerId === c.id);
      if (!mine.length) rows.push([c.name, c.phone, c.email, c.notes, "", "", "", "", "", ""]);
      for (const v of mine) rows.push([c.name, c.phone, c.email, c.notes, v.year ?? "", v.make, v.model, v.plate, v.vin, v.mileage ?? ""]);
    }
    return csv(rows, "customers");
  }

  if (kind === "parts") {
    const ps = await db.select().from(parts).where(eq(parts.businessId, business.id)).orderBy(asc(parts.name));
    return csv(
      [["SKU", "Part", "Category", "Supplier", "Unit Cost", "Unit Price", "On Hand", "Reorder Level", "Stock Value"], ...ps.map((p) => [p.sku, p.name, p.category, p.supplier, p.unitCost, p.unitPrice, p.onHand, p.reorderLevel, round(Math.max(p.onHand, 0) * p.unitCost)])],
      "inventory",
    );
  }

  if (kind === "lapsed") {
    const lapsed = customerInsights(jobs, niche, new Date()).atRisk;
    const rows = [
      [niche.job.customerLabel, "Visits", "Lifetime Revenue", "First Visit", "Last Visit", "Segment"],
      ...lapsed.map((c) => [c.name, c.visits, round(c.revenue), c.first, c.last, c.segment]),
    ];
    return new Response(toCsv(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${slug}-win-back-list-${today}.csv"`,
        "cache-control": "no-store",
      },
    });
  }

  const rows: (string | number)[][] =
    kind === "jobs"
      ? [
          [
            `${niche.job.short} Number`, "Date", "Category", niche.job.customerLabel, `${a} Revenue`, `${a} Cost`, `${b} Revenue`, `${b} Cost`, "Total Revenue", "Profit",
            niche.details.technician, niche.details.hours, "Paid", niche.details.comeback, "Status",
          ],
          ...jobs.map((j) => [
            j.ref, j.date, j.category, j.customer, j.revenueA, j.costA, j.revenueB, j.costB, round(jobRevenue(j)), round(jobProfit(j)),
            j.technician, j.hours, j.paid ? "Yes" : "No", j.comeback ? "Yes" : "No", j.status,
          ]),
        ]
      : [["Ref", "Date", "Category", "Vendor", "Amount"], ...expenses.map((e) => [e.ref, e.date, e.category, e.vendor, e.amount])];

  const name = `${slug}-${kind === "jobs" ? niche.job.plural.toLowerCase().replace(/\s+/g, "-") : "expenses"}-${today}.csv`;
  return new Response(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}

const round = (n: number) => Math.round(n * 100) / 100;
