import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "../auth-forms";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next;
  if (await getSession()) redirect(next?.startsWith("/invite/") ? next : "/app");
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">Log in to your ProfitIQS dashboard.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-center text-sm text-ink-2">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand underline-offset-2 hover:underline">
          Create a free account
        </Link>
      </p>
    </>
  );
}
