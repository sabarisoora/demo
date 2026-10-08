import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-muted sm:px-6">
        <span>
          © {new Date().getFullYear()} {site.company} · ProfitIQS™ Business Intelligence Systems™
        </span>
        <nav className="flex flex-wrap gap-4" aria-label="Legal">
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/refunds" className="hover:text-ink">
            Refunds
          </Link>
          <a href={`mailto:${site.supportEmail}`} className="hover:text-ink">
            {site.supportEmail}
          </a>
        </nav>
        <span className="w-full">Tax figures are planning estimates, not tax advice.</span>
      </div>
    </footer>
  );
}
