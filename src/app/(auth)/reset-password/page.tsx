import Link from "next/link";
import { peekToken } from "@/lib/tokens";
import { ResetForm } from "../auth-forms";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const valid = await peekToken(token, "reset");
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Choose a new password</h1>
      {valid ? (
        <>
          <p className="mt-1 mb-6 text-sm text-ink-2">You'll be signed out of other devices.</p>
          <ResetForm token={token} />
        </>
      ) : (
        <>
          <p className="mt-2 mb-6 text-sm text-ink-2">This link has expired or was already used. Reset links work for 1 hour, once.</p>
          <Link href="/forgot-password" className="btn btn-primary w-full">
            Send a new link
          </Link>
        </>
      )}
    </>
  );
}
