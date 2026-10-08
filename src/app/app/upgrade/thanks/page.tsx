import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Thank you" };
export const dynamic = "force-dynamic";

// Set this as the "Thank you page" URL for the Elite product in Digistore24.
export default async function ThanksPage() {
  const { user } = await requireSession();
  if (isElite(user)) {
    return (
      <>
        <PageHeader title="Welcome to Elite" subtitle="Payment confirmed. Every Elite report is now unlocked." />
        <Link href="/app/elite/leaks" className="btn btn-primary">
          Find your profit leaks →
        </Link>
      </>
    );
  }
  return (
    <>
      <PageHeader title="Thanks! Confirming your payment…" subtitle="Digistore24 usually confirms within a minute. This page checks again when you refresh." />
      <div className="flex gap-3">
        <Link href="/app/upgrade/thanks" className="btn btn-primary">
          Check again
        </Link>
        <Link href="/app" className="btn btn-ghost">
          Back to dashboard
        </Link>
      </div>
      <p className="mt-6 max-w-xl text-sm text-ink-2">
        Still not unlocked after 10 minutes? Make sure you paid with <strong>{user.email}</strong>, or reply to your Digistore24 receipt email and we'll sort it out.
      </p>
    </>
  );
}
