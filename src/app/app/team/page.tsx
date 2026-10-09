import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { dateLabel } from "@/lib/format";
import { teamOf } from "@/lib/team";
import { EliteGate } from "@/components/elite-gate";
import { Card, Empty, PageHeader } from "@/components/ui";
import { changeRole, removeMember, revokeInvite } from "./actions";
import { InviteForm } from "./team-forms";

export const metadata = { title: "Team" };

const ROLE_LABEL: Record<string, string> = { staff: "Staff", viewer: "Viewer (read-only)" };

export default async function TeamPage() {
  const { user, me, business, role } = await requireSession();
  if (role !== "owner") {
    return (
      <>
        <PageHeader title="Team" />
        <Empty title="Only the shop owner manages the team">You're signed in as {ROLE_LABEL[role].toLowerCase()} of {business.name || "this shop"}.</Empty>
      </>
    );
  }
  const elite = isElite(user);
  const { members, pending } = elite ? await teamOf(business.id) : { members: [], pending: [] };

  const preview = (
    <Card title="Team">
      <ul className="divide-y divide-line text-sm">
        {[
          ["Dana Whitfield", "Staff"],
          ["Marcus Webb", "Staff"],
          ["Your accountant", "Viewer (read-only)"],
        ].map(([n, r]) => (
          <li key={n} className="flex justify-between py-2">
            <span className="font-medium">{n}</span>
            <span className="text-ink-2">{r}</span>
          </li>
        ))}
      </ul>
    </Card>
  );

  return (
    <>
      <PageHeader title="Team" subtitle="Give your service advisors and accountant their own login. Everyone works in the same shop; only you change settings and billing." />
      <EliteGate elite={elite} teaser={<>Invite your service advisors (staff) and your accountant (read-only) with their own logins, so nobody shares your password.</>} preview={preview}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 space-y-4 lg:col-span-2">
            <Card title={`People · ${members.length + 1}`}>
              <ul className="divide-y divide-line text-sm">
                <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="font-semibold">{me.name || me.email}</span> <span className="text-muted">· {me.email}</span>
                  </span>
                  <span className="font-semibold text-ink-2">Owner</span>
                </li>
                {members.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="font-semibold">{m.name || m.email}</span> <span className="text-muted">· {m.email}</span>
                      <span className="block text-xs text-muted">Joined {dateLabel(m.since.toISOString().slice(0, 10))}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <form action={changeRole} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={m.id} />
                        <select name="role" defaultValue={m.role} className="rounded border border-line-strong bg-surface px-1.5 py-1 text-xs" aria-label={`Access for ${m.email}`}>
                          <option value="staff">Staff</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button className="text-xs font-semibold text-brand hover:underline">Save</button>
                      </form>
                      <form action={removeMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <button className="text-xs font-semibold text-critical-ink hover:underline">Remove</button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            {pending.length > 0 && (
              <Card title={`Invitations waiting · ${pending.length}`}>
                <ul className="divide-y divide-line text-sm">
                  {pending.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span>
                        {i.email} <span className="text-muted">· {ROLE_LABEL[i.role]} · expires {dateLabel(i.expiresAt.toISOString().slice(0, 10))}</span>
                      </span>
                      <form action={revokeInvite}>
                        <input type="hidden" name="id" value={i.id} />
                        <button className="text-xs font-semibold text-critical-ink hover:underline">Cancel</button>
                      </form>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          <Card title="Invite someone" className="h-fit">
            <InviteForm />
            <p className="mt-4 text-xs text-muted">
              Team access is included with Elite. Need more help? See{" "}
              <Link href="/app/account" className="underline">
                Account
              </Link>
              .
            </p>
          </Card>
        </div>
      </EliteGate>
    </>
  );
}
