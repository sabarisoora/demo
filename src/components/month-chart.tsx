"use client";

import { useEffect, useRef, useState } from "react";

export type ChartPoint = { label: string; longLabel: string; a: number; b: number; extra?: string };

/**
 * Grouped bars for two measures sharing one money axis (e.g. revenue vs. expenses).
 * Hover/focus shows a tooltip; a table view is one click away.
 */
export function MonthChart({
  points,
  seriesA,
  seriesB,
  symbol,
}: {
  points: ChartPoint[];
  seriesA: string;
  seriesB: string;
  /** Currency symbol, e.g. "$" or "£". */
  symbol: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Hand-rolled so server (Node ICU) and browser render identical text; Intl's compact
  // currency output differs between them and breaks hydration.
  const sign = (n: number) => (n < 0 ? "-" : "");
  const fmt = (n: number) => {
    const a = Math.abs(n);
    const [div, unit] = a >= 1e9 ? [1e9, "B"] : a >= 1e6 ? [1e6, "M"] : a >= 1e3 ? [1e3, "K"] : [1, ""];
    const v = Math.round((a / div) * 10) / 10;
    return `${sign(n)}${symbol}${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;
  };
  const full = (n: number) =>
    `${sign(n)}${symbol}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const height = 260;
  const pad = { top: 12, right: 8, bottom: 28, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...points.flatMap((p) => [p.a, p.b]));
  // Round the axis to a tidy step.
  const mag = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => max / s <= 4) ?? mag * 10;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;
  const band = innerW / points.length;
  const barW = Math.max(3, Math.min(18, (band - 10) / 2));
  const gap = 2;
  const showEvery = width < 520 ? 2 : 1;

  const bar = (x: number, v: number, fill: string) => {
    const h = Math.max(0, y(0) - y(v));
    const r = Math.min(4, barW / 2, h);
    const yt = y(v);
    // Rounded top corners only; the bar sits flat on the baseline.
    const d = `M${x},${y(0)} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + barW - r} Q${x + barW},${yt} ${x + barW},${yt + r} V${y(0)} Z`;
    return h > 0 ? <path d={d} fill={fill} /> : null;
  };

  const tip = hover !== null ? points[hover] : null;
  const tipX = hover !== null ? pad.left + band * hover + band / 2 : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-ink-2" aria-hidden={table}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--series-1)" }} />
            {seriesA}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--series-2)" }} />
            {seriesB}
          </span>
        </div>
        <button type="button" onClick={() => setTable((t) => !t)} className="text-xs font-semibold text-ink-2 underline-offset-2 hover:underline">
          {table ? "Show chart" : "Show as table"}
        </button>
      </div>

      {table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted uppercase">
                <th className="py-2 font-semibold">Month</th>
                <th className="py-2 text-right font-semibold">{seriesA}</th>
                <th className="py-2 text-right font-semibold">{seriesB}</th>
                <th className="py-2 text-right font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody className="num">
              {points.map((p) => (
                <tr key={p.longLabel} className="border-b border-line last:border-0">
                  <td className="py-1.5 font-sans">{p.longLabel}</td>
                  <td className="py-1.5 text-right">{full(p.a)}</td>
                  <td className="py-1.5 text-right">{full(p.b)}</td>
                  <td className="py-1.5 text-right">{full(p.a - p.b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={wrap} className="relative" onMouseLeave={() => setHover(null)}>
          <svg width={width} height={height} role="img" aria-label={`${seriesA} and ${seriesB} by month`} className="block max-w-full">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeWidth={1} />
                <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--muted)" className="num">
                  {fmt(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) => {
              const cx = pad.left + band * i + band / 2;
              return (
                <g key={p.longLabel}>
                  {hover === i && <rect x={pad.left + band * i} y={pad.top} width={band} height={innerH} fill="var(--surface-2)" />}
                  {bar(cx - barW - gap / 2, p.a, "var(--series-1)")}
                  {bar(cx + gap / 2, p.b, "var(--series-2)")}
                  {i % showEvery === 0 && (
                    <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">
                      {p.label}
                    </text>
                  )}
                  {/* Hit target covers the whole band, bigger than the bars. */}
                  <rect
                    x={pad.left + band * i}
                    y={pad.top}
                    width={band}
                    height={innerH + pad.bottom}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${p.longLabel}: ${seriesA} ${full(p.a)}, ${seriesB} ${full(p.b)}`}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    style={{ outline: "none" }}
                  />
                </g>
              );
            })}
            <line x1={pad.left} x2={width - pad.right} y1={y(0)} y2={y(0)} stroke="var(--line-strong)" />
          </svg>
          {tip && (
            <div
              className="pointer-events-none absolute top-2 z-10 w-48 rounded-lg border border-line bg-surface p-3 text-xs shadow-lg"
              style={{ left: Math.min(Math.max(tipX - 96, 0), width - 192) }}
            >
              <div className="mb-1.5 font-semibold text-ink">{tip.longLabel}</div>
              <div className="flex justify-between gap-2 text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "var(--series-1)" }} />
                  {seriesA}
                </span>
                <span className="num text-ink">{full(tip.a)}</span>
              </div>
              <div className="mt-1 flex justify-between gap-2 text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "var(--series-2)" }} />
                  {seriesB}
                </span>
                <span className="num text-ink">{full(tip.b)}</span>
              </div>
              <div className="mt-1.5 flex justify-between gap-2 border-t border-line pt-1.5 text-ink-2">
                <span>Difference</span>
                <span className="num font-semibold text-ink">{full(tip.a - tip.b)}</span>
              </div>
              {tip.extra && <div className="mt-1 text-muted">{tip.extra}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
