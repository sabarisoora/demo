import Link from "next/link";
import { ForgotForm } from "../auth-forms";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Forgot your password?</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">Enter your account email and we'll send you a link to choose a new one.</p>
      <ForgotForm />
      <p className="mt-6 text-center text-sm text-ink-2">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
