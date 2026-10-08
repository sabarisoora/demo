import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand";
import { isAdmin, isElite, requireSession } from "@/lib/auth";
import { site } from "@/lib/site";
import { getNiche } from "@/niches";
import { logout } from "../(auth)/actions";
import { Nav, type NavItem } from "./nav";
import { Notices, VerifyBanner } from "./banners";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);

  const items: NavItem[] = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/jobs", label: niche.job.plural },
    { href: "/app/expenses", label: "Expenses" },
    { href: "/app/tax", label: "Tax & Deductions" },
    { href: "/app/health", label: "Health Snapshot" },
    { href: "/app/accountant", label: "Accountant Export" },
    { href: "/app/import", label: "Import CSV" },
    { href: "/app/settings", label: "Settings" },
    { href: "/app/account", label: "Account" },
    { href: "/app/elite/leaks", label: "Profit Leak Detector", elite: true },
    { href: "/app/elite/services", label: "Service Profitability", elite: true },
    { href: "/app/elite/forecast", label: "6-Month Forecast", elite: true },
    { href: "/app/elite/customers", label: "Customer Insights", elite: true },
    { href: "/app/elite/review", label: "Monthly Review", elite: true },
    { href: "/app/elite/scorecard", label: "KPIs & Benchmarks", elite: true },
    { href: "/app/elite/cashflow", label: "Cash Flow", elite: true },
    { href: "/app/elite/receivables", label: "Receivables", elite: true },
    { href: "/app/elite/technicians", label: `${niche.details.technicianPlural} & ${niche.details.comeback}s`, elite: true },
  ];

  return (
    <div className="lg:flex">
      <aside className="no-print border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 lg:px-5 lg:pt-6">
          <Logo href="/app" />
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            {elite ? <span className="text-accent">Elite</span> : <span className="text-muted">Essential</span>}
          </span>
        </div>
        <div className="px-4 pb-1 text-xs text-muted lg:px-5">{business.name || niche.name}</div>
        <div className="px-2 pb-2 lg:flex-1 lg:px-3 lg:pt-2">
          <Nav items={items} elite={elite} />
        </div>
        <div className="hidden border-t border-line p-4 lg:block">
          {!elite && (
            <Link href="/app/upgrade" className="btn btn-primary mb-3 w-full">
              Upgrade to Elite
            </Link>
          )}
          <div className="truncate text-xs text-muted" title={user.email}>
            {user.email}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-ink-2">
            <form action={logout}>
              <button className="hover:text-ink">Log out</button>
            </form>
            <a href={`mailto:${site.supportEmail}`} className="hover:text-ink">
              Help
            </a>
            {isAdmin(user) && (
              <Link href="/admin" className="text-accent hover:underline">
                Admin
              </Link>
            )}
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {!user.emailVerifiedAt && <VerifyBanner email={user.email} />}
          <Suspense>
            <Notices />
          </Suspense>
          {children}
        </div>
        <div className="no-print mx-auto mt-10 flex max-w-6xl items-center justify-between border-t border-line pt-4 text-xs text-muted lg:hidden">
          <span className="truncate">{user.email}</span>
          <span className="flex shrink-0 gap-3 font-semibold text-ink-2">
            {isAdmin(user) && <Link href="/admin">Admin</Link>}
            {!elite && <Link href="/app/upgrade">Upgrade</Link>}
            <form action={logout}>
              <button>Log out</button>
            </form>
          </span>
        </div>
      </main>
    </div>
  );
}
