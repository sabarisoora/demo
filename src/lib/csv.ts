// Minimal RFC 4180 CSV reader/writer plus column auto-mapping for imports.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number) => {
    let s = String(v);
    // Neutralize spreadsheet formula injection when the file is opened in Excel.
    if (/^[=+\-@\t\r]/.test(s) && typeof v === "string") s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

export type DateFormat = "ymd" | "mdy" | "dmy";

/** Parses a date in the given order (or ISO) to YYYY-MM-DD; null if invalid. */
export function parseDate(raw: string, fmt: DateFormat): string | null {
  const s = raw.trim();
  let y: number, m: number, d: number;
  const iso = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else {
    const p = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (!p) return null;
    const [a, b] = [Number(p[1]), Number(p[2])];
    y = Number(p[3]) < 100 ? 2000 + Number(p[3]) : Number(p[3]);
    if (fmt === "dmy") [d, m] = [a, b];
    else [m, d] = [a, b];
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

/** "$1,234.50" -> 1234.5, "(12.00)" -> -12, "" -> 0. NaN for junk. */
export function parseMoney(raw: string | undefined): number {
  const s = (raw ?? "").trim();
  if (!s) return 0;
  const neg = /^\(.*\)$/.test(s) || s.startsWith("-");
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return neg ? -n : n;
}

const norm = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

/** For each target field, the index of the first header that matches one of its aliases. */
export function mapColumns<K extends string>(headers: string[], aliases: Record<K, string[]>): Record<K, number> {
  const hs = headers.map(norm);
  const out = {} as Record<K, number>;
  for (const key of Object.keys(aliases) as K[]) {
    const names = aliases[key].map(norm);
    out[key] = hs.findIndex((h) => names.includes(h));
  }
  return out;
}
