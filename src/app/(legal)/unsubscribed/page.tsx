import Link from "next/link";

export const metadata = { title: "Unsubscribed", robots: { index: false } };

export default async function UnsubscribedPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  const invalid = (await searchParams).invalid;
  return invalid ? (
    <>
      <h1>That link didn't work</h1>
      <p>
        It may be old. You can turn weekly summaries off any time in <Link href="/app/account">Account</Link>.
      </p>
    </>
  ) : (
    <>
      <h1>You're unsubscribed</h1>
      <p>We won't send you weekly summaries any more. Account emails like password resets still arrive.</p>
      <p>
        Changed your mind? Turn them back on in <Link href="/app/account">Account</Link>.
      </p>
    </>
  );
}
