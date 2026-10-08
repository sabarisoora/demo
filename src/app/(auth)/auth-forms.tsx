"use client";

import { useActionState } from "react";
import { login, signup } from "./actions";

function Field(props: { label: string; name: string; type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-2">{props.label}</span>
      <input
        className="field"
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
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
      <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="8+ characters" />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-2">Country (sets currency and tax defaults)</span>
        <select name="country" className="field" defaultValue="United States">
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
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
      <ErrorLine error={state?.error} />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
