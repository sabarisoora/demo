// The weekly summary email: last 7 days vs the 7 before, month to date, and one thing to act on.
import type { Niche } from "@/niches/types";
import { customerInsights, receivables, type DetailJob } from "./elite-metrics";
import { jobProfit, jobRevenue, monthKey, type ExpenseRow, type Settings, rates } from "./metrics";
import { site } from "./site";

const DAY = 24 * 60 * 60 * 1000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0);

export function weekWindow(today: Date) {
  const end = iso(new Date(today.getTime() - DAY)); // yesterday, inclusive
  const start = iso(new Date(today.getTime() - 7 * DAY));
  const prevStart = iso(new Date(today.getTime() - 14 * DAY));
  return { start, end, prevStart };
}

function windowStats(jobs: DetailJob[], expenses: ExpenseRow[], from: string, to: string) {
  const j = jobs.filter((x) => x.date >= from && x.date <= to);
  const e = expenses.filter((x) => x.date >= from && x.date <= to);
  const revenue = sum(j, jobRevenue);
  return { revenue, profit: sum(j, jobProfit) - sum(e, (x) => x.amount), jobs: j.length };
}

export type DigestInput = {
  name: string;
  businessName: string;
  niche: Niche;
  settings: Settings;
  elite: boolean;
  jobs: (DetailJob & { customer: string })[];
  expenses: ExpenseRow[];
  today: Date;
  money: (n: number) => string;
  appUrl: string;
  unsubscribeUrl: string;
};

export function buildDigest(d: DigestInput) {
  const { start, end, prevStart } = weekWindow(d.today);
  const week = windowStats(d.jobs, d.expenses, start, end);
  const prev = windowStats(d.jobs, d.expenses, prevStart, iso(new Date(new Date(start).getTime() - DAY)));
  const month = monthKey(d.today);
  const mtd = windowStats(d.jobs, d.expenses, `${month}-01`, iso(d.today));
  const reserveRate = rates(d.settings).reserveRate;
  const ar = receivables(d.jobs, d.today);
  const lapsed = customerInsights(d.jobs, d.niche, d.today).atRisk;

  const pct = (now: number, before: number) => (before ? `${now >= before ? "▲" : "▼"} ${Math.abs(Math.round(((now - before) / Math.abs(before)) * 100))}% vs the week before` : "");
  const jobsWord = d.niche.job.plural.toLowerCase();

  // One clear next step, in priority order.
  const nudge =
    week.jobs === 0
      ? { text: `No ${jobsWord} logged this week. Add them so your numbers stay current.`, cta: `Add ${jobsWord}`, path: "/app/jobs" }
      : ar.over90 > 0 && d.elite
        ? { text: `${d.money(ar.over90)} has been unpaid for more than 90 days. Those are worth a call this week.`, cta: "See receivables", path: "/app/elite/receivables" }
        : lapsed.length > 0 && d.elite
          ? { text: `${lapsed.length} regular${lapsed.length === 1 ? " hasn't" : "s haven't"} been back in 6 months. A reminder could bring them in.`, cta: "See win-back list", path: "/app/elite/customers" }
          : !d.elite
            ? { text: "Elite shows where profit is leaking, with a dollar figure for each leak, plus cash flow, receivables and more.", cta: "See what Elite finds", path: "/app/elite/leaks" }
            : { text: "Check this month's numbers against your goals.", cta: "Open scorecard", path: "/app/elite/scorecard" };

  const first = d.name.split(" ")[0] || "there";
  const subject = week.jobs ? `${d.businessName || site.name}: ${d.money(week.revenue)} revenue this week` : `${d.businessName || site.name}: your weekly summary`;
  const rows: [string, string, string][] = [
    ["Revenue", d.money(week.revenue), pct(week.revenue, prev.revenue)],
    ["Profit (after expenses logged)", d.money(week.profit), pct(week.profit, prev.profit)],
    [d.niche.job.plural, String(week.jobs), pct(week.jobs, prev.jobs)],
    ["Month to date revenue", d.money(mtd.revenue), ""],
    ["Set aside for tax this month", d.money(Math.max(mtd.profit, 0) * reserveRate), `${Math.round(reserveRate * 100)}% of profit`],
  ];
  if (ar.total > 0) rows.push(["Owed to you", d.money(ar.total), `${ar.open.length} unpaid`]);

  const url = `${d.appUrl}${nudge.path}`;
  const text = [
    `Hi ${first},`,
    "",
    `Here's ${d.businessName || "your business"} for ${start} to ${end}:`,
    "",
    ...rows.map(([l, v, n]) => `${l}: ${v}${n ? ` (${n})` : ""}`),
    "",
    nudge.text,
    `${nudge.cta}: ${url}`,
    "",
    `Don't want these? Unsubscribe: ${d.unsubscribeUrl}`,
    `— ${site.name}`,
  ].join("\n");

  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1e9;font-family:Arial,Helvetica,sans-serif;color:#1a1915">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #e3ddcf;border-radius:12px"><tr><td style="padding:28px">
<div style="font-size:18px;font-weight:bold;margin-bottom:4px">Profit<span style="color:#1d4d3a">IQS</span></div>
<div style="font-size:12px;color:#77746a;margin-bottom:20px">Weekly summary · ${esc(start)} to ${esc(end)}</div>
<p style="margin:0 0 16px">Hi ${esc(first)}, here's how ${esc(d.businessName || "your business")} did this week.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
${rows
  .map(
    ([l, v, n]) =>
      `<tr><td style="padding:10px 0;border-top:1px solid #e3ddcf;color:#4f4d45">${esc(l)}</td><td align="right" style="padding:10px 0;border-top:1px solid #e3ddcf;font-weight:bold;font-family:Menlo,Consolas,monospace">${esc(v)}</td></tr>${n ? `<tr><td></td><td align="right" style="padding:0 0 8px;font-size:12px;color:#77746a">${esc(n)}</td></tr>` : ""}`,
  )
  .join("")}
</table>
<div style="margin:24px 0 0;padding:16px;background:#e3ece4;border-radius:8px">
<p style="margin:0 0 12px;line-height:1.5">${esc(nudge.text)}</p>
<a href="${esc(url)}" style="display:inline-block;background:#1d4d3a;color:#f4f1e9;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:6px">${esc(nudge.cta)}</a>
</div>
<p style="margin:24px 0 0;font-size:11px;color:#77746a">Profit here uses the ${esc(jobsWord)} and expenses you logged for these days; tax figures are planning estimates, not tax advice.<br>
<a href="${esc(d.unsubscribeUrl)}" style="color:#77746a">Unsubscribe from weekly summaries</a></p>
</td></tr></table>
<p style="font-size:11px;color:#77746a">${esc(site.company)} · ${esc(site.supportEmail)}</p>
</td></tr></table></body></html>`;

  return { subject, text, html, week, nudge };
}
