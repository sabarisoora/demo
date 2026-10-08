import { isElite, requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { categoryBreakdown, monthKey } from "@/lib/metrics";
import { change, monthReview, monthsWithData, type MonthFigures } from "@/lib/elite-metrics";
import { count, monthLabel, moneyFormatter, percent } from "@/lib/format";
import { sampleContext } from "@/lib/sample";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, PageHeader } from "@/components/ui";
import { PrintButton } from "../../accountant/print-button";

export const metadata = { title: "Monthly Business Review" };

type Review = ReturnType<typeof monthReview>;
type Fmt = "money" | "percent" | "count";

function Delta({ now, before, fmt, invert }: { now: number; before: number; fmt: Fmt; invert?: boolean }) {
  // Margins compare in points; amounts compare in percent change.
  const d = fmt === "percent" ? now - before : change(now, before);
  if (d === null) return <span className="text-muted">—</span>;
  const good = invert ? d <= 0 : d >= 0;
  const label = fmt === "percent" ? `${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)} pts` : `${d >= 0 ? "+" : ""}${(d * 100).toFixed(0)}%`;
  return (
    <span className={good ? "text-good-ink" : "text-critical-ink"}>
      <span aria-hidden="true">{d >= 0 ? "▲" : "▼"}</span> {label}
    </span>
  );
}

