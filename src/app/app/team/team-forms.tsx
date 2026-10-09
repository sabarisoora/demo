"use client";

import { useActionState } from "react";
import { acceptInvite, inviteMember, signupAndAccept, type TeamState } from "./actions";

function Msg({ state }: { state: TeamState }) {
  return (
    <>
      {state?.error && (
        <p role="alert" className="text-sm text-critical-ink">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm text-good-ink">
          ✓ {state.ok}
        </p>
      )}
      {state?.link && <input readOnly value={state.link} className="field mt-1 text-xs" onFocus={(e) => e.currentTarget.select()} aria-label="Invitation link" />}
    </>
  );
}

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteMember, undefined);
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-2">Email</span>
        <input className="field" name="email" type="email" required placeholder="advisor@yourshop.com" />
      </label>
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1 font-semibold text-ink-2">Access</legend>
        <label className="flex items-start gap-2">
          <input type="radio" name="role" value="staff" defaultChecked className="mt-1 accent-[var(--brand)]" />
          <span>
            <strong>Staff</strong>
            <span className="block text-xs text-muted">Service advisors, technicians: create and edit repair orders, customers, inventory.</span>
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="radio" name="role" value="viewer" className="mt-1 accent-[var(--brand)]" />
          <span>
            <strong>Viewer</strong>
            <span className="block text-xs text-muted">Your accountant or partner: sees everything, changes nothing.</span>
          </span>
        </label>
      </fieldset>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Send invitation"}
      </button>
      <Msg state={state} />
    </form>
  );
}

export function AcceptForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInvite, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Joining…" : "Accept and join"}
      </button>
      <Msg state={state} />
    </form>
  );
}

export function JoinSignupForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(signupAndAccept, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-2">Email</span>
        <input className="field bg-surface-2" value={email} readOnly aria-readonly />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-2">Your name</span>
        <input className="field" name="name" required autoComplete="name" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-2">Choose a password</span>
        <input className="field" name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="8+ characters" />
      </label>
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Joining…" : "Create login and join"}
      </button>
      <Msg state={state} />
    </form>
  );
}
