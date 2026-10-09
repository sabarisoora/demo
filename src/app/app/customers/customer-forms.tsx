"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveCustomer, saveVehicle, type ShopState } from "../shop-actions";

function Msg({ state }: { state: ShopState }) {
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

function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

type CustomerInit = { id: string; name: string; phone: string; email: string; notes: string };

export function CustomerForm({ initial, compact }: { initial?: CustomerInit; compact?: boolean }) {
  const [state, action, pending] = useActionState(saveCustomer, undefined);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <L label="Name" className={compact ? "" : "sm:col-span-2"}>
        <input className="field" name="name" defaultValue={initial?.name} required autoComplete="off" />
      </L>
      <L label="Phone">
        <input className="field" name="phone" type="tel" defaultValue={initial?.phone} autoComplete="off" />
      </L>
      <L label="Email" className={compact ? "" : ""}>
        <input className="field" name="email" type="email" defaultValue={initial?.email} autoComplete="off" />
      </L>
      {!compact && (
        <L label="Notes" className="sm:col-span-2">
          <textarea className="field min-h-20" name="notes" defaultValue={initial?.notes} placeholder="Preferences, fleet account, how they found you…" />
        </L>
      )}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save customer" : "Add customer"}
        </button>
        <Msg state={state} />
      </div>
    </form>
  );
}

type VehicleInit = { id: string; year: number | null; make: string; model: string; vin: string; plate: string; mileage: number | null; nextServiceAt: string | null };

export function VehicleForm({ customerId, initial, onDone }: { customerId: string; initial?: VehicleInit; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveVehicle, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      if (!initial) form.current?.reset();
      onDone?.();
    }
  }, [state, initial, onDone]);
  return (
    <form ref={form} action={action} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      <input type="hidden" name="customerId" value={customerId} />
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <L label="Year">
        <input className="field num" name="year" type="number" min={1900} max={2100} defaultValue={initial?.year ?? ""} />
      </L>
      <L label="Make">
        <input className="field" name="make" defaultValue={initial?.make} placeholder="Toyota" />
      </L>
      <L label="Model">
        <input className="field" name="model" defaultValue={initial?.model} placeholder="Camry" />
      </L>
      <L label="Plate">
        <input className="field uppercase" name="plate" defaultValue={initial?.plate} />
      </L>
      <L label="Mileage">
        <input className="field num" name="mileage" type="number" min={0} defaultValue={initial?.mileage ?? ""} />
      </L>
      <L label="VIN" className="col-span-2 sm:col-span-1">
        <input className="field uppercase" name="vin" defaultValue={initial?.vin} maxLength={32} />
      </L>
      <L label="Next service due (optional)" className="col-span-2">
        <input className="field" name="nextServiceAt" type="date" defaultValue={initial?.nextServiceAt ?? ""} />
      </L>
      <div className="col-span-2 flex flex-wrap items-center gap-3 self-end sm:col-span-4">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save vehicle" : "Add vehicle"}
        </button>
        {onDone && initial && (
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            Cancel
          </button>
        )}
        <Msg state={state} />
      </div>
    </form>
  );
}

export function EditVehicleToggle({ customerId, vehicle, children }: { customerId: string; vehicle: VehicleInit; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <VehicleForm customerId={customerId} initial={vehicle} onDone={() => setEditing(false)} />;
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      {children}
      <button type="button" className="text-xs font-semibold text-brand hover:underline" onClick={() => setEditing(true)}>
        Edit
      </button>
    </div>
  );
}
