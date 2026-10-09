import Link from "next/link";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, parts, type Part } from "@/db";
import { ref } from "@/db/ref";
import { isElite, requireSession } from "@/lib/auth";
import { count, moneyFormatter, percent } from "@/lib/format";
import { EliteGate } from "@/components/elite-gate";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";
import { DeleteButton } from "../entry-forms";
import { adjustStock, deletePart } from "../shop-actions";
import { PartForm } from "./part-form";

export const metadata = { title: "Inventory" };

type Row = Part & { used90: number };

const SAMPLE: Row[] = [
  ["Brake Pads - Ceramic", "BRK-101", "Brakes", 38, 89, 14, 6, 22],
  ["Oil Filter - Standard", "OF-220", "Filters", 4.5, 14, 3, 20, 61],
  ["Synthetic Oil 5W-30 (qt)", "OIL-530", "Fluids", 6.2, 13, 85, 40, 240],
  ["Wiper Blades 22in", "WB-22", "Wipers", 7, 24, 2, 6, 9],
  ["Battery 48 AGM", "BAT-48", "Electrical", 135, 245, 4, 3, 5],
  ["Serpentine Belt", "BLT-6K", "Engine", 22, 58, 0, 2, 4],
].map(([name, sku, category, unitCost, unitPrice, onHand, reorderLevel, used90], i) => ({
  id: String(i),
  businessId: "",
  name: name as string,
  sku: sku as string,
  category: category as string,
  supplier: "",
  unitCost: unitCost as number,
  unitPrice: unitPrice as number,
  onHand: onHand as number,
  reorderLevel: reorderLevel as number,
  used90: used90 as number,
  createdAt: new Date(0),
}));

