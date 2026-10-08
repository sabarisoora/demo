import { isElite, requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { customerInsights } from "@/lib/elite-metrics";
import { count, dateLabel, moneyFormatter, percent } from "@/lib/format";
import { sampleContext } from "@/lib/sample";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Customer Insights" };

type Insights = ReturnType<typeof customerInsights>;

const segColor = { VIP: "var(--series-1)", Core: "var(--series-2)", Occasional: "var(--muted)" } as const;

function CustomerView({ ins, niche, money, exportable }: { ins: Insights; niche: Niche; money: (n: number) => string; exportable: boolean }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Customers" value={count(ins.count)} hint={`${count(ins.newCustomers)} new in the last 90 days`} />
        <Stat label="Repeat rate" value={percent(ins.repeatRate, 0)} hint="Came back at least once" />
        <Stat label="Top 10 share" value={percent(ins.top10Share, 0)} hint="Of revenue from your 10 best customers" />
        <Stat label="Lapsed regulars" value={count(ins.atRisk.length)} tone={ins.atRisk.length ? "bad" : undefined} hint={`No visit in ${ins.atRiskDays}+ days`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Segments">
          <ul className="space-y-4">
            {ins.segments.map((s) => (
              <li key={s.segment}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: segColor[s.segment] }} />
                    {s.segment}
                  </span>
                  <span className="num text-ink-2">{percent(s.share, 0)} of revenue</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div className="h-2 rounded-full" style={{ width: `${s.share * 100}%`, background: segColor[s.segment] }} />
                </div>
                <div className="num mt-1 text-xs text-muted">
                  {count(s.count)} customers · avg {money(s.avg)}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            VIP: {money(niche.segments.vip)}+ lifetime · Core: {money(niche.segments.core)}+ · Occasional: below that.
          </p>
        </Card>

        <Card
          title={`Win-back list · ${ins.atRisk.length}`}
          className="lg:col-span-2"
          action={
            exportable && ins.atRisk.length > 0 ? (
              <a href="/api/export/lapsed" className="text-xs font-semibold text-brand hover:underline">
                Download CSV
              </a>
            ) : undefined
          }
        >
          {ins.atRisk.length === 0 ? (
            <p className="text-sm text-ink-2">No regulars have lapsed. Everyone with 2+ visits has been back in the last {ins.atRiskDays} days.</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-ink-2">
                Regulars who haven't been back in {ins.atRiskDays}+ days. Together they've spent{" "}
                <strong className="num text-ink">{money(ins.atRisk.reduce((s, c) => s + c.revenue, 0))}</strong>. A reminder call or offer is usually the cheapest revenue you'll find.
              </p>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface text-left text-xs text-muted uppercase">
                    <tr>
                      <th className="py-2 font-semibold">{niche.job.customerLabel}</th>
                      <th className="py-2 text-right font-semibold">Visits</th>
                      <th className="py-2 text-right font-semibold">Lifetime</th>
                      <th className="py-2 text-right font-semibold">Last visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ins.atRisk.slice(0, 50).map((c) => (
                      <tr key={c.name} className="border-t border-line">
                        <td className="py-1.5">{c.name}</td>
                        <td className="num py-1.5 text-right">{c.visits}</td>
                        <td className="num py-1.5 text-right">{money(c.revenue)}</td>
                        <td className="py-1.5 text-right text-ink-2">{dateLabel(c.last)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title="Top 25 customers by lifetime revenue" className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">#</th>
                <th className="px-4 py-2.5 font-semibold">{niche.job.customerLabel}</th>
                <th className="px-4 py-2.5 font-semibold">Segment</th>
                <th className="px-4 py-2.5 text-right font-semibold">Visits</th>
                <th className="px-4 py-2.5 text-right font-semibold">Lifetime revenue</th>
                <th className="px-4 py-2.5 text-right font-semibold">Profit</th>
                <th className="px-4 py-2.5 text-right font-semibold">Last visit</th>
              </tr>
            </thead>
            <tbody>
              {ins.top.map((c, i) => (
                <tr key={c.name} className="border-t border-line">
                  <td className="num px-4 py-2 text-muted">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-2 w-2 rounded-sm" style={{ background: segColor[c.segment] }} />
                      {c.segment}
                    </span>
                  </td>
                  <td className="num px-4 py-2 text-right">{c.visits}</td>
                  <td className="num px-4 py-2 text-right">{money(c.revenue)}</td>
                  <td className="num px-4 py-2 text-right text-ink-2">{money(c.profit)}</td>
                  <td className="px-4 py-2 text-right text-ink-2">{dateLabel(c.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ins.unnamedJobs > 0 && (
          <p className="border-t border-line px-4 py-3 text-xs text-muted">
            {count(ins.unnamedJobs)} {niche.job.plural.toLowerCase()} have no {niche.job.customerLabel.toLowerCase()} name and aren't counted here.
          </p>
        )}
      </Card>
    </>
  );
}

export default async function CustomersPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const { jobs } = await loadEntries(business.id);
  const ins = customerInsights(jobs, niche, new Date());
  const lapsedValue = ins.atRisk.reduce((s, c) => s + c.revenue, 0);
  const sample = sampleContext(niche);

  return (
    <>
      <PageHeader title="Customer Insights" subtitle="Who your best customers are, how many come back, and which regulars have gone quiet." />
      <EliteGate
        elite={elite}
        teaser={
          ins.atRisk.length ? (
            <>
              <strong className="text-ink">
                {ins.atRisk.length} regular{ins.atRisk.length === 1 ? "" : "s"}
              </strong>{" "}
              haven't been back in 6 months. They've spent <strong className="num text-ink">{money(lapsedValue)}</strong> with you before. Upgrade to see who they are and download the
              win-back list.
            </>
          ) : (
            <>See your top customers, VIP/Core/Occasional segments, repeat rate, and a win-back list of regulars who stopped coming.</>
          )
        }
        preview={<CustomerView ins={customerInsights(sample.orders, niche, sample.today)} niche={niche} money={money} exportable={false} />}
      >
        <CustomerView ins={ins} niche={niche} money={money} exportable />
      </EliteGate>
    </>
  );
}
