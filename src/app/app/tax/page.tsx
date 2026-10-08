import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { loadPeriod, parsePeriod, settingsOf } from "@/lib/data";
import { moneyFormatter, percent } from "@/lib/format";
import { taxSummary } from "@/lib/metrics";
import { getNiche } from "@/niches";
import { Card, PageHeader, PeriodTabs, TAX_DISCLAIMER } from "@/components/ui";
import { ReserveForm } from "./reserve-form";

export const metadata = { title: "Tax & Deductions" };

function Row({ label, value, strong, sub }: { label: string; value: string; strong?: boolean; sub?: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${strong ? "border-t border-line-strong font-semibold" : ""}`}>
      <span className="text-sm">
        {label}
        {sub && <span className="block text-xs font-normal text-muted">{sub}</span>}
      </span>
      <span className="num">{value}</span>
    </div>
  );
}

export default async function TaxPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const { periodJobs, periodExpenses } = await loadPeriod(business, period);
  const t = taxSummary(settingsOf(business), periodJobs, periodExpenses, niche.expenseCategories);
  const money = moneyFormatter(business.country);
  const funded = Math.min(t.reserveFunded, 1);

  return (
    <>
      <PageHeader title="Tax & Deductions" subtitle={`Built from your ${niche.job.plural.toLowerCase()} and expenses. Country and rates come from Settings (${t.country.name}).`}>
        <PeriodTabs current={period} base="/app/tax" />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Profit summary">
          <Row label="Total revenue" value={money(t.revenue)} />
          <Row label={`${niche.streams.a} + ${niche.streams.b} cost`} value={money(t.directCost)} />
          <Row label="Overhead expenses" value={money(t.overhead)} />
          <Row label="Total expenses" value={money(t.totalExpenses)} />
          <Row label="Net profit" value={money(t.netProfit)} strong />
        </Card>

        <Card title="Tax reserve">
          <Row label="Reserve rate" value={percent(t.reserveRate)} sub={business.reserveRateOverride !== null ? "Your override" : `${t.country.name} default`} />
          <Row label="Recommended reserve" value={money(t.recommendedReserve)} sub="Net profit × reserve rate" strong />
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-ink-2">
              <span>Funded</span>
              <span className="num">{percent(t.reserveFunded, 0)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(funded * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-2.5 rounded-full" style={{ width: `${funded * 100}%`, background: t.reserveFunded >= 0.8 ? "var(--good)" : "var(--warning)" }} />
            </div>
          </div>
          <div className="mt-4">
            <ReserveForm value={t.reserveSetAside} />
          </div>
        </Card>

        <Card title={`${t.country.vatLabel} position`}>
          {t.vatRegistered ? (
            <>
              <Row label="Rate" value={percent(t.vatRate)} />
              <Row label="Output tax (on revenue)" value={money(t.outputVat)} />
              <Row label={`Input tax (on overhead + ${niche.streams.a.toLowerCase()})`} value={money(t.inputVat)} />
              <Row label="Net owed" value={money(t.netVat)} strong />
            </>
          ) : (
            <p className="text-sm text-ink-2">
              You're not marked as {t.country.vatLabel} registered.{" "}
              <Link href="/app/settings" className="font-semibold text-brand hover:underline">
                Change in Settings
              </Link>{" "}
              to see output, input and net tax owed.
            </p>
          )}
        </Card>

        <Card title="Deductions by category">
          <table className="w-full text-sm">
            <tbody>
              {t.deductions.map((d) => (
                <tr key={d.category} className="border-b border-line last:border-0">
                  <td className="py-1.5">{d.category}</td>
                  <td className="num py-1.5 text-right">{money(d.amount)}</td>
                  <td className="num w-16 py-1.5 text-right text-muted">{percent(d.share, 0)}</td>
                </tr>
              ))}
              <tr className="border-t border-line-strong font-semibold">
                <td className="py-2">Total deductible overhead</td>
                <td className="num py-2 text-right">{money(t.totalDeductible)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
      <p className="mt-6 text-xs text-muted">{TAX_DISCLAIMER}</p>
    </>
  );
}
