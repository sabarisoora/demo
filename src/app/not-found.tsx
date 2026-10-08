import Link from "next/link";
import { Logo } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="ledger flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <p className="num mt-10 text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-3 font-display text-2xl font-extrabold">This page doesn't exist</h1>
      <p className="mt-2 text-ink-2">The link may be old or mistyped.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn btn-ghost">
          Home
        </Link>
        <Link href="/app" className="btn btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
