import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect width="26" height="26" rx="6" fill="var(--brand)" />
        <path d="M6 18 L11 12 L15 15 L20 8" stroke="var(--brand-ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="8" r="2" fill="var(--accent)" />
      </svg>
      <span>
        Profit<span className="text-brand">IQS</span>
      </span>
    </Link>
  );
}
