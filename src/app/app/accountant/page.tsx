import { requireSession } from "@/lib/auth";
import { loadPeriod, parsePeriod, settingsOf } from "@/lib/data";
import { dateLabel, moneyFormatter } from "@/lib/format";
import { periodStart, taxSummary } from "@/lib/metrics";
import { getNiche } from "@/niches";
import { Card, PageHeader, PeriodTabs, TAX_DISCLAIMER } from "@/components/ui";
import { toggleChecklist } from "../actions";
import { PrintButton } from "./print-button";

export const metadata = { title: "Accountant Export" };

const DOCS = [
  ["statements", "Bank & credit card statements"],
  ["invoices", "Invoices issued to customers"],
  ["receipts", "Receipts for logged expenses"],
  ["prior-return", "Prior year tax return"],
  ["insurance", "Business insurance documents"],
  ["equipment", "Equipment purchase receipts"],
] as const;

export default async function AccountantPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const today = new Date();
  const { periodJobs, periodExpenses } = await loadPeriod(business, period, today);
  const t = taxSummary(settingsOf(business), periodJobs, periodExpenses, niche.expenseCategories);
  const money = moneyFormatter(business.country);
  const start = periodStart(period, today, business.fiscalYearStart);
  const docs = business.checklist?.docs ?? {};
  const ready = DOCS.filter(([k]) => docs[k]).length;

  const lines: [string, number][] = [
    ["Total revenue", t.revenue],
    ["Total expenses", t.totalExpenses],
    ["Net profit", t.netProfit],
    ["Cash position (opening cash + net profit)", t.cashPosition],
    ["Recommended tax reserve", t.recommendedReserve],
    ["Tax reserve set aside so far", t.reserveSetAside],
    [`Net ${t.country.vatLabel} owed`, t.netVat],
    ["Total deductible overhead", t.totalDeductible],
  ];

  return (
    <>
      <PageHeader title="Accountant Export" subtitle="A one-page summary to print or send to your accountant, plus the raw data as CSV.">
        <PeriodTabs current={period} base="/app/accountant" />
        <PrintButton />
        <a href="/api/export/jobs" className="btn btn-ghost">
          {niche.job.plural} CSV
        </a>
        <a href="/api/export/expenses" className="btn btn-ghost">
          Expenses CSV
        </a>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 border-b border-line pb-4">
            <div className="font-display text-xl font-extrabold">{business.name || "Your business"}</div>
            <div className="text-sm text-ink-2">
              {business.ownerName && `${business.ownerName} · `}
              {t.country.name} · {start ? `${dateLabel(start)} – ${dateLabel(today.toISOString().slice(0, 10))}` : `All records as of ${dateLabel(today.toISOString().slice(0, 10))}`}
            </div>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {lines.map(([label, v]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="py-2">{label}</td>
                  <td className="num py-2 text-right font-medium">{money(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="mt-6 mb-2 text-xs font-bold tracking-wide text-ink-2 uppercase">Deductions by category</h3>
          <table className="w-full text-sm">
            <tbody>
              {t.deductions
                .filter((d) => d.amount > 0)
                .map((d) => (
                  <tr key={d.category} className="border-b border-line last:border-0">
                    <td className="py-1.5">{d.category}</td>
                    <td className="num py-1.5 text-right">{money(d.amount)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="mt-6 text-xs text-muted">{TAX_DISCLAIMER}</p>
        </Card>

        <Card title={`Documents ready · ${ready} / ${DOCS.length}`} className="no-print">
          <ul className="space-y-2 text-sm">
            {DOCS.map(([key, label]) => (
              <li key={key}>
                <form action={toggleChecklist}>
                  <input type="hidden" name="group" value="docs" />
                  <input type="hidden" name="key" value={key} />
                  <button className="flex w-full items-center gap-2 text-left" aria-pressed={!!docs[key]}>
                    <span aria-hidden="true" className={docs[key] ? "text-good-ink" : "text-muted"}>
                      {docs[key] ? "☑" : "☐"}
                    </span>
                    <span className={docs[key] ? "text-ink" : "text-ink-2"}>{label}</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Gather these before filing.</p>
        </Card>
      </div>
    </>
  );
}
