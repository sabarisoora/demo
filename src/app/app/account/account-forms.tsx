"use client";

import { useActionState } from "react";
import { changePassword, deleteAccount, updateName, type AccountState } from "./actions";

function Msg({ state }: { state: AccountState }) {
  if (state?.error)
    return (
      <p role="alert" className="text-sm text-critical-ink">
        {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p role="status" className="text-sm text-good-ink">
        ✓ {state.ok}
      </p>
    );
  return null;
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <L label="Your name">
          <input className="field" name="name" defaultValue={name} required />
        </L>
      </div>
      <button className="btn btn-ghost" disabled={pending}>
        Save
      </button>
      <Msg state={state} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="space-y-3">
      <L label="Current password">
        <input className="field" name="current" type="password" autoComplete="current-password" required />
      </L>
      <div className="grid gap-3 sm:grid-cols-2">
        <L label="New password">
          <input className="field" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </L>
        <L label="Repeat new password">
          <input className="field" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </L>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </button>
        <Msg state={state} />
      </div>
    </form>
  );
}

export function DeleteForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <L label="Your password">
          <input className="field" name="current" type="password" autoComplete="current-password" required />
        </L>
        <L label="Type DELETE to confirm">
          <input className="field" name="confirm" autoComplete="off" required pattern="DELETE" />
        </L>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-danger" disabled={pending}>
          {pending ? "Deleting…" : "Delete my account and data"}
        </button>
        <Msg state={state} />
      </div>
    </form>
  );
}
