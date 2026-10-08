import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { dateLabel, moneyFormatter } from "@/lib/format";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { getNiche } from "@/niches";
import { Card, Empty, PageHeader } from "@/components/ui";
import { PAGE_SIZE, Pager, parsePage } from "@/components/pager";
import { deleteJob } from "../actions";
import { DeleteButton, JobForm } from "../entry-forms";

export const metadata = { title: "Entries" };

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ edit?: string; page?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const { jobs } = await loadEntries(business.id);
  const money = moneyFormatter(business.country);
  const editing = sp.edit ? jobs.find((j) => j.id === sp.edit) : undefined;
  const page = parsePage(sp.page);
  const rows = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const labels = { singular: niche.job.singular, customer: niche.job.customerLabel, short: niche.job.short };

  return (
    <>
      <PageHeader title={niche.job.plural} subtitle={`${niche.streams.a} and ${niche.streams.b} revenue and cost for every ${niche.job.singular.toLowerCase()}. Profit is calculated for you.`}>
        <a href="/api/export/jobs" className="btn btn-ghost">
          Export CSV
        </a>
        <Link href="/app/import" className="btn btn-ghost">
          Import CSV
        </Link>
      </PageHeader>

      <Card title={editing ? `Edit ${editing.ref || niche.job.singular}` : `Add a ${niche.job.singular.toLowerCase()}`}>
        <JobForm key={editing?.id ?? "new"} categories={niche.jobCategories} streams={niche.streams} labels={labels} initial={editing} />
      </Card>

      <div className="mt-4">
        {jobs.length === 0 ? (
          <Empty title={`No ${niche.job.plural.toLowerCase()} yet`}>Add one above, import a CSV, or load sample data from the dashboard.</Empty>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">{niche.job.short} #</th>
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold">{niche.job.customerLabel}</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Revenue</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Profit</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Margin</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((j) => {
                    const rev = jobRevenue(j);
                    const p = jobProfit(j);
                    const m = rev ? p / rev : 0;
                    return (
                      <tr key={j.id} className={`border-t border-line ${editing?.id === j.id ? "bg-brand-soft" : ""}`}>
                        <td className="px-4 py-2 font-medium">{j.ref}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-ink-2">{dateLabel(j.date)}</td>
                        <td className="px-4 py-2">{j.category}</td>
                        <td className="px-4 py-2 text-ink-2">{j.customer}</td>
                        <td className="num px-4 py-2 text-right">{money(rev)}</td>
                        <td className={`num px-4 py-2 text-right ${p < 0 ? "text-critical-ink" : ""}`}>{money(p)}</td>
                        <td className={`num px-4 py-2 text-right ${m < niche.thresholds.jobGrossMargin ? "text-critical-ink" : "text-ink-2"}`}>
                          {(m * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-3">
                            <Link href={`/app/jobs?edit=${j.id}`} className="text-xs font-semibold text-brand hover:underline">
                              Edit
                            </Link>
                            <DeleteButton action={deleteJob} id={j.id} label={j.ref || "this entry"} />
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
        <Pager page={page} total={jobs.length} base="/app/jobs" />
      </div>
    </>
  );
}
