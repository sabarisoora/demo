"use client";

import { useActionState, useState } from "react";
import type { Country } from "@/lib/countries";
import { saveSettings } from "../actions";

type Init = {
  name: string;
  ownerName: string;
  country: string;
  vatRegistered: boolean;
  vatRateOverride: number | null;
  reserveRateOverride: number | null;
  fiscalYearStart: number;
  openingCash: number;
  reserveSetAside: number;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function L({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SettingsForm({ initial, countries }: { initial: Init; countries: Country[] }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  const [countryName, setCountryName] = useState(initial.country);
  const c = countries.find((x) => x.name === countryName) ?? countries[countries.length - 1];

  return (
    <form action={action} className="space-y-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-sm font-bold tracking-wide text-ink-2 uppercase">Business</legend>
        <L label="Business name">
          <input className="field" name="name" defaultValue={initial.name} />
        </L>
        <L label="Owner name">
          <input className="field" name="ownerName" defaultValue={initial.ownerName} />
        </L>
        <L label="Country" hint={c.currency ? `Currency: ${c.currency} (${c.symbol})` : "Enter rates manually below."}>
          <select className="field" name="country" value={countryName} onChange={(e) => setCountryName(e.target.value)}>
            {countries.map((x) => (
              <option key={x.name}>{x.name}</option>
            ))}
          </select>
        </L>
        <L label="Fiscal year starts in">
          <select className="field" name="fiscalYearStart" defaultValue={initial.fiscalYearStart}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </L>
        <L label="Opening cash balance" hint="Cash in the bank when you started tracking. Used for cash position.">
          <input className="field num" name="openingCash" type="number" step="0.01" defaultValue={initial.openingCash} />
        </L>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-sm font-bold tracking-wide text-ink-2 uppercase">Tax</legend>
        <L label="Tax reserve rate % (blank = default)" hint={`${c.name} default: ${c.reserve}% of net profit`}>
          <input className="field num" name="reserveRateOverride" type="number" step="0.1" min="0" max="100" defaultValue={initial.reserveRateOverride ?? ""} placeholder={String(c.reserve)} />
        </L>
        <L label="Tax reserve set aside so far">
          <input className="field num" name="reserveSetAside" type="number" step="0.01" min="0" defaultValue={initial.reserveSetAside} />
        </L>
        <label className="flex items-center gap-3 sm:col-span-2">
          <input type="checkbox" name="vatRegistered" defaultChecked={initial.vatRegistered} className="h-4 w-4 accent-[var(--brand)]" />
          <span className="text-sm font-semibold text-ink-2">I'm registered for {c.vatLabel}</span>
        </label>
        <L label={`${c.vatLabel} rate % (blank = default)`} hint={`${c.name} default: ${c.vat}%`}>
          <input className="field num" name="vatRateOverride" type="number" step="0.1" min="0" max="100" defaultValue={initial.vatRateOverride ?? ""} placeholder={String(c.vat)} />
        </L>
      </fieldset>

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state?.error && <span className="text-sm text-critical-ink">{state.error}</span>}
        {state?.ok && <span className="text-sm text-good-ink">✓ {state.ok}</span>}
      </div>
    </form>
  );
}
