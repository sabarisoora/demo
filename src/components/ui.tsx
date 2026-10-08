import Link from "next/link";
import type { Status } from "@/lib/metrics";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-2">{subtitle}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className = "", title, action }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }) {
  return (
    <section className={`min-w-0 rounded-xl border border-line bg-surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-sm font-bold tracking-wide text-ink-2 uppercase">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</div>
      <div
        className={`num mt-2 text-lg font-semibold break-words sm:text-2xl ${tone === "bad" ? "text-critical-ink" : tone === "good" ? "text-good-ink" : "text-ink"}`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

const statusStyle: Record<Status, { color: string; icon: string }> = {
  Excellent: { color: "var(--good)", icon: "▲" },
  Good: { color: "var(--good)", icon: "●" },
  "Needs Attention": { color: "var(--warning)", icon: "◆" },
  Critical: { color: "var(--critical)", icon: "▼" },
};

/** Status is never color-alone: icon + label + color. */
export function StatusBadge({ status, size = "sm" }: { status: Status; size?: "sm" | "lg" }) {
  const s = statusStyle[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 font-semibold whitespace-nowrap ${size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}
    >
      <span aria-hidden="true" style={{ color: s.color }}>
        {s.icon}
      </span>
      {status}
    </span>
  );
}

export function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 py-2">
      <span
        aria-label={ok ? "OK" : "Warning"}
        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: ok ? "var(--good)" : "var(--critical)" }}
      >
        {ok ? "✓" : "!"}
      </span>
      <span className="text-sm text-ink-2">{children}</span>
    </li>
  );
}

export function PeriodTabs({ current, base }: { current: string; base: string }) {
  const tabs = [
    ["all", "All time"],
    ["fy", "This fiscal year"],
    ["12m", "Last 12 months"],
  ];
  return (
    <nav aria-label="Period" className="inline-flex rounded-lg border border-line-strong bg-surface p-0.5 text-sm">
      {tabs.map(([k, label]) => (
        <Link
          key={k}
          href={k === "all" ? base : `${base}?period=${k}`}
          className={`rounded-md px-3 py-1.5 font-medium ${current === k ? "bg-brand text-brand-ink" : "text-ink-2 hover:text-ink"}`}
          aria-current={current === k ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface-2 p-8 text-center">
      <p className="font-display font-bold">{title}</p>
      {children && <div className="mt-2 text-sm text-ink-2">{children}</div>}
    </div>
  );
}

export const TAX_DISCLAIMER =
  "Rates are general planning estimates as of 2026, not tax advice. Confirm actual rates and obligations with a licensed accountant or your local tax authority.";
