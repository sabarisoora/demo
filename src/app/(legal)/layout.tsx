import Link from "next/link";
import { Logo } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link href="/signup" className="btn btn-primary">
          Start free
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <article className="legal rounded-xl border border-line bg-surface p-6 sm:p-10">{children}</article>
      </main>
      <SiteFooter />
    </>
  );
}
