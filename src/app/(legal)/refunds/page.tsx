import { site } from "@/lib/site";

export const metadata = { title: "Refund & Cancellation Policy" };

const days = process.env.NEXT_PUBLIC_REFUND_DAYS || "30";

export default function RefundsPage() {
  const mail = <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>;
  return (
    <>
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="updated">Last updated: October 2026</p>

      <h2>Try it free first</h2>
      <p>The Essential plan is free with no time limit, so you can check that {site.name} works for your business before paying for anything.</p>

      <h2>Money-back guarantee</h2>
      <p>
        If Elite isn't right for you, ask for a refund within <strong>{days} days</strong> of your first Elite payment and you'll get it in full, no questions asked. Renewal
        payments can be refunded within {days} days if you haven't used Elite features since that renewal.
      </p>

      <h2>How to get a refund</h2>
      <p>
        Elite is sold through Digistore24, which processes all payments and refunds. Use the link in your Digistore24 order confirmation email, or contact Digistore24 support
        with your order ID. You can also email us at {mail} and we'll arrange it. Refunds go back to your original payment method; how long it takes to appear depends on your bank
        or card provider.
      </p>

      <h2>Cancelling</h2>
      <p>
        You can cancel any time from your Digistore24 receipt email or Digistore24's order lookup. After cancelling, Elite stays active until the end of the period you've paid
        for, then your account returns to the free plan. Your data stays, nothing is deleted.
      </p>
      <p>If you get a refund, Elite access ends when the refund is processed.</p>

      <h2>Questions</h2>
      <p>Email {mail}. We usually reply within one business day.</p>
    </>
  );
}
