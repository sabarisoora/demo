import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db, customers, vehicles } from "@/db";
import { ref } from "@/db/ref";
import { isElite, requireSession } from "@/lib/auth";
import { count, dateLabel, moneyFormatter } from "@/lib/format";
import { nextService, reminderMessage, vehicleLabel, type ReminderStatus } from "@/lib/shop";
import { EliteGate } from "@/components/elite-gate";
import { Card, Empty, PageHeader, Stat } from "@/components/ui";
import { markReminded } from "../shop-actions";

export const metadata = { title: "Service reminders" };

type Due = {
  vehicleId: string;
  customerId: string;
  customer: string;
  phone: string;
  email: string;
  vehicle: string;
  mileage: number | null;
  lastVisit: string | null;
  lifetime: number;
  due: string;
  days: number;
  status: ReminderStatus;
  remindedAt: Date | null;
  message: string;
};

const RECENT_CONTACT_DAYS = 21;

function DueList({ rows, money, actions }: { rows: Due[]; money: (n: number) => string; actions: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => {
        const digits = r.phone.replace(/[^\d+]/g, "");
        return (
          <li key={r.vehicleId} className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/app/customers/${r.customerId}`} className="font-semibold hover:text-brand hover:underline">
                  {r.customer}
                </Link>
                <span className="text-ink-2">· {r.vehicle}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${r.status === "overdue" ? "bg-critical/15 text-critical-ink" : "bg-warning/20 text-ink"}`}
                >
                  {r.status === "overdue" ? `${Math.abs(r.days)} days overdue` : r.days === 0 ? "Due today" : `Due in ${r.days} days`}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-muted">
                {r.lastVisit ? `Last visit ${dateLabel(r.lastVisit)}` : "No visits yet"}
                {r.mileage ? ` · ${r.mileage.toLocaleString("en-US")} mi` : ""} · lifetime {money(r.lifetime)}
                {r.remindedAt && ` · contacted ${dateLabel(r.remindedAt.toISOString().slice(0, 10))}`}
              </div>
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {digits && (
                  <a className="btn btn-ghost px-2.5 py-1 text-xs" href={`sms:${digits}?&body=${encodeURIComponent(r.message)}`}>
                    Text
                  </a>
                )}
                {r.email && (
                  <a className="btn btn-ghost px-2.5 py-1 text-xs" href={`mailto:${r.email}?subject=${encodeURIComponent("Time for your vehicle's service")}&body=${encodeURIComponent(r.message)}`}>
                    Email
                  </a>
                )}
                {digits && (
                  <a className="btn btn-ghost px-2.5 py-1 text-xs" href={`tel:${digits}`}>
                    Call
                  </a>
                )}
                {!digits && !r.email && (
                  <Link href={`/app/customers/${r.customerId}`} className="text-brand hover:underline">
                    Add phone/email
                  </Link>
                )}
                <form action={markReminded}>
                  <input type="hidden" name="id" value={r.vehicleId} />
                  {r.remindedAt && <input type="hidden" name="undo" value="1" />}
                  <button className="text-ink-2 hover:text-ink hover:underline">{r.remindedAt ? "Undo contacted" : "Mark contacted"}</button>
                </form>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const PER_GROUP = 30;

export default async function RemindersPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const showAll = (await searchParams).all === "1";
  const { user, business } = await requireSession();
  const elite = isElite(user);
  const money = moneyFormatter(business.country);
  const today = new Date().toISOString().slice(0, 10);

  let all: Due[] = [];
  if (elite) {
    const rows = await db
      .select({
        v: vehicles,
        c: { id: customers.id, name: customers.name, phone: customers.phone, email: customers.email },
        lastVisit: sql<string | null>`(select max(j.date)::text from jobs j where j.vehicle_id = ${ref(vehicles.id)} and j.status = 'completed')`,
        lifetime: sql<number>`(select coalesce(sum(j.revenue_a + j.revenue_b), 0)::float8 from jobs j where j.customer_id = ${ref(customers.id)} and j.status = 'completed')`.mapWith(Number),
      })
      .from(vehicles)
      .innerJoin(customers, eq(customers.id, vehicles.customerId))
      .where(eq(vehicles.businessId, business.id));
    all = rows
      .map((r) => {
        const ns = nextService(r.lastVisit, r.v.nextServiceAt, business.reminderMonths, today);
        const label = vehicleLabel(r.v);
        return {
          vehicleId: r.v.id,
          customerId: r.c.id,
          customer: r.c.name,
          phone: r.c.phone,
          email: r.c.email,
          vehicle: label,
          mileage: r.v.mileage,
          lastVisit: r.lastVisit,
          lifetime: r.lifetime,
          due: ns.due ?? "",
          days: ns.days ?? 0,
          status: ns.status,
          remindedAt: r.v.lastRemindedAt,
          message: reminderMessage({ customer: r.c.name, vehicle: label, shop: business.name || "your shop", phone: business.phone, due: ns.due, overdue: ns.status === "overdue" }),
        };
      })
      .filter((r) => r.status === "overdue" || r.status === "due-soon")
      .sort((a, b) => a.days - b.days);
  }
  const recentCutoff = Date.now() - RECENT_CONTACT_DAYS * 86_400_000;
  const contacted = all.filter((r) => r.remindedAt && r.remindedAt.getTime() > recentCutoff);
  const todo = all.filter((r) => !contacted.includes(r));
  const overdue = todo.filter((r) => r.status === "overdue");
  const soon = todo.filter((r) => r.status === "due-soon");
  const sample: Due[] = [
    ["Maria Gomez", "2017 Toyota Camry", -24, 2840],
    ["Dave Kim", "2020 Ford F-150", -9, 5120],
    ["Priya Shah", "2015 Honda CR-V", 6, 1460],
    ["Tom Reed", "2019 Subaru Outback", 18, 980],
  ].map(([customer, vehicle, days, lifetime], i) => ({
    vehicleId: String(i),
    customerId: String(i),
    customer: customer as string,
    phone: "555-0100",
    email: "",
    vehicle: vehicle as string,
    mileage: 60000 + i * 9000,
    lastVisit: "2026-03-01",
    lifetime: lifetime as number,
    due: "2026-10-01",
    days: days as number,
    status: ((days as number) < 0 ? "overdue" : "due-soon") as ReminderStatus,
    remindedAt: null,
    message: "",
  }));

  return (
    <>
      <PageHeader
        title="Service reminders"
        subtitle={`Vehicles due for service: ${business.reminderMonths} months after their last visit, or the date you set on the vehicle. One tap sends a ready-written reminder.`}
      >
        <Link href="/app/settings#shop" className="btn btn-ghost">
          Change interval
        </Link>
      </PageHeader>
      <EliteGate
        elite={elite}
        teaser={<>Turn past customers into this week's bookings: see every vehicle that's due or overdue for service and send a ready-written text or email in one tap.</>}
        preview={
          <Card title="Overdue & due soon">
            <DueList rows={sample} money={money} actions={false} />
          </Card>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Overdue" value={count(overdue.length)} tone={overdue.length ? "bad" : "good"} />
          <Stat label="Due in 30 days" value={count(soon.length)} />
          <Stat label="Contacted recently" value={count(contacted.length)} hint={`Last ${RECENT_CONTACT_DAYS} days`} />
          <Stat label="Their lifetime value" value={money(todo.reduce((s, r) => s + r.lifetime, 0))} hint="Customers on this list" />
        </div>
        <div className="mt-4 space-y-4">
          {todo.length === 0 && contacted.length === 0 ? (
            <Empty title="No vehicles due right now">
              Reminders come from vehicles on your{" "}
              <Link href="/app/customers" className="font-semibold text-brand hover:underline">
                customers
              </Link>
              . Vehicles on repair orders show up here when they’re due again.
            </Empty>
          ) : (
            <>
              {overdue.length > 0 && (
                <Card title={`Overdue · ${overdue.length}`}>
                  <DueList rows={showAll ? overdue : overdue.slice(0, PER_GROUP)} money={money} actions />
                  {!showAll && overdue.length > PER_GROUP && (
                    <Link href="/app/reminders?all=1" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
                      Show all {overdue.length} →
                    </Link>
                  )}
                </Card>
              )}
              {soon.length > 0 && (
                <Card title={`Due in the next 30 days · ${soon.length}`}>
                  <DueList rows={showAll ? soon : soon.slice(0, PER_GROUP)} money={money} actions />
                  {!showAll && soon.length > PER_GROUP && (
                    <Link href="/app/reminders?all=1" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
                      Show all {soon.length} →
                    </Link>
                  )}
                </Card>
              )}
              {contacted.length > 0 && (
                <Card title={`Contacted recently · ${contacted.length}`}>
                  <DueList rows={contacted} money={money} actions />
                </Card>
              )}
            </>
          )}
        </div>
      </EliteGate>
    </>
  );
}
