import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { comebackStats, technicianStats, tracksDetails } from "@/lib/elite-metrics";
import { count, dateLabel, moneyFormatter, percent } from "@/lib/format";
import { sampleContext } from "@/lib/sample";
import { getNiche, type Niche } from "@/niches";
import { EliteGate } from "@/components/elite-gate";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Technicians & Comebacks" };

type Techs = ReturnType<typeof technicianStats>;
type Cbs = ReturnType<typeof comebackStats>;

function TechView({ techs, cbs, niche, money }: { techs: Techs; cbs: Cbs; niche: Niche; money: (n: number) => string }) {
  const d = niche.details;
  const target = niche.benchmarks?.comebackRate ?? 0.03;
  const maxRev = Math.max(1, ...techs.rows.map((r) => r.revenue));
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={d.technicianPlural} value={count(techs.rows.length)} hint={techs.unassigned ? `${count(techs.unassigned)} ${niche.job.plural.toLowerCase()} unassigned` : undefined} />
        <Stat label="Hours billed" value={count(Math.round(techs.rows.reduce((s, r) => s + r.hours, 0)))} />
        <Stat label={`${d.comeback} rate`} value={percent(cbs.rate)} tone={cbs.rate > target ? "bad" : "good"} hint={`Target ${percent(target, 0)} or lower`} />
        <Stat
          label={`Spent on ${d.comeback.toLowerCase()}s`}
          value={money(cbs.cost)}
          tone={cbs.netCost > 0 ? "bad" : undefined}
          hint={`${count(cbs.count)} repeat repairs · ${money(cbs.netCost)} after what customers paid`}
        />
      </div>

      <Card title={`${d.technicianPlural} ranked by revenue`} className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{d.technician}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{niche.job.plural}</th>
                <th className="px-4 py-2.5 text-right font-semibold">Hours</th>
                <th className="px-4 py-2.5 text-right font-semibold">{niche.streams.b} $/hour</th>
                <th className="px-4 py-2.5 text-right font-semibold">Avg ticket</th>
                <th className="px-4 py-2.5 text-right font-semibold">Profit</th>
                <th className="px-4 py-2.5 text-right font-semibold">{d.comeback}s</th>
                <th className="w-44 px-4 py-2.5 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {techs.rows.map((r) => (
                <tr key={r.name} className="border-t border-line">
                  <td className="px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="num px-4 py-2.5 text-right">{count(r.jobs)}</td>
                  <td className="num px-4 py-2.5 text-right">{r.hours.toFixed(1)}</td>
                  <td className="num px-4 py-2.5 text-right">{r.hours ? money(r.ratePerHour) : "—"}</td>
                  <td className="num px-4 py-2.5 text-right">{money(r.avgTicket)}</td>
                  <td className="num px-4 py-2.5 text-right">{money(r.profit)}</td>
                  <td className={`num px-4 py-2.5 text-right ${r.comebackRate > target ? "font-semibold text-critical-ink" : "text-ink-2"}`}>
                    {r.comebacks} <span className="text-xs">({percent(r.comebackRate, 0)})</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-surface-2">
                        <div className="h-2 rounded-full" style={{ width: `${(r.revenue / maxRev) * 100}%`, background: "var(--series-1)" }} />
                      </div>
                      <span className="num w-20 text-right">{money(r.revenue)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          {niche.streams.b} $/hour = {niche.streams.b.toLowerCase()} revenue ÷ hours billed: your effective rate. Red {d.comeback.toLowerCase()} rates are above {percent(target, 0)}.
        </p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title={`${d.comeback}s by category`}>
          {cbs.byCategory.length === 0 ? (
            <p className="text-sm text-ink-2">No {d.comeback.toLowerCase()}s recorded.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <tbody>
                {cbs.byCategory.map((c) => (
                  <tr key={c.category} className="border-t border-line first:border-0">
                    <td className="py-1.5">{c.category}</td>
                    <td className="num py-1.5 text-right">{c.count}</td>
                    <td className="num py-1.5 text-right text-ink-2">{percent(c.rate)} of jobs</td>
                    <td className="num py-1.5 text-right">{money(c.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
        <Card title={`Recent ${d.comeback.toLowerCase()}s`}>
          {cbs.recent.length === 0 ? (
            <p className="text-sm text-ink-2">None yet. Tick “{d.comeback}” on a {niche.job.singular.toLowerCase()} when it's a repeat repair.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {cbs.recent.slice(0, 8).map((j, i) => (
                <li key={`${j.ref}-${i}`} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate">
                    {j.ref} · {j.category}
                    {j.technician && <span className="text-muted"> · {j.technician}</span>}
                  </span>
                  <span className="shrink-0 text-ink-2">{dateLabel(j.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

export default async function TechniciansPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const { jobs } = await loadEntries(business.id);
  const tracked = tracksDetails(jobs);
  const techs = technicianStats(jobs);
  const cbs = comebackStats(jobs);
  const sample = sampleContext(niche);
  const d = niche.details;
  const worst = [...techs.rows].sort((x, y) => y.comebackRate - x.comebackRate)[0];

  return (
    <>
      <PageHeader
        title={`${d.technicianPlural} & ${d.comeback}s`}
        subtitle={`Who brings in the most, what each billed hour is really worth, and where repeat repairs come from.`}
      />
      <EliteGate
        elite={elite}
        teaser={
          tracked && techs.rows.length > 1 ? (
            <>
              Your {d.technicianPlural.toLowerCase()} aren't equal.{" "}
              {cbs.netCost > 0 ? (
                <>
                  {d.comeback}s cost you <strong className="num text-ink">{money(cbs.netCost)}</strong>
                </>
              ) : (
                <>
                  You had <strong className="text-ink">{count(cbs.count)} {d.comeback.toLowerCase()}s</strong>
                </>
              )}
              {worst && worst.comebacks > 0 && (
                <>
                  , and one {d.technician.toLowerCase()} has a <strong className="text-ink">{percent(worst.comebackRate, 0)}</strong> {d.comeback.toLowerCase()} rate
                </>
              )}
              . Upgrade to see who, and what each billed hour is really worth.
            </>
          ) : (
            <>
              Rank your {d.technicianPlural.toLowerCase()} by revenue, hours and effective {niche.streams.b.toLowerCase()} rate, and see which {d.comeback.toLowerCase()}s cost you most.
            </>
          )
        }
        preview={<TechView techs={technicianStats(sample.orders)} cbs={comebackStats(sample.orders)} niche={niche} money={money} />}
      >
        {tracked ? (
          <TechView techs={techs} cbs={cbs} niche={niche} money={money} />
        ) : (
          <Empty title={`Start recording ${d.technicianPlural.toLowerCase()} and ${d.comeback.toLowerCase()}s`}>
            Open <strong>More details</strong> when adding a {niche.job.singular.toLowerCase()} (on the{" "}
            <Link href="/app/jobs" className="font-semibold text-brand hover:underline">
              {niche.job.plural}
            </Link>{" "}
            page), or add <code>{d.technician}</code>, <code>Hours</code> and <code>{d.comeback}</code> columns to your CSV import.
          </Empty>
        )}
      </EliteGate>
    </>
  );
}
