import { isElite, requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { benchmarkRows, scorecard, ttmSummary, type BenchRow, type ScoreRow } from "@/lib/elite-metrics";
import { count, moneyFormatter, percent } from "@/lib/format";
import { sampleContext } from "@/lib/sample";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, PageHeader } from "@/components/ui";
import { GoalsForm } from "./goals-form";

export const metadata = { title: "KPI Scorecard & Benchmarks" };

function Scores({ rows, money }: { rows: ScoreRow[]; money: (n: number) => string }) {
  const fmt = (r: ScoreRow, v: number) => (r.format === "money" ? money(v) : r.format === "percent" ? percent(v) : count(Math.round(v)));
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li key={r.key} className="py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold">{r.label}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-bold">
              <span aria-hidden="true" style={{ color: r.onTarget ? "var(--good)" : "var(--warning)" }}>
                {r.onTarget ? "▲" : "◆"}
              </span>
              {r.onTarget ? "On target" : "Below target"}
            </span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(r.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={r.label}>
            <div className="h-2.5 rounded-full" style={{ width: `${Math.min(Math.max(r.progress, 0), 1) * 100}%`, background: r.onTarget ? "var(--good)" : "var(--series-1)" }} />
          </div>
          <div className="num mt-1 flex justify-between text-xs text-ink-2">
            <span>
              Actual <strong className="text-ink">{fmt(r, r.actual)}</strong>
            </span>
            <span>{percent(Math.max(r.progress, 0), 0)} of goal</span>
            <span>Goal {fmt(r, r.goal)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Benchmarks({ rows, money, niche }: { rows: BenchRow[]; money: (n: number) => string; niche: Niche }) {
  if (rows.length === 0) return <p className="text-sm text-ink-2">Industry benchmarks aren't available for the {niche.name.toLowerCase()} edition yet.</p>;
  const fmt = (r: BenchRow, v: number) => (r.format === "money" ? money(v) : r.format === "percent" ? percent(v) : `${v.toFixed(2)}×`);
  return (
    <>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{r.label}</div>
              <div className="text-xs text-muted">{r.better ? "At or better than benchmark." : r.hint}</div>
            </div>
            <div className="num text-right text-sm">
              <div className="font-semibold">{fmt(r, r.yours)}</div>
              <div className="text-xs text-muted">industry {fmt(r, r.benchmark)}</div>
            </div>
            <span className="inline-flex w-28 items-center justify-center gap-1.5 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-bold">
              <span aria-hidden="true" style={{ color: r.better ? "var(--good)" : "var(--critical)" }}>
                {r.better ? "▲" : "▼"}
              </span>
              {r.better ? "At/above" : "Below"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">{niche.benchmarks?.source}</p>
    </>
  );
}

export default async function ScorecardPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const goals = business.goals ?? niche.defaultGoals;
  const { jobs, expenses } = await loadEntries(business.id);
  const t = ttmSummary(jobs, expenses, new Date());
  const scores = scorecard(t, goals, niche);
  const bench = benchmarkRows(t, niche);
  const sample = sampleContext(niche);
  const st = ttmSummary(sample.orders, sample.expenses, sample.today);
  const labels = { avgTicket: `Average ${niche.job.short} value`, jobCount: `${niche.job.plural} per year` };

  const preview = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Goals vs actual · last 12 months">
        <Scores rows={scorecard(st, niche.defaultGoals, niche)} money={money} />
      </Card>
      <Card title="Benchmarks">
        <Benchmarks rows={benchmarkRows(st, niche)} money={money} niche={niche} />
      </Card>
    </div>
  );

  return (
    <>
      <PageHeader title="KPI Scorecard & Benchmarks" subtitle="Your goals and the industry's numbers, against your last 12 months." />
      <EliteGate
        elite={elite}
        teaser={
          t.jobCount ? (
            <>
              You're <strong className="text-ink">below the industry benchmark on {bench.filter((b) => !b.better).length} of {bench.length}</strong> key numbers. Upgrade to see
              which ones, set your own goals and track progress every month.
            </>
          ) : (
            <>Set yearly goals for revenue, profit, ticket size and margins, see progress, and compare your shop with industry benchmarks.</>
          )
        }
        preview={preview}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Goals vs actual · last 12 months">
            <Scores rows={scores} money={money} />
          </Card>
          <Card title="Benchmarks">
            <Benchmarks rows={bench} money={money} niche={niche} />
          </Card>
          <Card title="Your goals" className="lg:col-span-2">
            <p className="mb-4 text-sm text-ink-2">
              {business.goals ? "Your saved goals." : "Starting suggestions. Change them to your own targets."} Progress uses the last 12 months, so it moves every month.
            </p>
            <GoalsForm goals={goals} labels={labels} />
          </Card>
        </div>
      </EliteGate>
    </>
  );
}
