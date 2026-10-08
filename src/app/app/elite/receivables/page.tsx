import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { receivables } from "@/lib/elite-metrics";
import { count, dateLabel, moneyFormatter, percent } from "@/lib/format";
import { sampleContext } from "@/lib/sample";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";
import { setJobPaid } from "../../actions";

export const metadata = { title: "Receivables" };

type AR = ReturnType<typeof receivables<{ id?: string; ref?: string; customer?: string; date: string; category: string; revenueA: number; costA: number; revenueB: number; costB: number; paid?: boolean }>>;

// Darker = older: ordinal steps 250/400/500/600 of the sequential blue (validated on light and dark).
const BUCKET_COLORS = ["#86b6ef", "#3987e5", "#256abf", "#184f95"];

function ARView({ ar, niche, money, actions }: { ar: AR; niche: Niche; money: (n: number) => string; actions: boolean }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Owed to you" value={money(ar.total)} hint={`${count(ar.open.length)} unpaid ${niche.job.plural.toLowerCase()}`} />
        <Stat label="Over 90 days" value={money(ar.over90)} tone={ar.over90 > 0 ? "bad" : "good"} hint="Hardest to collect" />
        <Stat label="Current (≤30 days)" value={percent(ar.currentShare, 0)} hint="Share of what's owed" />
        <Stat label="Average age" value={`${Math.round(ar.avgDays)} days`} hint="Weighted by amount" />
      </div>

      <Card title="Aging" className="mt-4">
        <div className="flex h-4 overflow-hidden rounded-full bg-surface-2" role="img" aria-label="Amount owed by age">
          {ar.buckets.map((b, i) =>
            b.amount > 0 ? <div key={b.bucket} style={{ width: `${b.share * 100}%`, background: BUCKET_COLORS[i], borderRight: "2px solid var(--surface)" }} /> : null,
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ar.buckets.map((b, i) => (
            <div key={b.bucket}>
              <div className="flex items-center gap-1.5 text-xs text-ink-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BUCKET_COLORS[i] }} />
                {b.bucket}
              </div>
              <div className="num mt-1 font-semibold">{money(b.amount)}</div>
              <div className="num text-xs text-muted">{count(b.count)} · {percent(b.share, 0)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Unpaid, oldest first" className="mt-4 overflow-hidden p-0">
        {ar.open.length === 0 ? (
          <p className="p-5 text-sm text-ink-2">Everything is paid. Nice.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">{niche.job.short} #</th>
                  <th className="px-4 py-2.5 font-semibold">{niche.job.customerLabel}</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Days</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {ar.open.slice(0, 100).map((o, i) => (
                  <tr key={o.job.id ?? i} className="border-t border-line">
                    <td className="px-4 py-2 font-medium">{o.job.ref}</td>
                    <td className="px-4 py-2 text-ink-2">{o.job.customer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-ink-2">{dateLabel(o.job.date)}</td>
                    <td className={`num px-4 py-2 text-right ${o.days > 90 ? "font-semibold text-critical-ink" : ""}`}>{o.days}</td>
                    <td className="num px-4 py-2 text-right">{money(o.amount)}</td>
                    <td className="px-4 py-2 text-right">
                      {actions && o.job.id && (
                        <form action={setJobPaid}>
                          <input type="hidden" name="id" value={o.job.id} />
                          <button className="text-xs font-semibold text-good-ink hover:underline">Mark paid</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-line px-4 py-3 text-xs text-muted">Age is counted from the {niche.job.singular.toLowerCase()} date.</p>
      </Card>
    </>
  );
}

export default async function ReceivablesPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const { jobs } = await loadEntries(business.id);
  const today = new Date();
  const ar = receivables(jobs, today);
  const sample = sampleContext(niche);

  return (
    <>
      <PageHeader title="Receivables" subtitle="Who owes you money, how old each balance is, and what to chase first." />
      <EliteGate
        elite={elite}
        teaser={
          ar.open.length ? (
            <>
              Customers owe you <strong className="num text-ink">{money(ar.total)}</strong>
              {ar.over90 > 0 && (
                <>
                  , and <strong className="num text-critical-ink">{money(ar.over90)}</strong> of it is over 90 days old
                </>
              )}
              . Upgrade to see the aging breakdown and a chase list, oldest first.
            </>
          ) : (
            <>Track unpaid {niche.job.plural.toLowerCase()}, see balances aged 30/60/90+ days, and mark them paid as money comes in.</>
          )
        }
        preview={<ARView ar={receivables(sample.orders, sample.today)} niche={niche} money={money} actions={false} />}
      >
        {ar.open.length === 0 && !jobs.some((j) => !j.paid) ? (
          <Empty title="Nothing owed right now">
            When a {niche.job.singular.toLowerCase()} isn't paid on the spot, tick <strong>Not paid yet</strong> under More details on the{" "}
            <Link href="/app/jobs" className="font-semibold text-brand hover:underline">
              {niche.job.plural}
            </Link>{" "}
            page. It shows up here until you mark it paid.
          </Empty>
        ) : (
          <ARView ar={ar} niche={niche} money={money} actions />
        )}
      </EliteGate>
    </>
  );
}
