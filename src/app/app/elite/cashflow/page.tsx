import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { getCountry } from "@/lib/countries";
import { loadEntries } from "@/lib/data";
import { cashFlow } from "@/lib/elite-metrics";
import { monthLabel, moneyFormatter } from "@/lib/format";
import { sampleContext } from "@/lib/sample";
import { getNiche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { MonthChart } from "@/components/month-chart";
import { Card, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Cash Flow" };

type CF = ReturnType<typeof cashFlow>;

function CashView({ cf, money, symbol }: { cf: CF; money: (n: number) => string; symbol: string }) {
  const runway = cf.runwayMonths;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Cash position now" value={money(cf.endingCash)} tone={cf.endingCash < 0 ? "bad" : "good"} hint="Opening cash + everything logged" />
        <Stat
          label="Runway"
          value={runway === null ? "—" : runway >= 24 ? "24+ months" : `${runway.toFixed(1)} months`}
          tone={runway !== null && runway < 1 ? "bad" : undefined}
          hint="Months of expenses your cash covers"
        />
        <Stat label="Avg monthly outflow" value={money(cf.avgOutflow)} hint="Last 3 complete months" />
        <Stat label="Months with negative cash flow" value={`${cf.negativeMonths} / 12`} tone={cf.negativeMonths > 3 ? "bad" : undefined} />
      </div>

      <Card title="Money in vs money out · last 12 months" className="mt-4">
        <MonthChart
          seriesA="Money in"
          seriesB="Money out"
          symbol={symbol}
          points={cf.rows.map((r) => ({ label: monthLabel(r.month), longLabel: monthLabel(r.month, true), a: r.inflow, b: r.outflow, extra: `Cash after: ${money(r.cash)}` }))}
        />
      </Card>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Month</th>
                <th className="px-4 py-2.5 text-right font-semibold">Money in</th>
                <th className="px-4 py-2.5 text-right font-semibold">Money out</th>
                <th className="px-4 py-2.5 text-right font-semibold">Net</th>
                <th className="px-4 py-2.5 text-right font-semibold">Cash position</th>
              </tr>
            </thead>
            <tbody className="num">
              {cf.rows.map((r) => (
                <tr key={r.month} className={`border-t border-line ${r.month === cf.lowest.month ? "bg-surface-2" : ""}`}>
                  <td className="px-4 py-2 font-sans">
                    {monthLabel(r.month, true)}
                    {r.month === cf.lowest.month && <span className="ml-2 text-xs text-muted">lowest point</span>}
                  </td>
                  <td className="px-4 py-2 text-right">{money(r.inflow)}</td>
                  <td className="px-4 py-2 text-right">{money(r.outflow)}</td>
                  <td className={`px-4 py-2 text-right ${r.net < 0 ? "text-critical-ink" : "text-good-ink"}`}>{money(r.net)}</td>
                  <td className={`px-4 py-2 text-right font-semibold ${r.cash < 0 ? "text-critical-ink" : ""}`}>{money(r.cash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          Cash basis: revenue counts in the month of the job and costs in the month you logged them. Started from {money(cf.startingCash)} at the beginning of the period.
        </p>
      </Card>
    </>
  );
}

export default async function CashFlowPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const symbol = getCountry(business.country).symbol;
  const { jobs, expenses } = await loadEntries(business.id);
  const cf = cashFlow(jobs, expenses, business.openingCash, new Date());
  const sample = sampleContext(niche);

  return (
    <>
      <PageHeader title="Cash Flow" subtitle="Money in, money out, and how long your cash lasts.">
        {elite && (
          <Link href="/app/settings" className="btn btn-ghost">
            Set opening cash
          </Link>
        )}
      </PageHeader>
      <EliteGate
        elite={elite}
        teaser={
          jobs.length ? (
            <>
              You had <strong className="text-ink">{cf.negativeMonths} month{cf.negativeMonths === 1 ? "" : "s"}</strong> with more money going out than coming in this year.
              Upgrade to see your cash position month by month and how many months of runway you have.
            </>
          ) : (
            <>See money in vs money out each month, your running cash position, and how many months of expenses your cash covers.</>
          )
        }
        preview={<CashView cf={cashFlow(sample.orders, sample.expenses, 20000, sample.today)} money={money} symbol={symbol} />}
      >
        {business.openingCash === 0 && (
          <p className="mb-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-ink-2">
            Tip: set your <strong>opening cash balance</strong> in{" "}
            <Link href="/app/settings" className="font-semibold text-brand hover:underline">
              Settings
            </Link>{" "}
            (what was in the bank when you started tracking) for an accurate cash position and runway.
          </p>
        )}
        <CashView cf={cf} money={money} symbol={symbol} />
      </EliteGate>
    </>
  );
}
