import Link from "next/link";

/**
 * Free users see the feature rendered from sample data, blurred, under an upgrade panel.
 * Callers pass `preview` built from SAMPLE data, never the user's own, so nothing paid leaks.
 */
export function EliteGate({
  elite,
  teaser,
  preview,
  children,
}: {
  elite: boolean;
  teaser: React.ReactNode;
  preview: React.ReactNode;
  children: React.ReactNode;
}) {
  if (elite) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden="true" inert className="pointer-events-none max-h-[560px] overflow-hidden blur-[6px] select-none">
        {preview}
      </div>
      <div className="absolute inset-0 flex items-start justify-center bg-gradient-to-b from-transparent via-bg/70 to-bg px-4 pt-16">
        <div className="rise w-full max-w-lg rounded-xl border border-line-strong bg-surface p-6 text-center shadow-xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-accent uppercase">
            Elite feature
          </div>
          <div className="text-ink-2">{teaser}</div>
          <Link href="/app/upgrade" className="btn btn-primary mt-5">
            Unlock with Elite
          </Link>
          <p className="mt-2 text-xs text-muted">Preview shows sample data.</p>
        </div>
      </div>
    </div>
  );
}
