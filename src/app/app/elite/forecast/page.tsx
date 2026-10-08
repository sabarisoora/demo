import { isElite, requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { monthLabel, moneyFormatter } from "@/lib/format";
import { forecast, monthlySeries } from "@/lib/metrics";
import { getCountry } from "@/lib/countries";
import { getNiche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { MonthChart } from "@/components/month-chart";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "6-Month Forecast" };

type F = ReturnType<typeof forecast>;

function ForecastView({ f, money, symbol }: { f: F; money: (n: number) => string; symbol: string }) {
  const sum = (k: keyof F[number]) => f.reduce((s, p) => s + (p[k] as number), 0);
  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Conservative", "conservative", "Revenue 10% below trend"],
            ["Expected", "expected", "Current trend continues"],
            ["Aggressive", "aggressive", "Revenue 10% above trend"],
          ] as const
        ).map(([label, key, hint]) => (
          <Card key={key}>
            <div className="text-xs font-semibold tracking-wider text-muted uppercase">{label} · 6-month profit</div>
            <div className={`num mt-2 text-2xl font-semibold ${sum(key) < 0 ? "text-critical-ink" : ""}`}>{money(sum(key))}</div>
            <div className="mt-1 text-xs text-muted">{hint}</div>
          </Card>
        ))}
      </div>
      <Card title="Projected revenue vs. expenses">
        <MonthChart
          seriesA="Revenue"
          seriesB="Expenses"
          symbol={symbol}
          points={f.map((p) => ({ label: monthLabel(p.month), longLabel: monthLabel(p.month, true), a: p.revenue, b: p.expenses, extra: `Range: ${money(p.conservative)} to ${money(p.aggressive)}` }))}
        />
      </Card>
      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Month</th>
                <th className="px-4 py-2.5 text-right font-semibold">Conservative</th>
                <th className="px-4 py-2.5 text-right font-semibold">Expected</th>
                <th className="px-4 py-2.5 text-right font-semibold">Aggressive</th>
              </tr>
            </thead>
            <tbody className="num">
              {f.map((p) => (
                <tr key={p.month} className="border-t border-line">
                  <td className="px-4 py-2 font-sans">{monthLabel(p.month, true)}</td>
                  <td className="px-4 py-2 text-right">{money(p.conservative)}</td>
                  <td className="px-4 py-2 text-right font-semibold">{money(p.expected)}</td>
                  <td className="px-4 py-2 text-right">{money(p.aggressive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          Trend fitted to the last 11 complete months. A planning estimate, not a guarantee. Seasonal businesses should read it alongside last year's same months.
        </p>
      </Card>
    </>
  );
}

export default async function ForecastPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const symbol = getCountry(business.country).symbol;
  const today = new Date();
  const { jobs, expenses } = await loadEntries(business.id);
  const f = forecast(monthlySeries(jobs, expenses, today), today);

  // Sample preview: sample data spans 12 months ending at its last month.
  const lastSample = niche.sample.orders.map((o) => o.date).sort().at(-1)!;
  const sampleToday = new Date(Number(lastSample.slice(0, 4)), Number(lastSample.slice(5, 7)) - 1, 15);
  const sampleF = forecast(monthlySeries(niche.sample.orders, niche.sample.expenses, sampleToday), sampleToday);
  const expected = f.reduce((s, p) => s + p.expected, 0);

  return (
    <>
      <PageHeader title="6-Month Forecast" subtitle="Where profit is heading if the current trend holds, with conservative and aggressive scenarios." />
      <EliteGate
        elite={elite}
        teaser={
          jobs.length ? (
            <>
              Based on your last 12 months, your expected profit over the next 6 months is{" "}
              <strong className={expected < 0 ? "text-critical-ink" : "text-ink"}>{expected < 0 ? "negative" : "positive"}</strong>. Upgrade to see the month-by-month numbers and the best/worst case.
            </>
          ) : (
            <>See next 6 months of revenue, expenses and profit under three scenarios, so you can plan hiring, equipment and cash.</>
          )
        }
        preview={<ForecastView f={sampleF} money={money} symbol={symbol} />}
      >
        <ForecastView f={f} money={money} symbol={symbol} />
      </EliteGate>
    </>
  );
}
