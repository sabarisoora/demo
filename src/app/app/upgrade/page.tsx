import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { eliteCheckoutUrl } from "@/lib/ds24";
import { getNiche } from "@/niches";
import { Card, OwnerOnly, PageHeader } from "@/components/ui";

export const metadata = { title: "Upgrade to Elite" };

export default async function UpgradePage() {
  const { user, business, role } = await requireSession();
  if (role !== "owner") return <OwnerOnly title="Upgrade to Elite" />;
  const niche = getNiche(business.niche);
  const checkout = eliteCheckoutUrl(user);
  const price = process.env.NEXT_PUBLIC_ELITE_PRICE_LABEL;

  if (isElite(user)) {
    return (
      <>
        <PageHeader title="You're on Elite" subtitle="Every feature is unlocked. Thanks for supporting ProfitIQS." />
        <Link href="/app/elite/leaks" className="btn btn-primary">
          Open Profit Leak Detector
        </Link>
      </>
    );
  }

  const essential = [
    `${niche.job.plural} & expense tracking`,
    "Profit dashboard + 12-month chart",
    "Tax reserve & VAT/GST position (50 countries)",
    "Business health snapshot",
    "Accountant export + CSV import/export",
  ];
  const elite = [
    ["Profit Leak Detector", "Finds the jobs, prices and costs draining profit, with the money each one costs you"],
    ["Service Profitability", `Margin and profit for every ${niche.job.singular.toLowerCase()} category: what to push, what to reprice`],
    ["6-Month Forecast", "Conservative, expected and aggressive profit scenarios for planning cash and hiring"],
    ["Customer Insights", "Top customers, VIP/Core/Occasional segments, repeat rate, and a win-back list of regulars who stopped coming"],
    ["Monthly Business Review", "A printable one-page report vs last month and the same month last year"],
    ["KPI Scorecard & Benchmarks", "Your own yearly goals with progress, and your numbers against industry benchmarks"],
    ["Cash Flow", "Money in vs out each month, running cash position and months of runway"],
    ["Receivables", "Unpaid balances aged 30/60/90+ days, with a chase list and one-click “mark paid”"],
    [`${niche.details.technicianPlural} & ${niche.details.comeback}s`, `Revenue, hours and effective rate per ${niche.details.technician.toLowerCase()}, plus where repeat repairs come from`],
    ["Everything in Essential", "Plus every new Elite report as it ships"],
  ];

  return (
    <>
      <PageHeader title="Upgrade to Elite" subtitle={`Essential tells you what happened. Elite tells you where your ${niche.businessNoun} is losing money and what to do next.`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Essential · free">
          <ul className="space-y-2 text-sm text-ink-2">
            {essential.map((e) => (
              <li key={e} className="flex gap-2">
                <span className="text-good-ink">✓</span>
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Your current plan.</p>
        </Card>
        <section className="rounded-xl border-2 border-brand bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-sm font-bold tracking-wide uppercase">Elite</h2>
            {price && <span className="num text-xl font-semibold">{price}</span>}
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {elite.map(([t, d]) => (
              <li key={t} className="flex gap-2">
                <span className="text-accent">★</span>
                <span>
                  <strong>{t}</strong>
                  <span className="block text-ink-2">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          {checkout ? (
            <a href={checkout} className="btn btn-primary mt-6 w-full">
              Upgrade securely with Digistore24
            </a>
          ) : (
            <p className="mt-6 rounded-md border border-dashed border-line-strong p-3 text-sm text-ink-2">
              Checkout isn't connected yet. (Owner: set <code>NEXT_PUBLIC_DS24_ELITE_PRODUCT_ID</code>.)
            </p>
          )}
          <p className="mt-3 text-center text-xs text-muted">
            Use the same email at checkout: <strong>{user.email}</strong>. Elite unlocks automatically within a minute of payment.
          </p>
        </section>
      </div>
    </>
  );
}
