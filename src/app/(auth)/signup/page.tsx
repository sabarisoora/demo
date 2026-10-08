import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { countries } from "@/lib/countries";
import { getNiche } from "@/niches";
import { SignupForm } from "../auth-forms";

export const metadata = { title: "Create your free account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ niche?: string }> }) {
  if (await getSession()) redirect("/app");
  const niche = getNiche((await searchParams).niche);
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Start free</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">
        {niche.name} edition · Essential is free forever. No card needed.
      </p>
      <SignupForm countries={countries.map((c) => c.name)} niche={niche.slug} />
      <p className="mt-6 text-center text-sm text-ink-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
