import { isElite, requireSession } from "@/lib/auth";
import { loadPeriod, parsePeriod } from "@/lib/data";
import { count, moneyFormatter, percent } from "@/lib/format";
import { categoryBreakdown } from "@/lib/metrics";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, PageHeader, PeriodTabs } from "@/components/ui";

export const metadata = { title: "Service Profitability" };

type Row = ReturnType<typeof categoryBreakdown>[number];

function ServiceTable({ rows, niche, money }: { rows: Row[]; niche: Niche; money: (n: number) => string }) {
  const maxProfit = Math.max(1, ...rows.map((r) => Math.abs(r.profit)));
  const { a, b } = niche.streams;
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Category</th>
              <th className="px-4 py-2.5 text-right font-semibold">Jobs</th>
              <th className="px-4 py-2.5 text-right font-semibold">Revenue</th>
              <th className="px-4 py-2.5 text-right font-semibold">Share</th>
              <th className="px-4 py-2.5 text-right font-semibold">Avg ticket</th>
              <th className="px-4 py-2.5 text-right font-semibold">{a} margin</th>
              <th className="px-4 py-2.5 text-right font-semibold">{b} margin</th>
              <th className="px-4 py-2.5 text-right font-semibold">Gross margin</th>
              <th className="w-48 px-4 py-2.5 font-semibold">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const ma = r.revenueA ? (r.revenueA - r.costA) / r.revenueA : 0;
              const mb = r.revenueB ? (r.revenueB - r.costB) / r.revenueB : 0;
              return (
                <tr key={r.category} className="border-t border-line">
                  <td className="px-4 py-2.5 font-medium">{r.category}</td>
                  <td className="num px-4 py-2.5 text-right">{count(r.count)}</td>
                  <td className="num px-4 py-2.5 text-right">{money(r.revenue)}</td>
                  <td className="num px-4 py-2.5 text-right text-ink-2">{percent(r.share, 0)}</td>
                  <td className="num px-4 py-2.5 text-right">{money(r.avgTicket)}</td>
                  <td className={`num px-4 py-2.5 text-right ${ma < niche.thresholds.streamAMargin ? "text-critical-ink" : "text-ink-2"}`}>{percent(ma, 0)}</td>
                  <td className={`num px-4 py-2.5 text-right ${mb < niche.thresholds.streamBMargin ? "text-critical-ink" : "text-ink-2"}`}>{percent(mb, 0)}</td>
                  <td className={`num px-4 py-2.5 text-right font-semibold ${r.margin < niche.thresholds.jobGrossMargin ? "text-critical-ink" : ""}`}>
                    {percent(r.margin, 0)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-surface-2">
                        <div className="h-2 rounded-full" style={{ width: `${(Math.max(r.profit, 0) / maxProfit) * 100}%`, background: "var(--series-1)" }} />
                      </div>
                      <span className="num w-24 text-right">{money(r.profit)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-4 py-3 text-xs text-muted">
        Red figures are below your targets: {percent(niche.thresholds.streamAMargin, 0)} {a.toLowerCase()}, {percent(niche.thresholds.streamBMargin, 0)} {b.toLowerCase()},{" "}
        {percent(niche.thresholds.jobGrossMargin, 0)} gross.
      </p>
    </Card>
  );
}

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const { periodJobs } = await loadPeriod(business, period);
  const rows = categoryBreakdown(periodJobs, niche.jobCategories);
  const best = rows[0];
  const worst = [...rows].sort((x, y) => x.margin - y.margin)[0];

  return (
    <>
      <PageHeader title="Service Profitability" subtitle={`Which ${niche.job.plural.toLowerCase()} actually pay: revenue, margin and profit by category.`}>
        {elite && <PeriodTabs current={period} base="/app/elite/services" />}
      </PageHeader>
      <EliteGate
        elite={elite}
        teaser={
          rows.length > 1 ? (
            <>
              Your <strong className="text-ink">{rows.length} service lines</strong> don't earn the same. One of them makes{" "}
              <strong className="text-ink">{Math.round((best.margin - worst.margin) * 100)} points more margin</strong> than another. See which to push and which to reprice.
            </>
          ) : (
            <>See revenue, margin and profit for every service line, so you know what to push and what to reprice.</>
          )
        }
        preview={<ServiceTable rows={categoryBreakdown(niche.sample.orders, niche.jobCategories)} niche={niche} money={money} />}
      >
        <ServiceTable rows={rows} niche={niche} money={money} />
      </EliteGate>
    </>
  );
}
