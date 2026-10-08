"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; elite?: boolean };

export function Nav({ items, elite }: { items: NavItem[]; elite: boolean }) {
  const path = usePathname();
  const active = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));
  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
      {items.map((it, i) => {
        const showDivider = it.elite && !items[i - 1]?.elite;
        return (
          <div key={it.href} className="contents">
            {showDivider && (
              <div className="hidden px-3 pt-3 pb-1 text-[11px] font-bold tracking-widest text-muted uppercase lg:block">
                Elite
              </div>
            )}
            <Link
              href={it.href}
              aria-current={active(it.href) ? "page" : undefined}
              className={`flex shrink-0 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap lg:py-1 ${
                active(it.href) ? "bg-brand-soft text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-2">
                {active(it.href) && <span aria-hidden="true" className="h-4 w-1 rounded-full bg-brand" />}
                {it.label}
              </span>
              {it.elite && !elite && (
                <svg aria-label="Elite feature" width="12" height="12" viewBox="0 0 12 12" className="text-muted">
                  <rect x="2" y="5" width="8" height="6" rx="1.5" fill="currentColor" />
                  <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                </svg>
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
