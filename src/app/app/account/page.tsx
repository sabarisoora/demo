import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { dateLabel } from "@/lib/format";
import { site } from "@/lib/site";
import { getNiche } from "@/niches";
import { Card, PageHeader } from "@/components/ui";
import { DeleteForm, NameForm, PasswordForm } from "./account-forms";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const { user, business } = await requireSession();
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  return (
    <>
      <PageHeader title="Account" subtitle="Your login, plan and data." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Profile">
            <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="font-medium">
                  {user.email}{" "}
                  {user.emailVerifiedAt ? <span className="text-xs text-good-ink">✓ confirmed</span> : <span className="text-xs text-muted">(not confirmed)</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Member since</dt>
                <dd className="font-medium">{dateLabel(user.createdAt.toISOString().slice(0, 10))}</dd>
              </div>
            </dl>
            <NameForm name={user.name} />
            <p className="mt-3 text-xs text-muted">
              Need to change your email? Write to <a href={`mailto:${site.supportEmail}`} className="underline">{site.supportEmail}</a>.
            </p>
          </Card>
          <Card title="Password">
            <PasswordForm />
          </Card>
          <Card title="Delete account" className="border-critical/40">
            <p className="mb-4 text-sm text-ink-2">
              Permanently deletes your account, business settings and every {niche.job.singular.toLowerCase()} and expense. This can't be undone. Download your data first.
              {elite && " Deleting your account doesn't cancel your Digistore24 subscription; cancel it from your receipt email first."}
            </p>
            <DeleteForm />
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Plan">
            <p className="text-sm">
              {elite ? (
                <>
                  <strong className="text-accent">Elite</strong>
                  {user.eliteUntil ? ` · ends ${dateLabel(user.eliteUntil.toISOString().slice(0, 10))}` : " · active"}
                </>
              ) : (
                <strong>Essential (free)</strong>
              )}
            </p>
            {elite ? (
              <p className="mt-2 text-xs text-muted">
                Billing is handled by Digistore24. To update your card or cancel, use the link in your Digistore24 receipt email, or visit digistore24.com and look up your order.
              </p>
            ) : (
              <Link href="/app/upgrade" className="btn btn-primary mt-3">
                Upgrade to Elite
              </Link>
            )}
          </Card>
          <Card title="Your data">
            <p className="mb-3 text-sm text-ink-2">Download everything you've entered, any time.</p>
            <div className="flex flex-col gap-2">
              <a href="/api/export/all" className="btn btn-ghost">
                Everything (JSON)
              </a>
              <a href="/api/export/jobs" className="btn btn-ghost">
                {niche.job.plural} (CSV)
              </a>
              <a href="/api/export/expenses" className="btn btn-ghost">
                Expenses (CSV)
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
