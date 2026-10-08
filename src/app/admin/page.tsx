import Link from "next/link";
import { and, count, desc, eq, gt, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db, businesses, ipnEvents, jobs, users } from "@/db";
import { isElite, requireAdmin } from "@/lib/auth";
import { count as fmtCount, percent } from "@/lib/format";
import { Card, PageHeader, Stat } from "@/components/ui";
import { grantElite, revokeElite, verifyEmailManually } from "./actions";
import { TestDigestButton } from "./test-digest";

const PAGE = 50;
const ago = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const when = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");

// Paying = Elite with no end date or an end date in the future.
const activeElite = and(eq(users.plan, "elite"), or(isNull(users.eliteUntil), sql`${users.eliteUntil} > now()`));

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);

  const [[totals], [last7], [last30], [verified], [elite], [withData], affiliates, events] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(users).where(gt(users.createdAt, ago(7))),
    db.select({ n: count() }).from(users).where(gt(users.createdAt, ago(30))),
    db.select({ n: count() }).from(users).where(isNotNull(users.emailVerifiedAt)),
    db.select({ n: count() }).from(users).where(activeElite),
    db
      .select({ n: sql<number>`count(distinct ${businesses.userId})::int` })
      .from(businesses)
      .innerJoin(jobs, eq(jobs.businessId, businesses.id)),
    db
      .select({
        affiliate: users.affiliate,
        signups: count(),
        elite: sql<number>`count(*) filter (where ${activeElite})::int`,
      })
      .from(users)
      .where(isNotNull(users.affiliate))
      .groupBy(users.affiliate)
      .orderBy(desc(count()))
      .limit(25),
    db.select().from(ipnEvents).orderBy(desc(ipnEvents.receivedAt)).limit(30),
  ]);

  const search = q ? or(ilike(users.email, `%${q}%`), ilike(users.name, `%${q}%`), ilike(businesses.name, `%${q}%`), ilike(users.affiliate, `%${q}%`)) : undefined;
  const people = await db
    .select({
      user: users,
      business: businesses.name,
      entries: sql<number>`(select count(*)::int from ${jobs} where ${jobs.businessId} = ${businesses.id})`,
    })
    .from(users)
    .leftJoin(businesses, eq(businesses.userId, users.id))
    .where(search)
    .orderBy(desc(users.createdAt))
    .limit(PAGE + 1)
    .offset((page - 1) * PAGE);
  const hasMore = people.length > PAGE;

  return (
    <>
      <PageHeader title="Admin" subtitle="Signups, subscribers, affiliates and payment events.">
        <TestDigestButton />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Users" value={fmtCount(totals.n)} />
        <Stat label="New · 7 days" value={fmtCount(last7.n)} />
        <Stat label="New · 30 days" value={fmtCount(last30.n)} />
        <Stat label="Email confirmed" value={percent(totals.n ? verified.n / totals.n : 0, 0)} />
        <Stat label="Using it" value={fmtCount(withData.n)} hint="Have at least 1 entry" />
        <Stat label="Elite now" value={fmtCount(elite.n)} hint={`${percent(totals.n ? elite.n / totals.n : 0)} of users`} tone="good" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Signups by affiliate">
          {affiliates.length === 0 ? (
            <p className="text-sm text-muted">No affiliate signups yet. They appear here when visitors arrive with ?aff=.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted uppercase">
                <tr>
                  <th className="pb-2 font-semibold">Affiliate</th>
                  <th className="pb-2 text-right font-semibold">Signups</th>
                  <th className="pb-2 text-right font-semibold">Elite</th>
                  <th className="pb-2 text-right font-semibold">Conversion</th>
                </tr>
              </thead>
              <tbody className="num">
                {affiliates.map((a) => (
                  <tr key={a.affiliate} className="border-t border-line">
                    <td className="py-1.5 font-sans">
                      <Link href={`/admin?q=${encodeURIComponent(a.affiliate ?? "")}`} className="hover:underline">
                        {a.affiliate}
                      </Link>
                    </td>
                    <td className="py-1.5 text-right">{a.signups}</td>
                    <td className="py-1.5 text-right">{a.elite}</td>
                    <td className="py-1.5 text-right">{percent(a.signups ? a.elite / a.signups : 0, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Latest Digistore24 events">
          {events.length === 0 ? (
            <p className="text-sm text-muted">No IPN calls received yet. Use “Test connection” in Digistore24 to check the link.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-t border-line first:border-0">
                      <td className="num py-1.5 pr-2 whitespace-nowrap text-muted">{when(e.receivedAt)}</td>
                      <td className="py-1.5 pr-2 font-semibold">{e.event}</td>
                      <td className="py-1.5 pr-2">{e.email}</td>
                      <td className="num py-1.5 pr-2 text-muted">#{e.productId}</td>
                      <td className="py-1.5 text-right">{e.userId ? <span className="text-good-ink">matched</span> : <span className="text-muted">unmatched</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title="Users" className="mt-4 overflow-hidden p-0">
        <form className="flex gap-2 border-b border-line p-4" action="/admin">
          <input name="q" defaultValue={q} placeholder="Search email, name, business or affiliate" className="field max-w-md" />
          <button className="btn btn-ghost">Search</button>
          {q && (
            <Link href="/admin" className="btn btn-ghost">
              Clear
            </Link>
          )}
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-4 py-2.5 font-semibold">Business</th>
                <th className="px-4 py-2.5 font-semibold">Joined</th>
                <th className="px-4 py-2.5 font-semibold">Affiliate</th>
                <th className="px-4 py-2.5 text-right font-semibold">Entries</th>
                <th className="px-4 py-2.5 font-semibold">Plan</th>
                <th className="px-4 py-2.5 font-semibold">Support</th>
              </tr>
            </thead>
            <tbody>
              {people.slice(0, PAGE).map(({ user: u, business, entries }) => (
                <tr key={u.id} className="border-t border-line align-top">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{u.email}</div>
                    <div className="text-xs text-muted">
                      {u.name} · {u.emailVerifiedAt ? <span className="text-good-ink">confirmed</span> : "unconfirmed"}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-2">{business}</td>
                  <td className="num px-4 py-2.5 whitespace-nowrap text-ink-2">{u.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-2.5 text-ink-2">{u.affiliate ?? "—"}</td>
                  <td className="num px-4 py-2.5 text-right">{entries}</td>
                  <td className="px-4 py-2.5">
                    {isElite(u) ? (
                      <span className="font-semibold text-accent">
                        Elite{u.eliteUntil && <span className="block text-xs font-normal text-muted">until {u.eliteUntil.toISOString().slice(0, 10)}</span>}
                      </span>
                    ) : (
                      <span className="text-muted">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {isElite(u) ? (
                        <form action={revokeElite}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="text-xs font-semibold text-critical-ink hover:underline">Remove Elite</button>
                        </form>
                      ) : (
                        <form action={grantElite} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={u.id} />
                          <select name="days" className="rounded border border-line-strong bg-surface px-1 py-0.5 text-xs" aria-label="Duration">
                            <option value="30">30 days</option>
                            <option value="365">1 year</option>
                            <option value="0">No end</option>
                          </select>
                          <button className="text-xs font-semibold text-brand hover:underline">Give Elite</button>
                        </form>
                      )}
                      {!u.emailVerifiedAt && (
                        <form action={verifyEmailManually}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="text-xs font-semibold text-ink-2 hover:underline">Mark confirmed</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-line p-4 text-sm">
          <span className="text-muted">Page {page}</span>
          <span className="flex gap-2">
            {page > 1 && (
              <Link className="btn btn-ghost" href={`/admin?${new URLSearchParams({ ...(q && { q }), page: String(page - 1) })}`}>
                ← Newer
              </Link>
            )}
            {hasMore && (
              <Link className="btn btn-ghost" href={`/admin?${new URLSearchParams({ ...(q && { q }), page: String(page + 1) })}`}>
                Older →
              </Link>
            )}
          </span>
        </div>
      </Card>
    </>
  );
}
