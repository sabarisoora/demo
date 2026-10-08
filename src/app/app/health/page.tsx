import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { loadPeriod, parsePeriod, settingsOf } from "@/lib/data";
import { dateLabel } from "@/lib/format";
import { healthSnapshot, monthlySeries, statusFor, taxSummary } from "@/lib/metrics";
import { getNiche } from "@/niches";
import { Card, PageHeader, PeriodTabs, StatusBadge } from "@/components/ui";

export const metadata = { title: "Health Snapshot" };

function Gauge({ score }: { score: number }) {
  const r = 52;
  const c = Math.PI * r;
  const color = score >= 65 ? "var(--good)" : score >= 35 ? "var(--warning)" : "var(--critical)";
  return (
    <svg viewBox="0 0 128 76" className="w-48" role="img" aria-label={`Overall score ${Math.round(score)} out of 100`}>
      <path d="M12 68 A52 52 0 0 1 116 68" fill="none" stroke="var(--surface-2)" strokeWidth="12" strokeLinecap="round" />
      <path d="M12 68 A52 52 0 0 1 116 68" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      <text x="64" y="62" textAnchor="middle" fontSize="28" fontWeight="600" fill="var(--ink)" className="num">
        {Math.round(score)}
      </text>
    </svg>
  );
}

export default async function HealthPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const today = new Date();
  const { jobs, expenses, periodJobs, periodExpenses } = await loadPeriod(business, period, today);
  const t = taxSummary(settingsOf(business), periodJobs, periodExpenses, niche.expenseCategories);
  const h = healthSnapshot(t, monthlySeries(jobs, expenses, today));

  return (
    <>
      <PageHeader title="Business Health Snapshot" subtitle={`As of ${dateLabel(today.toISOString().slice(0, 10))}. Five checks, each scored 0–100.`}>
        <PeriodTabs current={period} base="/app/health" />
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Overall score" className="flex flex-col items-center text-center">
          <Gauge score={h.overall} />
          <div className="mt-2">
            <StatusBadge status={h.status} size="lg" />
          </div>
          <p className="mt-4 text-xs text-muted">85+ Excellent · 65+ Good · 35+ Needs attention · below 35 Critical</p>
        </Card>
        <Card title="Breakdown" className="lg:col-span-2">
          <ul className="divide-y divide-line">
            {h.components.map((c) => (
              <li key={c.key} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.label}</div>
                  <div className="text-xs text-muted">{c.why}</div>
                </div>
                <div className="hidden w-32 sm:block">
                  <div className="h-2 rounded-full bg-surface-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${c.score}%`, background: c.score >= 65 ? "var(--good)" : c.score >= 35 ? "var(--warning)" : "var(--critical)" }}
                    />
                  </div>
                </div>
                <span className="num w-8 text-right font-semibold">{c.score}</span>
                <StatusBadge status={statusFor(c.score)} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {!isElite(user) && (
        <div className="mt-4 rounded-xl border border-line bg-brand-soft p-5 text-sm">
          <strong>Want to know why?</strong> Elite's Profit Leak Detector shows the exact jobs, prices and expenses dragging this score down, with the money each one costs you.{" "}
          <Link href="/app/elite/leaks" className="font-semibold text-brand hover:underline">
            See a preview →
          </Link>
        </div>
      )}
    </>
  );
}
