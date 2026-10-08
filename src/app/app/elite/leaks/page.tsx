import { isElite, requireSession } from "@/lib/auth";
import { loadPeriod, parsePeriod, settingsOf } from "@/lib/data";
import { count, moneyFormatter, percent } from "@/lib/format";
import { monthlySeries, profitLeaks, taxSummary, type Leak, type Settings } from "@/lib/metrics";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, PageHeader, PeriodTabs } from "@/components/ui";

export const metadata = { title: "Profit Leak Detector" };

function compute(settings: Settings, jobs: Parameters<typeof profitLeaks>[1], expenses: Parameters<typeof profitLeaks>[2], allJobs: typeof jobs, allExpenses: typeof expenses, niche: Niche, today: Date) {
  const t = taxSummary(settings, jobs, expenses, niche.expenseCategories);
  return profitLeaks(t, jobs, expenses, monthlySeries(allJobs, allExpenses, today), niche);
}

function LeakList({ leaks, money }: { leaks: Leak[]; money: (n: number) => string }) {
  const fmt = (l: Leak, v: number) => (l.format === "money" ? money(v) : l.format === "percent" ? percent(v) : count(v));
  const total = leaks.reduce((s, l) => s + l.impact, 0);
  const sorted = [...leaks].sort((a, b) => Number(b.leaking) - Number(a.leaking) || b.impact - a.impact);
  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card>
          <div className="text-xs font-semibold tracking-wider text-muted uppercase">Estimated profit leaking</div>
          <div className="num mt-2 text-3xl font-semibold text-critical-ink">{money(total)}</div>
          <div className="mt-1 text-xs text-muted">Sum of the fixable gaps below, for this period</div>
        </Card>
        <Card>
          <div className="text-xs font-semibold tracking-wider text-muted uppercase">Checks flagged</div>
          <div className="num mt-2 text-3xl font-semibold">
            {leaks.filter((l) => l.leaking).length} <span className="text-lg text-muted">/ {leaks.length}</span>
          </div>
          <div className="mt-1 text-xs text-muted">Margins, pricing, overhead, rising costs, tax</div>
        </Card>
      </div>
      <div className="space-y-3">
        {sorted.map((l) => (
          <Card key={l.key}>
            <div className="flex flex-wrap items-start gap-4">
              <span
                className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-bold"
                aria-label={l.leaking ? "Review" : "Healthy"}
              >
                <span aria-hidden="true" style={{ color: l.leaking ? "var(--critical)" : "var(--good)" }}>
                  {l.leaking ? "▼" : "▲"}
                </span>
                {l.leaking ? "Review" : "Healthy"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold">{l.title}</div>
                <div className="text-sm text-ink-2">{l.detail}</div>
                <div className="mt-1 text-xs text-muted">
                  {l.metric}: <span className="num text-ink">{fmt(l, l.value)}</span> · threshold <span className="num">{fmt(l, l.threshold)}</span>
                </div>
              </div>
              {l.impact > 0 && (
                <div className="text-right">
                  <div className="num text-lg font-semibold text-critical-ink">{money(l.impact)}</div>
                  <div className="text-xs text-muted">est. lost profit</div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default async function LeaksPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const today = new Date();
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const d = await loadPeriod(business, period, today);
  const leaks = compute(settingsOf(business), d.periodJobs, d.periodExpenses, d.jobs, d.expenses, niche, today);
  const flagged = leaks.filter((l) => l.leaking);
  const impact = leaks.reduce((s, l) => s + l.impact, 0);

  return (
    <>
      <PageHeader title="Profit Leak Detector" subtitle="Traffic-light checks on margins, pricing, overhead, rising costs and tax, each with the money it's costing you.">
        {elite && <PeriodTabs current={period} base="/app/elite/leaks" />}
      </PageHeader>
      <EliteGate
        elite={elite}
        teaser={
          d.jobs.length ? (
            <>
              We checked your data and found{" "}
              <strong className="text-ink">
                {flagged.length} leak{flagged.length === 1 ? "" : "s"}
              </strong>
              {impact > 0 && (
                <>
                  {" "}
                  worth about <strong className="num text-critical-ink">{money(impact)}</strong> in lost profit
                </>
              )}
              . Upgrade to see exactly where, and what to fix first.
            </>
          ) : (
            <>Add your {niche.job.plural.toLowerCase()} and expenses, and Elite pinpoints where profit is slipping away, in money, not just percentages.</>
          )
        }
        preview={<LeakList money={money} leaks={sampleLeaks(niche, today)} />}
      >
        <LeakList leaks={leaks} money={money} />
      </EliteGate>
    </>
  );
}

function sampleLeaks(niche: Niche, today: Date) {
  const { orders, expenses } = niche.sample;
  const settings: Settings = { country: "United States", vatRegistered: false, vatRateOverride: null, reserveRateOverride: null, openingCash: 0, reserveSetAside: 0, fiscalYearStart: 1 };
  return compute(settings, orders, expenses, orders, expenses, niche, today);
}
