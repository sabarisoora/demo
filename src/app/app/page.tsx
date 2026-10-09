import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { shopToday } from "@/lib/shop-data";
import { loadPeriod, parsePeriod, settingsOf } from "@/lib/data";
import { count, monthLabel, moneyFormatter, percent } from "@/lib/format";
import { businessStatus, insights, jobProfit, monthKey, monthlySeries, taxSummary } from "@/lib/metrics";
import { getNiche } from "@/niches";
import { MonthChart } from "@/components/month-chart";
import { Card, Check, PageHeader, PeriodTabs, Stat, StatusBadge } from "@/components/ui";
import { loadSample, toggleChecklist } from "./actions";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ period?: string; welcome?: string }> }) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const today = new Date();
  const { jobs, expenses, periodJobs, periodExpenses } = await loadPeriod(business, period, today);
  const money = moneyFormatter(business.country);
  const t = taxSummary(settingsOf(business), periodJobs, periodExpenses, niche.expenseCategories);
  const months = monthlySeries(jobs, expenses, today);
  const tips = insights(t, months, niche);
  const status = businessStatus(t);
  const avgProfit = periodJobs.length ? periodJobs.reduce((s, j) => s + jobProfit(j), 0) / periodJobs.length : 0;

  if (jobs.length === 0 && expenses.length === 0) {
    return (
      <>
        <PageHeader title={`Welcome${business.ownerName ? `, ${business.ownerName.split(" ")[0]}` : ""}`} subtitle="Your dashboard fills itself in as you add data. Three ways to start:" />
        <ShopToday businessId={business.id} reminderMonths={business.reminderMonths} elite={isElite(user)} money={money} jobLabel={niche.job.plural} />
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="1 · See it with sample data">
            <p className="mb-4 text-sm text-ink-2">
              Load 12 months of realistic {niche.name.toLowerCase()} data to explore every report. You can clear it anytime in Settings.
            </p>
            <form action={loadSample}>
              <button className="btn btn-primary">Load sample data</button>
            </form>
          </Card>
          <Card title="2 · Import your data">
            <p className="mb-4 text-sm text-ink-2">Upload your ProfitIQS Excel workbook, or a CSV of {niche.job.plural.toLowerCase()} or expenses from your current software or bank.</p>
            <Link href="/app/import" className="btn btn-ghost">
              Import data
            </Link>
          </Card>
          <Card title="3 · Enter by hand">
            <p className="mb-4 text-sm text-ink-2">Add your first {niche.job.singular.toLowerCase()} and expense. Takes about 30 seconds each.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/jobs/new" className="btn btn-ghost">
                New {niche.job.short}
              </Link>
              <Link href="/app/expenses" className="btn btn-ghost">
                Add expense
              </Link>
            </div>
          </Card>
        </div>
        <p className="mt-6 text-sm text-ink-2">
          Tip: set your country and tax options in{" "}
          <Link href="/app/settings" className="font-semibold text-brand hover:underline">
            Settings
          </Link>{" "}
          first, so currency and tax reserve are right.
        </p>
      </>
    );
  }

  const thisMonth = monthKey(today);
  const done = business.checklist?.[thisMonth] ?? {};
  const autoChecks = [
    { key: "revenue", label: `${niche.job.plural} entered this month`, done: jobs.some((j) => monthKey(j.date) === thisMonth) },
    { key: "expenses", label: "Expenses entered this month", done: expenses.some((e) => monthKey(e.date) === thisMonth) },
  ];
  const manualChecks = [
    { key: "bank", label: "Bank reconciled" },
    { key: "reserve", label: "Tax reserve checked" },
    { key: "review", label: "Dashboard reviewed" },
  ];

  return (
    <>
      <PageHeader title={`${niche.name} Dashboard`} subtitle={business.name || undefined}>
        <PeriodTabs current={period} base="/app" />
      </PageHeader>

      <ShopToday businessId={business.id} reminderMonths={business.reminderMonths} elite={isElite(user)} money={money} jobLabel={niche.job.plural} />

      <div className="rise grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total revenue" value={money(t.revenue)} />
        <Stat label="Total expenses" value={money(t.totalExpenses)} hint={`${niche.streams.a} + ${niche.streams.b} cost + overhead`} />
        <Stat label="Net profit" value={money(t.netProfit)} tone={t.netProfit < 0 ? "bad" : "good"} />
        <Stat label="Net margin" value={percent(t.netMargin)} hint={`Target ${percent(niche.thresholds.netMargin, 0)}+`} />
        <Stat label="Tax reserve needed" value={money(t.recommendedReserve)} hint={`${percent(t.reserveRate, 1)} of profit`} />
        <Stat label="Reserve funded" value={percent(t.reserveFunded, 0)} tone={t.reserveFunded < 0.8 ? "bad" : "good"} hint={`${money(t.reserveSetAside)} set aside`} />
        <Stat label={`Avg ${niche.job.short} profit`} value={money(avgProfit)} />
        <Stat label={`${niche.job.plural} logged`} value={count(periodJobs.length)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Revenue vs. expenses · last 12 months" className="lg:col-span-2">
          <MonthChart
            seriesA="Revenue"
            seriesB="Expenses"
            symbol={t.country.symbol}
            points={months.map((m) => ({
              label: monthLabel(m.month),
              longLabel: monthLabel(m.month, true),
              a: m.revenue,
              b: m.expenses,
              extra: `${m.jobs} ${niche.job.plural.toLowerCase()}`,
            }))}
          />
        </Card>
        <Card title="Business health">
          <div className="flex items-center justify-between">
            <StatusBadge status={status} size="lg" />
            <Link href="/app/health" className="text-xs font-semibold text-brand hover:underline">
              Full snapshot →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {tips.map((tip) => (
              <Check key={tip.text} ok={tip.ok}>
                {tip.text}
              </Check>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title={`Monthly checklist · ${monthLabel(thisMonth, true)}`}>
          <ul className="space-y-2 text-sm">
            {autoChecks.map((c) => (
              <li key={c.key} className="flex items-center gap-2">
                <span aria-hidden="true" className={c.done ? "text-good-ink" : "text-muted"}>
                  {c.done ? "☑" : "☐"}
                </span>
                <span className={c.done ? "text-ink" : "text-ink-2"}>{c.label}</span>
                <span className="ml-auto text-xs text-muted">auto</span>
              </li>
            ))}
            {manualChecks.map((c) => (
              <li key={c.key}>
                <form action={toggleChecklist} className="flex items-center gap-2">
                  <input type="hidden" name="group" value={thisMonth} />
                  <input type="hidden" name="key" value={c.key} />
                  <button className="flex w-full items-center gap-2 text-left" aria-pressed={!!done[c.key]}>
                    <span aria-hidden="true" className={done[c.key] ? "text-good-ink" : "text-muted"}>
                      {done[c.key] ? "☑" : "☐"}
                    </span>
                    <span className={done[c.key] ? "text-ink" : "text-ink-2"}>{c.label}</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Where the money went" className="lg:col-span-2">
          <Breakdown
            rows={[
              { label: `${niche.streams.a} cost`, value: periodJobs.reduce((s, j) => s + j.costA, 0) },
              { label: `${niche.streams.b} cost`, value: periodJobs.reduce((s, j) => s + j.costB, 0) },
              { label: "Overhead", value: t.overhead },
              { label: "Net profit", value: Math.max(t.netProfit, 0), profit: true },
            ]}
            total={Math.max(t.revenue, t.totalExpenses)}
            money={money}
          />
          <p className="mt-3 text-xs text-muted">Share of every unit of revenue. Overhead detail is on Tax &amp; Deductions.</p>
        </Card>
      </div>
    </>
  );
}

function Breakdown({ rows, total, money }: { rows: { label: string; value: number; profit?: boolean }[]; total: number; money: (n: number) => string }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const share = total > 0 ? r.value / total : 0;
        return (
          <li key={r.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-ink-2">{r.label}</span>
              <span className="num">
                {money(r.value)} <span className="text-muted">· {percent(share, 0)}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              <div className="h-2 rounded-full" style={{ width: `${Math.min(share * 100, 100)}%`, background: r.profit ? "var(--brand)" : "var(--ink-2)" }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function ShopToday({ businessId, reminderMonths, elite, money, jobLabel }: { businessId: string; reminderMonths: number; elite: boolean; money: (n: number) => string; jobLabel: string }) {
  const t = await shopToday(businessId, reminderMonths);
  const items = [
    { href: "/app/jobs?status=estimate", label: "Estimates waiting", value: count(t.estimates), hint: t.estimates ? money(t.estimateValue) : "None pending" },
    { href: "/app/jobs?status=open", label: "In progress", value: count(t.open), hint: `Open ${jobLabel.toLowerCase()}` },
    { href: "/app/jobs?status=unpaid", label: "Unpaid", value: count(t.unpaid), hint: t.unpaid ? money(t.unpaidValue) : "All collected", bad: t.unpaid > 0 },
    ...(elite
      ? [
          { href: "/app/inventory?filter=low", label: "Parts to reorder", value: count(t.lowStock), hint: "At or below reorder level", bad: t.lowStock > 0 },
          { href: "/app/reminders", label: "Service due", value: count(t.serviceDue), hint: "Next 30 days, not yet contacted" },
        ]
      : []),
  ];
  return (
    <section aria-label="Shop today" className="no-print mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="group rounded-lg border border-line bg-surface-2 px-3 py-2.5 hover:border-line-strong hover:bg-surface">
          <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">{i.label}</div>
          <div className={`num mt-0.5 text-lg font-semibold ${"bad" in i && i.bad ? "text-critical-ink" : ""}`}>{i.value}</div>
          <div className="truncate text-xs text-muted group-hover:text-ink-2">{i.hint} →</div>
        </Link>
      ))}
    </section>
  );
}
