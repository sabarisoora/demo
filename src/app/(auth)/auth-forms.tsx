"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, requestPasswordReset, resetPassword, signup } from "./actions";

function Field(props: { label: string; name: string; type?: string; autoComplete?: string; placeholder?: string; minLength?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-2">{props.label}</span>
      <input
        className="field"
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        minLength={props.minLength}
        required
      />
    </label>
  );
}

function ErrorLine({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical-ink">
      {error}
    </p>
  );
}

export function SignupForm({ countries, niche }: { countries: string[]; niche: string }) {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="niche" value={niche} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" />
        <Field label="Business name" name="business" autoComplete="organization" />
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="8+ characters" minLength={8} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-2">Country (sets currency and tax defaults)</span>
        <select name="country" className="field" defaultValue="United States">
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 text-sm text-ink-2">
        <input type="checkbox" name="terms" required className="mt-0.5 h-4 w-4 accent-[var(--brand)]" />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-brand hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-brand hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <ErrorLine error={state?.error} />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Creating your account…" : "Create free account"}
      </button>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      <div className="-mt-2 text-right">
        <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
          Forgot password?
        </Link>
      </div>
      <ErrorLine error={state?.error} />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

function OkLine({ ok }: { ok?: string }) {
  if (!ok) return null;
  return (
    <p role="status" className="rounded-md border border-good/40 bg-good/10 px-3 py-2 text-sm text-good-ink">
      {ok}
    </p>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <ErrorLine error={state?.error} />
      <OkLine ok={state?.ok} />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" type="password" autoComplete="new-password" placeholder="8+ characters" minLength={8} />
      <Field label="Repeat new password" name="confirm" type="password" autoComplete="new-password" minLength={8} />
      <ErrorLine error={state?.error} />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
