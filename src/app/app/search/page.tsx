import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, customers, jobs, vehicles } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateLabel, moneyFormatter } from "@/lib/format";
import { jobRevenue } from "@/lib/metrics";
import { statusLabel, vehicleLabel } from "@/lib/shop";
import { getNiche } from "@/niches";
import { Card, Empty, PageHeader } from "@/components/ui";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const money = moneyFormatter(business.country);
  const like = `%${q}%`;
  const digits = q.replace(/\D/g, "");

  const [cs, vs, js] = q
    ? await Promise.all([
        db
          .select()
          .from(customers)
          .where(
            and(
              eq(customers.businessId, business.id),
              or(
                ilike(customers.name, like),
                ilike(customers.email, like),
                // Phone numbers match on digits, whatever the formatting.
                digits.length >= 3 ? sql`regexp_replace(${customers.phone}, '\\D', '', 'g') like ${`%${digits}%`}` : undefined,
              ),
            ),
          )
          .limit(10),
        db
          .select({ v: vehicles, owner: customers.name })
          .from(vehicles)
          .innerJoin(customers, eq(customers.id, vehicles.customerId))
          .where(and(eq(vehicles.businessId, business.id), or(ilike(vehicles.plate, like), ilike(vehicles.vin, like), sql`(${vehicles.make} || ' ' || ${vehicles.model}) ilike ${like}`)))
          .limit(10),
        db
          .select()
          .from(jobs)
          .where(and(eq(jobs.businessId, business.id), or(ilike(jobs.ref, like), ilike(jobs.customer, like), ilike(jobs.notes, like))))
          .orderBy(desc(jobs.date))
          .limit(15),
      ])
    : [[], [], []];

  // One exact hit (an RO number or a plate) goes straight to it.
  const exactJob = js.filter((j) => j.ref.toLowerCase() === q.toLowerCase());
  if (exactJob.length === 1 && !cs.length) redirect(`/app/jobs/${exactJob[0].id}`);
  const exactPlate = vs.filter((r) => r.v.plate.toLowerCase() === q.toLowerCase());
  if (exactPlate.length === 1 && !cs.length && !exactJob.length) redirect(`/app/customers/${exactPlate[0].v.customerId}`);

  const none = q && !cs.length && !vs.length && !js.length;
  return (
    <>
      <PageHeader title="Search" subtitle={q ? `Results for “${q}”` : `Find customers, vehicles and ${niche.job.plural.toLowerCase()}.`} />
      <form action="/app/search" className="mb-4 flex max-w-xl gap-2">
        <input name="q" defaultValue={q} className="field" placeholder={`Name, phone, plate, VIN, ${niche.job.short} #…`} autoFocus aria-label="Search" />
        <button className="btn btn-primary">Search</button>
      </form>
      {none && <Empty title={`Nothing matches “${q}”`}>Try part of a name, the last 4 digits of a phone number, or a plate.</Empty>}
      <div className="grid gap-4 lg:grid-cols-2">
        {cs.length > 0 && (
          <Card title={`Customers · ${cs.length}`}>
            <ul className="divide-y divide-line text-sm">
              {cs.map((c) => (
                <li key={c.id} className="py-2">
                  <Link href={`/app/customers/${c.id}`} className="font-semibold hover:text-brand hover:underline">
                    {c.name}
                  </Link>
                  <div className="text-xs text-muted">{[c.phone, c.email].filter(Boolean).join(" · ")}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {vs.length > 0 && (
          <Card title={`Vehicles · ${vs.length}`}>
            <ul className="divide-y divide-line text-sm">
              {vs.map(({ v, owner }) => (
                <li key={v.id} className="py-2">
                  <Link href={`/app/customers/${v.customerId}`} className="font-semibold hover:text-brand hover:underline">
                    {vehicleLabel(v)}
                  </Link>
                  <div className="text-xs text-muted">{[owner, v.plate && `Plate ${v.plate}`, v.vin && `VIN ${v.vin}`].filter(Boolean).join(" · ")}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {js.length > 0 && (
          <Card title={`${niche.job.plural} · ${js.length}`} className="lg:col-span-2">
            <ul className="divide-y divide-line text-sm">
              {js.map((j) => (
                <li key={j.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>
                    <Link href={`/app/jobs/${j.id}`} className="font-semibold hover:text-brand hover:underline">
                      {j.ref}
                    </Link>{" "}
                    <span className="text-ink-2">
                      · {j.customer || "—"} · {j.category}
                    </span>
                    {j.status !== "completed" && <span className="ml-2 text-xs text-muted">{statusLabel(j.status)}</span>}
                  </span>
                  <span className="num text-ink-2">
                    {dateLabel(j.date)} · {money(jobRevenue(j))}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