function InventoryView({ rows, money, actions, filter, q }: { rows: Row[]; money: (n: number) => string; actions: boolean; filter: string; q: string }) {
  const value = rows.reduce((s, p) => s + Math.max(p.onHand, 0) * p.unitCost, 0);
  const low = rows.filter((p) => p.onHand <= p.reorderLevel);
  const shown = filter === "low" ? low : rows;
  const margin = (p: Part) => (p.unitPrice ? (p.unitPrice - p.unitCost) / p.unitPrice : 0);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Parts" value={count(rows.length)} />
        <Stat label="Stock value (at cost)" value={money(value)} />
        <Stat label="Low or out of stock" value={count(low.length)} tone={low.length ? "bad" : "good"} hint="At or below reorder level" />
        <Stat label="Avg parts markup" value={percent(rows.length ? rows.reduce((s, p) => s + margin(p), 0) / rows.length : 0, 0)} hint="Gross margin on sell price" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex gap-1 rounded-lg border border-line-strong bg-surface p-0.5 text-sm">
          {[
            ["all", "All parts"],
            ["low", `Reorder (${low.length})`],
          ].map(([k, label]) => (
            <Link
              key={k}
              href={k === "all" ? "/app/inventory" : "/app/inventory?filter=low"}
              className={`rounded-md px-3 py-1.5 font-medium ${filter === k ? "bg-brand text-brand-ink" : "text-ink-2 hover:text-ink"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {actions && (
          <form action="/app/inventory" className="flex gap-2">
            <input name="q" defaultValue={q} className="field w-56" placeholder="Name, SKU, category, supplier" aria-label="Search parts" />
            <button className="btn btn-ghost">Search</button>
          </form>
        )}
      </div>
      {shown.length === 0 ? (
        <div className="mt-4">
          <Empty title={filter === "low" ? "Nothing to reorder" : q ? `No parts match “${q}”` : "No parts yet"}>
            {filter !== "low" && !q && "Add parts on the right. When you use them on a repair order, stock goes down automatically."}
          </Empty>
        </div>
      ) : (
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Part</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Cost</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Price</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Margin</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Used (90 days)</th>
                  <th className="px-4 py-2.5 text-right font-semibold">On hand</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const lowStock = p.onHand <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted">{[p.sku, p.category, p.supplier].filter(Boolean).join(" · ")}</div>
                      </td>
                      <td className="num px-4 py-2 text-right">{money(p.unitCost)}</td>
                      <td className="num px-4 py-2 text-right">{money(p.unitPrice)}</td>
                      <td className={`num px-4 py-2 text-right ${margin(p) < 0.3 ? "text-critical-ink" : "text-ink-2"}`}>{percent(margin(p), 0)}</td>
                      <td className="num px-4 py-2 text-right text-ink-2">{p.used90}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`num font-semibold ${p.onHand <= 0 ? "text-critical-ink" : lowStock ? "text-ink" : ""}`}>{p.onHand}</span>
                        {lowStock && (
                          <span className="ml-2 rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold uppercase">{p.onHand <= 0 ? "Out" : "Low"}</span>
                        )}
                        <div className="text-[11px] text-muted">reorder at {p.reorderLevel}</div>
                      </td>
                      <td className="px-4 py-2">
                        {actions && (
                          <div className="flex items-center justify-end gap-2">
                            {[-1, 1].map((by) => (
                              <form key={by} action={adjustStock}>
                                <input type="hidden" name="id" value={p.id} />
                                <input type="hidden" name="by" value={by} />
                                <button className="h-7 w-7 rounded border border-line-strong text-sm font-bold hover:border-ink-2" aria-label={`${by > 0 ? "Add" : "Remove"} one ${p.name}`}>
                                  {by > 0 ? "+" : "−"}
                                </button>
                              </form>
                            ))}
                            <Link href={`/app/inventory?edit=${p.id}`} className="ml-1 text-xs font-semibold text-brand hover:underline">
                              Edit
                            </Link>
                            <DeleteButton action={deletePart} id={p.id} label={p.name} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-4 py-3 text-xs text-muted">Stock goes down when a part is used on a repair order that's in progress or completed, and comes back if you remove it.</p>
        </Card>
      )}
    </>
  );
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string; edit?: string }> }) {
  const sp = await searchParams;
  const { user, business } = await requireSession();
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const q = (sp.q ?? "").trim().slice(0, 100);
  const filter = sp.filter === "low" ? "low" : "all";

  let rows: Row[] = [];
  if (elite) {
    const since = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);
    const used = sql<number>`(select coalesce(sum(l.qty), 0)::float8 from job_lines l join jobs j on j.id = l.job_id
      where l.part_id = ${ref(parts.id)} and j.status <> 'estimate' and j.date >= ${since})`;
    const found = await db
      .select({ part: parts, used90: used.mapWith(Number) })
      .from(parts)
      .where(and(eq(parts.businessId, business.id), q ? or(ilike(parts.name, `%${q}%`), ilike(parts.sku, `%${q}%`), ilike(parts.category, `%${q}%`), ilike(parts.supplier, `%${q}%`)) : undefined))
      .orderBy(asc(parts.name));
    rows = found.map((r) => ({ ...r.part, used90: r.used90 }));
  }
  const editing = sp.edit ? rows.find((p) => p.id === sp.edit) : undefined;
  const categories = [...new Set(rows.map((p) => p.category).filter(Boolean))].sort();
  const lowCount = rows.filter((p) => p.onHand <= p.reorderLevel).length;

  return (
    <>
      <PageHeader title="Inventory" subtitle="Parts on your shelves, what they're worth, and what to reorder. Stock updates itself as you use parts on repair orders.">
        {elite && (
          <a href="/api/export/parts" className="btn btn-ghost">
            Export CSV
          </a>
        )}
      </PageHeader>
      <EliteGate
        elite={elite}
        teaser={<>Track every part on your shelves: stock goes down automatically when you use it on a repair order, and you get a reorder list before you run out.</>}
        preview={<InventoryView rows={SAMPLE} money={money} actions={false} filter="all" q="" />}
      >
        {lowCount > 0 && filter !== "low" && (
          <p className="mb-4 rounded-lg border border-warning/60 bg-warning/10 px-4 py-3 text-sm">
            <strong>{lowCount} part{lowCount === 1 ? " is" : "s are"} at or below the reorder level.</strong>{" "}
            <Link href="/app/inventory?filter=low" className="font-semibold text-brand hover:underline">
              See the reorder list →
            </Link>
          </p>
        )}
        <div className="grid gap-4 xl:grid-cols-4">
          <div className="min-w-0 xl:col-span-3">
            <InventoryView rows={rows} money={money} actions filter={filter} q={q} />
          </div>
          <Card title={editing ? `Edit ${editing.name}` : "Add a part"} className="h-fit">
            <PartForm key={editing?.id ?? "new"} initial={editing} categories={categories} />
          </Card>
        </div>
      </EliteGate>
    </>
  );
}