function ReviewView({ r, niche, money, top }: { r: Review; niche: Niche; money: (n: number) => string; top: ReturnType<typeof categoryBreakdown> }) {
  const { a, b } = niche.streams;
  const rows: [string, (f: MonthFigures) => number, Fmt, boolean?][] = [
    ["Revenue", (f) => f.revenue, "money"],
    [`${b} revenue`, (f) => f.revenueB, "money"],
    [`${a} revenue`, (f) => f.revenueA, "money"],
    ["Gross profit", (f) => f.grossProfit, "money"],
    ["Gross margin", (f) => f.grossMargin, "percent"],
    ["Overhead", (f) => f.overhead, "money", true],
    ["Total expenses", (f) => f.totalExpenses, "money", true],
    ["Net profit", (f) => f.netProfit, "money"],
    ["Net margin", (f) => f.netMargin, "percent"],
    [niche.job.plural, (f) => f.jobCount, "count"],
    [`Average ${niche.job.short} value`, (f) => f.avgTicket, "money"],
  ];
  const fmt = (v: number, f: Fmt) => (f === "money" ? money(v) : f === "percent" ? percent(v) : count(v));
  const c = r.current;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Metric</th>
                  <th className="px-4 py-2.5 text-right font-semibold">{monthLabel(c.month, true)}</th>
                  <th className="px-4 py-2.5 text-right font-semibold">vs {monthLabel(r.prior.month)}</th>
                  <th className="px-4 py-2.5 text-right font-semibold">vs {monthLabel(r.lastYear.month)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get, f, invert]) => (
                  <tr key={label} className="border-t border-line">
                    <td className="px-4 py-2">{label}</td>
                    <td className="num px-4 py-2 text-right font-semibold">{fmt(get(c), f)}</td>
                    <td className="num px-4 py-2 text-right text-xs">
                      <div className="text-ink-2">{fmt(get(r.prior), f)}</div>
                      {r.prior.hasData && <Delta now={get(c)} before={get(r.prior)} fmt={f} invert={invert} />}
                    </td>
                    <td className="num px-4 py-2 text-right text-xs">
                      {r.lastYear.hasData ? (
                        <>
                          <div className="text-ink-2">{fmt(get(r.lastYear), f)}</div>
                          <Delta now={get(c)} before={get(r.lastYear)} fmt={f} invert={invert} />
                        </>
                      ) : (
                        <span className="text-muted">no data</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Summary">
            <ul className="space-y-2 text-sm text-ink-2">
              <li>
                {c.netProfit >= 0 ? "Profit" : "Loss"} of <strong className="num text-ink">{money(Math.abs(c.netProfit))}</strong> on{" "}
                <strong className="num text-ink">{money(c.revenue)}</strong> revenue ({percent(c.netMargin)} margin).
              </li>
              {r.prior.hasData && change(c.revenue, r.prior.revenue) !== null && (
                <li>
                  Revenue {c.revenue >= r.prior.revenue ? "up" : "down"} {percent(Math.abs(change(c.revenue, r.prior.revenue)!), 0)} on the month before.
                </li>
              )}
              {r.lastYear.hasData && change(c.revenue, r.lastYear.revenue) !== null && (
                <li>
                  {c.revenue >= r.lastYear.revenue ? "Ahead of" : "Behind"} the same month last year by{" "}
                  {percent(Math.abs(change(c.revenue, r.lastYear.revenue)!), 0)}.
                </li>
              )}
              <li>
                {count(c.jobCount)} {niche.job.plural.toLowerCase()} averaging {money(c.avgTicket)}.
              </li>
            </ul>
          </Card>
          <Card title="Top categories this month">
            {top.length === 0 ? (
              <p className="text-sm text-muted">No {niche.job.plural.toLowerCase()} this month.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {top.slice(0, 5).map((t) => (
                  <li key={t.category} className="flex justify-between gap-3">
                    <span className="truncate">{t.category}</span>
                    <span className="num shrink-0 text-ink-2">
                      {money(t.profit)} <span className="text-muted">· {percent(t.margin, 0)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted">Profit and gross margin per category.</p>
          </Card>
        </div>
      </div>
    </>
  );
}

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const { jobs, expenses } = await loadEntries(business.id);
  const available = monthsWithData(jobs, expenses);
  const requested = (await searchParams).month;
  // Default to the latest complete month; the current month is still partial.
  const thisMonth = monthKey(new Date());
  const fallback = available.find((m) => m < thisMonth) ?? available[0] ?? thisMonth;
  const month = requested && /^\d{4}-\d{2}$/.test(requested) ? requested : fallback;
  const r = monthReview(jobs, expenses, month);
  const top = categoryBreakdown(
    jobs.filter((j) => monthKey(j.date) === month),
    niche.jobCategories,
  );
  const sample = sampleContext(niche);
  const sampleTop = categoryBreakdown(
    sample.orders.filter((o) => monthKey(o.date) === sample.month),
    niche.jobCategories,
  );
  const options = available.includes(month) ? available : [month, ...available];

  return (
    <>
      <PageHeader title="Monthly Business Review" subtitle="One month at a glance, against the month before and the same month last year. Print it for your accountant, partner or lender.">
        {elite && (
          <>
            <form action="/app/elite/review" className="flex items-center gap-2">
              <label htmlFor="month" className="sr-only">
                Month
              </label>
              <select id="month" name="month" defaultValue={month} className="field w-auto">
                {options.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m, true)}
                  </option>
                ))}
              </select>
              <button className="btn btn-ghost">Show</button>
            </form>
            <PrintButton />
          </>
        )}
      </PageHeader>
      <EliteGate
        elite={elite}
        teaser={
          r.current.hasData ? (
            <>
              Your {monthLabel(month, true)} review is ready: {r.prior.hasData ? (r.current.netProfit >= r.prior.netProfit ? "profit is up" : "profit is down") : "profit"} vs the
              month before. Upgrade to see every line, the year-on-year comparison and a printable report.
            </>
          ) : (
            <>A one-page monthly report: revenue, margins, profit, job count and average ticket, compared with last month and last year. Ready to print.</>
          )
        }
        preview={<ReviewView r={monthReview(sample.orders, sample.expenses, sample.month)} niche={niche} money={money} top={sampleTop} />}
      >
        <div className="mb-4 hidden print:block">
          <div className="font-display text-xl font-extrabold">{business.name}</div>
          <div className="text-sm text-ink-2">Monthly Business Review · {monthLabel(month, true)}</div>
        </div>
        <ReviewView r={r} niche={niche} money={money} top={top} />
      </EliteGate>
    </>
  );
}
