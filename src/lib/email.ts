import "server-only";
import { headers } from "next/headers";
import { site } from "./site";

/** Base URL of the current request, so links in emails work on any domain (preview or production). */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return site.url;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// EMAIL_TRANSPORT=log writes emails to the server log and treats them as sent (testing/staging).
const logOnly = () => process.env.EMAIL_TRANSPORT === "log";
export const emailConfigured = () => !!process.env.RESEND_API_KEY || logOnly();

/**
 * Sends a transactional email through Resend (https://resend.com, free tier: 3,000/month).
 * Without RESEND_API_KEY the email is printed to the server log instead, so local dev works.
 */
export async function sendEmail(msg: { to: string; subject: string; text: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || logOnly()) {
    console.log(`[email not configured] To: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}`);
    return logOnly();
  }
  const from = process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Resend request failed", e);
    return false;
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** A plain, client-safe email layout with one call-to-action button. */
export function actionEmail(o: { greeting: string; body: string; action: string; url: string; footer: string }) {
  const text = `${o.greeting}\n\n${o.body}\n\n${o.action}: ${o.url}\n\n${o.footer}\n\n— ${site.name}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1e9;font-family:Arial,Helvetica,sans-serif;color:#1a1915">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf8;border:1px solid #e3ddcf;border-radius:12px">
<tr><td style="padding:28px">
<div style="font-size:18px;font-weight:bold;margin-bottom:20px">Profit<span style="color:#1d4d3a">IQS</span></div>
<p style="margin:0 0 12px">${esc(o.greeting)}</p>
<p style="margin:0 0 24px;line-height:1.5;color:#4f4d45">${esc(o.body)}</p>
<a href="${esc(o.url)}" style="display:inline-block;background:#1d4d3a;color:#f4f1e9;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:6px">${esc(o.action)}</a>
<p style="margin:24px 0 0;font-size:12px;color:#77746a;line-height:1.5">${esc(o.footer)}<br>Button not working? Paste this link into your browser:<br><span style="word-break:break-all">${esc(o.url)}</span></p>
</td></tr></table>
<p style="font-size:11px;color:#77746a">${esc(site.company)} · ${esc(site.supportEmail)}</p>
</td></tr></table></body></html>`;
  return { text, html };
}
