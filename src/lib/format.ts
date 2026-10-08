import { getCountry } from "./countries";

export function moneyFormatter(countryName: string, compact = false) {
  const c = getCountry(countryName);
  if (c.currency) {
    const f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c.currency,
      maximumFractionDigits: compact ? 0 : 2,
      minimumFractionDigits: compact ? 0 : 2,
      notation: compact ? "compact" : "standard",
    });
    return (n: number) => f.format(n);
  }
  const f = new Intl.NumberFormat("en-US", { maximumFractionDigits: compact ? 0 : 2, minimumFractionDigits: compact ? 0 : 2 });
  return (n: number) => f.format(n);
}

export const percent = (n: number, digits = 1) =>
  `${(n * 100).toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;

export const count = (n: number) => n.toLocaleString("en-US");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-07" -> "Jul 26" (or "Jul 2026" when long). */
export function monthLabel(key: string, long = false) {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1]} ${long ? y : y.slice(2)}`;
}

export function dateLabel(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}
