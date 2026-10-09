import Link from "next/link";
import { getSession, getSessionUser } from "@/lib/auth";
import { findInvite } from "@/lib/team";
import { AcceptForm, JoinSignupForm } from "@/app/app/team/team-forms";

export const metadata = { title: "Join your team", robots: { index: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findInvite(token);
  if (!found) {
    return (
      <>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Invitation not valid</h1>
        <p className="mt-2 text-sm text-ink-2">It may have expired (invitations last 7 days) or been used already. Ask the shop owner to send a new one.</p>
      </>
    );
  }
  const { invite, business } = found;
  const me = await getSessionUser();
  const role = invite.role === "viewer" ? "read-only access" : "staff access";

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Join {business.name || "the shop"}</h1>
      <p className="mt-1 mb-6 text-sm text-ink-2">
        You've been invited with {role} as <strong>{invite.email}</strong>.
      </p>
      {me ? (
        me.email === invite.email ? (
          (await getSession()) ? (
            <p className="text-sm text-ink-2">
              Your login already belongs to a shop. Each login can be in one shop, so ask the owner to invite a different email.{" "}
              <Link href="/app" className="font-semibold text-brand hover:underline">
                Go to your dashboard
              </Link>
            </p>
          ) : (
            <AcceptForm token={token} />
          )
        ) : (
          <p className="text-sm text-ink-2">
            You're logged in as {me.email}. Log out and open this link again to join as {invite.email}.
          </p>
        )
      ) : (
        <>
          <JoinSignupForm token={token} email={invite.email} />
          <p className="mt-6 text-center text-sm text-ink-2">
            Already have a login with this email?{" "}
            <Link href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`} className="font-semibold text-brand hover:underline">
              Log in
            </Link>
          </p>
        </>
      )}
    </>
  );
}
