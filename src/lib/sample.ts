import type { Settings } from "./metrics";
import type { Niche } from "@/niches/types";

/** A niche's sample data with a "today" inside its 12-month span, for Elite previews and the landing mockup. */
export function sampleContext(niche: Niche) {
  const { orders, expenses } = niche.sample;
  const last = orders.map((o) => o.date).sort().at(-1)!;
  const today = new Date(Number(last.slice(0, 4)), Number(last.slice(5, 7)) - 1, 15);
  const settings: Settings = {
    country: "United States",
    vatRegistered: false,
    vatRateOverride: null,
    reserveRateOverride: null,
    openingCash: 0,
    reserveSetAside: 0,
    fiscalYearStart: 1,
  };
  return { orders, expenses: expenses.filter((e) => e.date <= `${last.slice(0, 7)}-31`), today, settings, month: last.slice(0, 7) };
}
