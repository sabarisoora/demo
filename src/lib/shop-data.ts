import "server-only";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db, customers, jobLines, jobs, parts, vehicles } from "@/db";
import { ref } from "@/db/ref";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Subqueries alias the inner table (j, v) and qualify outer columns with ref(); see src/db/ref.ts.
const customerRevenue = sql`(select coalesce(sum(j.revenue_a + j.revenue_b), 0)::float8 from jobs j where j.customer_id = ${ref(customers.id)} and j.status = 'completed')`;

/** Customers with lifetime revenue, visit count, last visit and vehicle count. */
export async function customerSummaries(businessId: string, q = "", limit = 50, offset = 0) {
  const term = q.trim();
  const search = term
    ? or(
        ilike(customers.name, `%${term}%`),
        ilike(customers.phone, `%${term}%`),
        ilike(customers.email, `%${term}%`),
        sql`exists (select 1 from vehicles v where v.customer_id = ${ref(customers.id)} and (v.plate ilike ${`%${term}%`} or v.vin ilike ${`%${term}%`} or (v.make || ' ' || v.model) ilike ${`%${term}%`}))`,
      )
    : undefined;
  const lastVisit = sql<string | null>`(select max(j.date)::text from jobs j where j.customer_id = ${ref(customers.id)} and j.status = 'completed')`;
  return db
    .select({
      customer: customers,
      revenue: customerRevenue.mapWith(Number),
      visits: sql<number>`(select count(*)::int from jobs j where j.customer_id = ${ref(customers.id)} and j.status = 'completed')`,
      lastVisit,
      vehicleCount: sql<number>`(select count(*)::int from vehicles v where v.customer_id = ${ref(customers.id)})`,
    })
    .from(customers)
    .where(and(eq(customers.businessId, businessId), search))
    // Most recent customers first; never-served ones at the end.
    .orderBy(sql`${lastVisit} desc nulls last`, asc(customers.name))
    .limit(limit)
    .offset(offset);
}

export async function countCustomers(businessId: string) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(customers).where(eq(customers.businessId, businessId));
  return n;
}

export async function getCustomer(businessId: string, id: string) {
  const [c] = await db.select().from(customers).where(and(eq(customers.businessId, businessId), eq(customers.id, id))).limit(1);
  if (!c) return null;
  const [v, j] = await Promise.all([
    db.select().from(vehicles).where(eq(vehicles.customerId, id)).orderBy(desc(vehicles.createdAt)),
    db.select().from(jobs).where(and(eq(jobs.businessId, businessId), eq(jobs.customerId, id))).orderBy(desc(jobs.date), desc(jobs.createdAt)),
  ]);
  return { customer: c, vehicles: v, jobs: j };
}

/** Light list for pickers: every customer with their vehicles. */
export async function customerPicker(businessId: string) {
  const [cs, vs] = await Promise.all([
    db.select({ id: customers.id, name: customers.name, phone: customers.phone }).from(customers).where(eq(customers.businessId, businessId)).orderBy(asc(customers.name)),
    db
      .select({ id: vehicles.id, customerId: vehicles.customerId, year: vehicles.year, make: vehicles.make, model: vehicles.model, plate: vehicles.plate, mileage: vehicles.mileage })
      .from(vehicles)
      .where(eq(vehicles.businessId, businessId)),
  ]);
  return cs.map((c) => ({ ...c, vehicles: vs.filter((v) => v.customerId === c.id) }));
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

/** Finds a customer by name (case-insensitive) or creates one. Returns null for a blank name. */
export async function findOrCreateCustomer(tx: Tx | typeof db, businessId: string, name: string): Promise<string | null> {
  const n = norm(name);
  if (!n) return null;
  const [found] = await tx
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.businessId, businessId), sql`lower(${customers.name}) = lower(${n})`))
    .limit(1);
  if (found) return found.id;
  const [created] = await tx.insert(customers).values({ businessId, name: n }).returning({ id: customers.id });
  return created.id;
}

/** Maps many names to customer ids in one go (imports, sample data), creating missing ones. */
export async function customerIdsByName(tx: Tx | typeof db, businessId: string, names: string[]) {
  const wanted = [...new Map(names.map((n) => [norm(n).toLowerCase(), norm(n)])).entries()].filter(([k]) => k);
  const map = new Map<string, string>();
  if (!wanted.length) return map;
  const existing = await tx
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(and(eq(customers.businessId, businessId), inArray(sql`lower(${customers.name})`, wanted.map(([k]) => k))));
  for (const c of existing) map.set(c.name.toLowerCase(), c.id);
  const missing = wanted.filter(([k]) => !map.has(k));
  for (let i = 0; i < missing.length; i += 500) {
    const rows = await tx
      .insert(customers)
      .values(missing.slice(i, i + 500).map(([, name]) => ({ businessId, name })))
      .returning({ id: customers.id, name: customers.name });
    for (const c of rows) map.set(c.name.toLowerCase(), c.id);
  }
  return map;
}

