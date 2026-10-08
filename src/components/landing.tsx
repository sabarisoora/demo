import Link from "next/link";
import { Logo } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { monthlySeries, profitLeaks, statusFor, taxSummary } from "@/lib/metrics";
import { percent } from "@/lib/format";
import type { Niche } from "@/niches";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Headline figures for the mockup, computed from the niche's own sample data. */
function sampleFigures(niche: Niche) {
  const { orders, expenses } = niche.sample;
  const t = taxSummary(
    { country: "United States", vatRegistered: false, vatRateOverride: null, reserveRateOverride: null, openingCash: 0, reserveSetAside: 0, fiscalYearStart: 1 },
    orders,
    expenses,
    niche.expenseCategories,
  );
  const last = orders.map((o) => o.date).sort().at(-1)!;
  const today = new Date(Number(last.slice(0, 4)), Number(last.slice(5, 7)) - 1, 15);
  const leaks = profitLeaks(t, orders, expenses, monthlySeries(orders, expenses, today), niche);
  const flagged = leaks.filter((l) => l.leaking).length;
  const impact = leaks.reduce((s, l) => s + l.impact, 0);
  return { t, flagged, impact, status: statusFor(t.netMargin >= 0.2 ? 100 : t.netMargin >= 0.1 ? 70 : 40) };
}

function MockDashboard({ niche }: { niche: Niche }) {
  const { t, flagged, impact, status } = sampleFigures(niche);
  const bars = [62, 70, 58, 77, 81, 74, 88, 84, 92, 79, 95, 101];
  const exp = [48, 52, 47, 55, 58, 54, 61, 60, 63, 59, 66, 68];
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] sm:p-5" aria-hidden="true">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-sm font-bold">{niche.name} Dashboard</span>
        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-bold tracking-wider text-good-ink uppercase">▲ {status}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Net profit", usd(t.netProfit)],
          ["Net margin", percent(t.netMargin)],
          ["Tax reserve", usd(t.recommendedReserve)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-line p-2.5">
            <div className="text-[10px] font-semibold tracking-wider text-muted uppercase">{l}</div>
            <div className="num mt-1 text-base font-semibold sm:text-lg">{v}</div>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 240 90" className="mt-4 w-full">
        {[0, 30, 60].map((y) => (
          <line key={y} x1="0" x2="240" y1={84 - y} y2={84 - y} stroke="var(--grid)" />
        ))}
        {bars.map((b, i) => (
          <g key={i}>
            <rect x={i * 20 + 3} y={84 - b * 0.75} width="6" height={b * 0.75} rx="2" fill="var(--series-1)" />
            <rect x={i * 20 + 11} y={84 - exp[i] * 0.75} width="6" height={exp[i] * 0.75} rx="2" fill="var(--series-2)" />
          </g>
        ))}
      </svg>
      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <span className="font-bold text-good-ink">✓</span> Net margin is healthy (15%+).
        </div>
        <div className="flex gap-2">
          <span className="font-bold text-critical-ink">!</span> Tax reserve is underfunded. Set aside more.
        </div>
        <div className="flex gap-2 rounded-md bg-brand-soft px-2 py-1.5">
          <span className="font-bold text-accent">★</span> Elite found {flagged} profit leak{flagged === 1 ? "" : "s"}
          {impact > 0 && ` worth ${usd(impact)}`}.
        </div>
      </div>
    </div>
  );
}

export function Landing({ niche }: { niche: Niche }) {
  const signup = `/signup?niche=${niche.slug}`;
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="px-3 py-2 font-semibold text-ink-2 hover:text-ink">
            Log in
          </Link>
          <Link href={signup} className="btn btn-primary">
            Start free
          </Link>
        </nav>
      </header>

      <section className="ledger border-y border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-bold tracking-widest text-ink-2 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> For {niche.name.toLowerCase()} owners
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight [font-stretch:110%] sm:text-5xl lg:text-6xl">
              {niche.copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-2">{niche.copy.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={signup} className="btn btn-primary px-6 py-3 text-base">
                Get your free dashboard
              </Link>
              <span className="text-sm text-muted">Free forever plan · No card · 2-minute setup</span>
            </div>
          </div>
          <div className="rise [animation-delay:120ms] lg:rotate-[1.2deg]">
            <MockDashboard niche={niche} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight">Busy isn&apos;t the same as profitable.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {niche.copy.pains.map((p, i) => (
            <div key={p.title} className="rise rounded-xl border border-line bg-surface p-6" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="num mb-3 text-sm font-semibold text-accent">0{i + 1}</div>
              <h3 className="font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Your numbers in, answers out.</h2>
            <ol className="mt-6 space-y-5">
              {[
                ["Pick your country", "Currency, VAT/GST and a tax reserve rate are set for you (50 countries)."],
                [`Add ${niche.job.plural.toLowerCase()} and expenses`, "Type them in, or import a CSV from your shop software, spreadsheet or bank."],
                ["Read the dashboard", "Profit, margin, tax set-aside and a plain-English health check, updated instantly."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-ink">{i + 1}</span>
                  <div>
                    <div className="font-semibold">{t}</div>
                    <div className="text-sm text-ink-2">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-bg p-6">
              <div className="text-xs font-bold tracking-widest text-muted uppercase">Essential</div>
              <div className="num mt-2 text-3xl font-semibold">Free</div>
              <ul className="mt-4 space-y-2 text-sm text-ink-2">
                <li>✓ Profit dashboard</li>
                <li>✓ {niche.job.plural} & expenses</li>
                <li>✓ Tax reserve & VAT/GST</li>
                <li>✓ Health snapshot</li>
                <li>✓ Accountant export</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-brand bg-bg p-6">
              <div className="text-xs font-bold tracking-widest text-accent uppercase">Elite</div>
              <div className="num mt-2 text-3xl font-semibold">{process.env.NEXT_PUBLIC_ELITE_PRICE_LABEL || "Upgrade"}</div>
              <ul className="mt-4 space-y-2 text-sm text-ink-2">
                <li>★ Everything in Essential</li>
                <li>★ Profit Leak Detector</li>
                <li>★ Service profitability</li>
                <li>★ 6-month forecast</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">See what your {niche.businessNoun} really made.</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-2">Start with sample data in one click, then swap in your own numbers.</p>
        <Link href={signup} className="btn btn-primary mt-6 px-6 py-3 text-base">
          Create free account
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
