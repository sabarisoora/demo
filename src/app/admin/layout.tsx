import Link from "next/link";
import { Logo } from "@/components/brand";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-bold tracking-wider text-accent uppercase">Admin</span>
          </div>
          <Link href="/app" className="text-sm font-semibold text-ink-2 hover:text-ink">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
