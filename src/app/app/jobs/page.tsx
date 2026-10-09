import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { dateLabel, moneyFormatter } from "@/lib/format";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { statusLabel, vehicleLabel } from "@/lib/shop";
import { listJobs, type JobFilter } from "@/lib/shop-data";
import { loadAllJobs } from "@/lib/data";
import { getNiche } from "@/niches";
import { Card, Empty, PageHeader } from "@/components/ui";
import { PAGE_SIZE, Pager, parsePage } from "@/components/pager";
import { setJobPaid } from "../actions";
import { JobForm } from "../entry-forms";

export const metadata = { title: "Repair orders" };

const FILTERS: { key: JobFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "estimate", label: "Estimates" },
  { key: "open", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "unpaid", label: "Unpaid" },
];

const statusStyle: Record<string, string> = {
  estimate: "border-line-strong text-ink-2",
  open: "border-brand text-ink",
  completed: "border-transparent bg-surface-2 text-muted",
};

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; edit?: string }> }) {
  const sp = await searchParams;
  // Old "?edit=" links (quick-entry editing) now open the full editor.
  if (sp.edit && /^[0-9a-f-]{36}$/.test(sp.edit)) redirect(`/app/jobs/${sp.edit}/edit`);
  const filter = (FILTERS.some((f) => f.key === sp.status) ? sp.status : "all") as JobFilter;
  const q = (sp.q ?? "").slice(0, 100);
  const page = parsePage(sp.page);
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const money = moneyFormatter(business.country);
  const { rows, total, counts } = await listJobs(business.id, filter, q, PAGE_SIZE, (page - 1) * PAGE_SIZE);
  if (q && total === 1 && page === 1 && rows[0].job.ref.toLowerCase() === q.toLowerCase()) redirect(`/app/jobs/${rows[0].job.id}`);
  const technicians = [...new Set((await loadAllJobs(business.id)).map((j) => j.technician).filter(Boolean))].sort();
  const base = (f: JobFilter) => {
    const qs = new URLSearchParams({ ...(f !== "all" && { status: f }), ...(q && { q }) }).toString();
    return qs ? `/app/jobs?${qs}` : "/app/jobs";
  };
  const labels = { singular: niche.job.singular, customer: niche.job.customerLabel, short: niche.job.short };
  const badge = (k: JobFilter) => (k === "estimate" ? counts.estimate : k === "open" ? counts.open : k === "unpaid" ? counts.unpaid : 0);

  return (
    <>
      <PageHeader title={niche.job.plural} subtitle={`Estimates, work in progress and completed ${niche.job.plural.toLowerCase()}. Only completed ones count in your numbers.`}>
        <a href="/api/export/jobs" className="btn btn-ghost">
          Export CSV
        </a>
        <Link href="/app/jobs/new?estimate=1" className="btn btn-ghost">
          New estimate
        </Link>
        <Link href="/app/jobs/new" className="btn btn-primary">
          New {niche.job.singular.toLowerCase()}
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter" className="flex flex-wrap gap-1 rounded-lg border border-line-strong bg-surface p-0.5 text-sm">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={base(f.key)}
              aria-current={filter === f.key ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 font-medium ${filter === f.key ? "bg-brand text-brand-ink" : "text-ink-2 hover:text-ink"}`}
            >
              {f.label}
              {badge(f.key) > 0 && <span className="num ml-1.5 text-xs opacity-80">{badge(f.key)}</span>}
            </Link>
          ))}
        </nav>
        <form action="/app/jobs" className="flex gap-2">
          {filter !== "all" && <input type="hidden" name="status" value={filter} />}
          <label htmlFor="jq" className="sr-only">
            Search
          </label>
          <input id="jq" name="q" defaultValue={q} className="field w-56" placeholder={`${niche.job.short} #, customer, plate…`} />
          <button className="btn btn-ghost">Search</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <Empty title={q ? `Nothing matches “${q}”` : filter === "all" ? `No ${niche.job.plural.toLowerCase()} yet` : `No ${FILTERS.find((f) => f.key === filter)!.label.toLowerCase()}`}>
          {filter === "all" && !q && (
            <>
              <Link href="/app/jobs/new" className="font-semibold text-brand hover:underline">
                Create your first {niche.job.singular.toLowerCase()}
              </Link>
              , import a CSV, or load sample data from the dashboard.
            </>
          )}
        </Empty>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">{niche.job.short} #</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">{niche.job.customerLabel} & vehicle</th>
                  <th className="px-4 py-2.5 font-semibold">Work</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Margin</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ job: j, vehicle }) => {
                  const rev = jobRevenue(j);
                  const m = rev ? jobProfit(j) / rev : 0;
                  return (
                    <tr key={j.id} className="border-t border-line hover:bg-surface-2">
                      <td className="px-4 py-2">
                        <Link href={`/app/jobs/${j.id}`} className="font-semibold text-ink hover:text-brand hover:underline">
                          {j.ref}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {j.status !== "completed" && (
                            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${statusStyle[j.status]}`}>{statusLabel(j.status)}</span>
                          )}
                          {j.status === "completed" && !j.paid && <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-ink uppercase">Unpaid</span>}
                          {j.comeback && <span className="rounded bg-critical/15 px-1.5 py-0.5 text-[10px] font-bold text-critical-ink uppercase">{niche.details.comeback}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-ink-2">{dateLabel(j.date)}</td>
                      <td className="px-4 py-2">
                        {j.customerId ? (
                          <Link href={`/app/customers/${j.customerId}`} className="hover:underline">
                            {j.customer}
                          </Link>
                        ) : (
                          j.customer || <span className="text-muted">—</span>
                        )}
                        {vehicle?.make || vehicle?.model || vehicle?.plate ? <div className="text-xs text-muted">{vehicleLabel({ ...vehicle, year: vehicle.year ?? null, make: vehicle.make ?? "", model: vehicle.model ?? "", plate: vehicle.plate ?? "" })}</div> : null}
                      </td>
                      <td className="px-4 py-2">{j.category}</td>
                      <td className="num px-4 py-2 text-right">{money(rev)}</td>
                      <td className={`num px-4 py-2 text-right ${m < niche.thresholds.jobGrossMargin ? "text-critical-ink" : "text-ink-2"}`}>{(m * 100).toFixed(0)}%</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-3">
                          {j.status === "completed" && !j.paid && (
                            <form action={setJobPaid}>
                              <input type="hidden" name="id" value={j.id} />
                              <button className="text-xs font-semibold text-good-ink hover:underline">Mark paid</button>
                            </form>
                          )}
                          <Link href={`/app/jobs/${j.id}/edit`} className="text-xs font-semibold text-brand hover:underline">
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Pager page={page} total={total} base={base(filter)} />

      <details className="mt-6 rounded-xl border border-line bg-surface p-5">
        <summary className="cursor-pointer font-display text-sm font-bold tracking-wide text-ink-2 uppercase">Quick entry (totals only)</summary>
        <p className="mt-2 mb-4 text-sm text-ink-2">For logging a finished job's totals without line items, e.g. from another system. It's saved as completed.</p>
        <JobForm categories={niche.jobCategories} streams={niche.streams} labels={labels} details={niche.details} technicians={technicians} />
      </details>
    </>
  );
}
