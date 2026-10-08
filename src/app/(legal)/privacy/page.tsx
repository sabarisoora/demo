import { site } from "@/lib/site";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const mail = <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>;
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: October 2026</p>

      <p>
        This policy explains what personal data {site.company} (“we”) collects when you use {site.name}, why, and your choices. Contact: {mail}.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, and a securely hashed password (we never store or see your actual password).
        </li>
        <li>
          <strong>Business data you enter or import:</strong> business name, country and tax settings, jobs (dates, categories, customer names, amounts) and expenses (dates,
          categories, vendors, amounts).
        </li>
        <li>
          <strong>Billing status:</strong> if you buy Elite, Digistore24 sends us your order ID, product, email and payment status. We don't receive or store card details.
        </li>
        <li>
          <strong>Referral:</strong> if you arrived through a partner link, the partner's affiliate ID, so they can be credited.
        </li>
        <li>
          <strong>Technical data:</strong> IP address and browser information in server logs and for security (for example, limiting repeated login attempts).
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To provide the Service: calculations, reports and exports (performance of our contract with you).</li>
        <li>To secure accounts, prevent abuse and fix problems (our legitimate interest).</li>
        <li>To send essential emails: email confirmation, password resets and important account notices.</li>
        <li>To manage subscriptions and credit referring partners.</li>
      </ul>
      <p>We don't sell your data, and we don't use your business data for advertising.</p>

      <h2>Cookies</h2>
      <p>
        We use only strictly necessary cookies: a session cookie that keeps you logged in, and a referral cookie (60 days) that remembers which partner sent you. We don't use
        advertising or third-party tracking cookies.
      </p>

      <h2>Who processes data for us</h2>
      <ul>
        <li>Vercel (website hosting)</li>
        <li>Neon (database hosting)</li>
        <li>Resend (sending account emails)</li>
        <li>Digistore24 (payments, as reseller of the Elite plan, under its own privacy policy)</li>
      </ul>
      <p>These providers may process data outside your country, under appropriate safeguards such as standard contractual clauses.</p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account is open. When you delete your account, your account and business data are deleted immediately from our live database; backups are
        overwritten within 30 days. Billing records may be kept longer where the law requires.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access and download all your data (Account → Your data), correct it in the app, and delete your account and data (Account → Delete account). Depending on where you
        live (for example under the GDPR or UK GDPR) you may also have the right to object to or restrict processing, and to complain to your data protection authority. To use any
        right, or if you have questions, email {mail}.
      </p>

      <h2>Security</h2>
      <p>Passwords are hashed with bcrypt, connections are encrypted (HTTPS), sessions can be revoked, and access to each account's data is restricted to that account.</p>

      <h2>Children</h2>
      <p>The Service is for businesses and isn't directed at anyone under 18.</p>

      <h2>Changes</h2>
      <p>We'll post any changes here and, if they're significant, tell you by email or in the app.</p>
    </>
  );
}
