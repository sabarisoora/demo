import { getSession, isElite } from "@/lib/auth";
import { customerInsights } from "@/lib/elite-metrics";
import { toCsv } from "@/lib/csv";
import { loadEntries } from "@/lib/data";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { getNiche } from "@/niches";

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { kind } = await params;
  if (!["jobs", "expenses", "all", "lapsed"].includes(kind)) return new Response("Not found", { status: 404 });
  if (kind === "lapsed" && !isElite(session.user)) return new Response("Elite only", { status: 403 });

  const { business, user } = session;
  const niche = getNiche(business.niche);
  const { jobs, expenses } = await loadEntries(business.id);
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
          [`${niche.job.short} Number`, "Date", "Category", niche.job.customerLabel, `${a} Revenue`, `${a} Cost`, `${b} Revenue`, `${b} Cost`, "Total Revenue", "Profit"],
          ...jobs.map((j) => [j.ref, j.date, j.category, j.customer, j.revenueA, j.costA, j.revenueB, j.costB, round(jobRevenue(j)), round(jobProfit(j))]),
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
