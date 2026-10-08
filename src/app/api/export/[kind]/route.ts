import { getSession } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { loadEntries } from "@/lib/data";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { getNiche } from "@/niches";

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { kind } = await params;
  if (kind !== "jobs" && kind !== "expenses") return new Response("Not found", { status: 404 });

  const { business } = session;
  const niche = getNiche(business.niche);
  const { jobs, expenses } = await loadEntries(business.id);
  const { a, b } = niche.streams;

  const rows: (string | number)[][] =
    kind === "jobs"
      ? [
          [`${niche.job.short} Number`, "Date", "Category", niche.job.customerLabel, `${a} Revenue`, `${a} Cost`, `${b} Revenue`, `${b} Cost`, "Total Revenue", "Profit"],
          ...jobs.map((j) => [j.ref, j.date, j.category, j.customer, j.revenueA, j.costA, j.revenueB, j.costB, round(jobRevenue(j)), round(jobProfit(j))]),
        ]
      : [["Ref", "Date", "Category", "Vendor", "Amount"], ...expenses.map((e) => [e.ref, e.date, e.category, e.vendor, e.amount])];

  const slug = (business.name || "profitiqs").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profitiqs";
  const name = `${slug}-${kind === "jobs" ? niche.job.plural.toLowerCase().replace(/\s+/g, "-") : "expenses"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}

const round = (n: number) => Math.round(n * 100) / 100;
