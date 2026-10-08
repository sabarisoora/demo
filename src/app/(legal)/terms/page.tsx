import { site } from "@/lib/site";

export const metadata = { title: "Terms of Service" };

const law = process.env.NEXT_PUBLIC_GOVERNING_LAW || "India";

export default function TermsPage() {
  const mail = <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>;
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="updated">Last updated: October 2026</p>

      <p>
        These terms cover your use of {site.name} (the “Service”), operated by {site.company} (“we”, “us”). By creating an account you agree to them. If you don't agree, please
        don't use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        {site.name} is an online tool for small businesses to record jobs and expenses and see profit, tax-reserve estimates, health scores and related reports. The free
        Essential plan and the paid Elite plan include the features described on our website at the time you use them. We may improve, change or remove features over time.
      </p>

      <h2>2. Not financial or tax advice</h2>
      <p>
        Tax rates, reserves, VAT/GST figures, forecasts and other outputs are general planning estimates based on the data you enter. They are not tax, legal, accounting or
        financial advice and may not fit your situation. Always confirm with a qualified accountant or your local tax authority before filing or making decisions.
      </p>

      <h2>3. Your account</h2>
      <ul>
        <li>You must give accurate information and keep your password secure. You're responsible for activity under your account.</li>
        <li>You must be at least 18 and able to enter a contract for your business.</li>
        <li>Tell us right away at {mail} if you think your account has been used without permission.</li>
      </ul>

      <h2>4. Your data</h2>
      <p>
        You own the business data you enter. You give us permission to store and process it only to run the Service for you. You can export it or delete your account at any
        time from the Account page. See our <a href="/privacy">Privacy Policy</a> for details.
      </p>

      <h2>5. Paid plans and billing</h2>
      <p>
        Elite subscriptions are sold through Digistore24 GmbH, which acts as the reseller and merchant of record. Digistore24's own terms apply to the purchase, payment, taxes on
        the sale, and cancellation. Subscriptions renew automatically each billing period until cancelled. If you cancel, Elite stays active until the end of the period you've paid
        for. Refunds are covered by our <a href="/refunds">Refund Policy</a>. We may change prices for future billing periods with reasonable notice.
      </p>

      <h2>6. Acceptable use</h2>
      <p>Don't misuse the Service. In particular, don't:</p>
      <ul>
        <li>break the law, or upload data you have no right to use;</li>
        <li>try to access other users' accounts or data, or probe, scan or disrupt the Service;</li>
        <li>resell or share access to the Service, or copy it to build a competing product;</li>
        <li>use automated means to create accounts or send large volumes of requests.</li>
      </ul>
      <p>We may suspend or close accounts that break these rules.</p>

      <h2>7. Availability</h2>
      <p>
        We work to keep the Service running and your data safe, but it's provided “as is” and “as available”. We don't guarantee it will be uninterrupted or error-free. Please keep
        your own copies of important records (exports are available any time).
      </p>

      <h2>8. Liability</h2>
      <p>
        To the extent the law allows, we're not liable for indirect or consequential losses (such as lost profits, lost data or tax penalties), and our total liability for any claim
        is limited to the amount you paid us for the Service in the 12 months before the claim. Nothing in these terms limits liability that can't be limited by law.
      </p>

      <h2>9. Ending your use</h2>
      <p>
        You can stop using the Service and delete your account at any time. We may end or suspend the Service for you if you break these terms, with notice where reasonable. If we
        shut the Service down entirely, we'll give you notice and time to export your data.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>We may update these terms. If a change is significant, we'll tell you by email or in the app before it takes effect. Continuing to use the Service means you accept the update.</p>

      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of {law}, without affecting any rights you have under the consumer laws of the country where you live.</p>

      <h2>12. Contact</h2>
      <p>Questions about these terms: {mail}.</p>
    </>
  );
}