export async function getJobWithLines(businessId: string, id: string) {
  const [j] = await db.select().from(jobs).where(and(eq(jobs.businessId, businessId), eq(jobs.id, id))).limit(1);
  if (!j) return null;
  const [lines, customer, vehicle] = await Promise.all([
    db.select().from(jobLines).where(eq(jobLines.jobId, id)).orderBy(asc(jobLines.sort)),
    j.customerId ? db.select().from(customers).where(eq(customers.id, j.customerId)).limit(1) : Promise.resolve([]),
    j.vehicleId ? db.select().from(vehicles).where(eq(vehicles.id, j.vehicleId)).limit(1) : Promise.resolve([]),
  ]);
  return { job: j, lines, customer: customer[0] ?? null, vehicle: vehicle[0] ?? null };
}

/** Applies stock movements (positive = take off the shelf) to this business's parts. */
export async function applyStock(tx: Tx, businessId: string, deltas: Map<string, number>) {
  for (const [partId, qty] of deltas) {
    await tx
      .update(parts)
      .set({ onHand: sql`${parts.onHand} - ${qty}` })
      .where(and(eq(parts.id, partId), eq(parts.businessId, businessId)));
  }
}

export type JobFilter = "all" | "estimate" | "open" | "completed" | "unpaid";

/** Repair orders for the list page, newest first, with vehicle label and line count. */
export async function listJobs(businessId: string, filter: JobFilter, q: string, limit: number, offset: number) {
  const term = q.trim();
  const where = and(
    eq(jobs.businessId, businessId),
    filter === "unpaid" ? and(eq(jobs.status, "completed"), eq(jobs.paid, false)) : filter === "all" ? undefined : eq(jobs.status, filter),
    term
      ? or(
          ilike(jobs.ref, `%${term}%`),
          ilike(jobs.customer, `%${term}%`),
          ilike(jobs.category, `%${term}%`),
          sql`exists (select 1 from vehicles v where v.id = ${ref(jobs.vehicleId)} and (v.plate ilike ${`%${term}%`} or (v.make || ' ' || v.model) ilike ${`%${term}%`}))`,
        )
      : undefined,
  );
  const [rows, [{ n }], counts] = await Promise.all([
    db
      .select({ job: jobs, vehicle: { year: vehicles.year, make: vehicles.make, model: vehicles.model, plate: vehicles.plate } })
      .from(jobs)
      .leftJoin(vehicles, eq(vehicles.id, jobs.vehicleId))
      .where(where)
      .orderBy(desc(jobs.date), desc(jobs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ n: sql<number>`count(*)::int` }).from(jobs).where(where),
    db
      .select({
        estimate: sql<number>`count(*) filter (where ${jobs.status} = 'estimate')::int`,
        open: sql<number>`count(*) filter (where ${jobs.status} = 'open')::int`,
        unpaid: sql<number>`count(*) filter (where ${jobs.status} = 'completed' and not ${jobs.paid})::int`,
      })
      .from(jobs)
      .where(eq(jobs.businessId, businessId)),
  ]);
  return { rows, total: n, counts: counts[0] };
}

/** Counts for the dashboard's "Shop today" strip. */
export async function shopToday(businessId: string, reminderMonths: number) {
  const [row] = await db
    .select({
      estimates: sql<number>`count(*) filter (where ${jobs.status} = 'estimate')::int`,
      estimateValue: sql<number>`coalesce(sum(${jobs.revenueA} + ${jobs.revenueB}) filter (where ${jobs.status} = 'estimate'), 0)::float8`,
      open: sql<number>`count(*) filter (where ${jobs.status} = 'open')::int`,
      unpaid: sql<number>`count(*) filter (where ${jobs.status} = 'completed' and not ${jobs.paid})::int`,
      unpaidValue: sql<number>`coalesce(sum(${jobs.revenueA} + ${jobs.revenueB}) filter (where ${jobs.status} = 'completed' and not ${jobs.paid}), 0)::float8`,
    })
    .from(jobs)
    .where(eq(jobs.businessId, businessId));
  const [[low], [due]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(parts).where(and(eq(parts.businessId, businessId), sql`${parts.onHand} <= ${parts.reorderLevel}`)),
    // Due within 30 days: an explicit date, else last completed visit + the reminder interval.
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(vehicles)
      .where(
        and(
          eq(vehicles.businessId, businessId),
          sql`coalesce(${ref(vehicles.nextServiceAt)}, (select (max(j.date) + make_interval(months => ${reminderMonths}))::date from jobs j where j.vehicle_id = ${ref(vehicles.id)} and j.status = 'completed')) <= current_date + 30`,
          sql`(${ref(vehicles.lastRemindedAt)} is null or ${ref(vehicles.lastRemindedAt)} < now() - interval '21 days')`,
        ),
      ),
  ]);
  return { ...row, estimateValue: Number(row.estimateValue), unpaidValue: Number(row.unpaidValue), lowStock: low.n, serviceDue: due.n };
}
