import Link from "next/link";
import { notFound } from "next/navigation";
import { isElite, requireSession } from "@/lib/auth";
import { count, dateLabel, moneyFormatter } from "@/lib/format";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { nextService, statusLabel, vehicleLabel } from "@/lib/shop";
import { getCustomer } from "@/lib/shop-data";
import { getNiche } from "@/niches";
import { Card, PageHeader, Stat } from "@/components/ui";
import { DeleteButton } from "../../entry-forms";
import { deleteCustomer, deleteVehicle } from "../../shop-actions";
import { CustomerForm, EditVehicleToggle, VehicleForm } from "../customer-forms";

export const metadata = { title: "Customer" };

const badge: Record<string, string> = {
  overdue: "bg-critical/15 text-critical-ink",
  "due-soon": "bg-warning/20 text-ink",
  later: "bg-surface-2 text-ink-2",
};

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, business } = await requireSession();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const data = await getCustomer(business.id, id);
  if (!data) notFound();
  const { customer, vehicles, jobs } = data;
  const niche = getNiche(business.niche);
  const money = moneyFormatter(business.country);
  const done = jobs.filter((j) => j.status === "completed");
  const revenue = done.reduce((s, j) => s + jobRevenue(j), 0);
  const owed = done.filter((j) => !j.paid).reduce((s, j) => s + jobRevenue(j), 0);
  const today = new Date().toISOString().slice(0, 10);
  const lastVisitFor = (vid: string) => done.filter((j) => j.vehicleId === vid).map((j) => j.date).sort().at(-1) ?? null;

  return (
    <>
      <div className="mb-2 text-sm">
        <Link href="/app/customers" className="text-ink-2 hover:text-ink">
          ← Customers
        </Link>
      </div>
      <PageHeader title={customer.name} subtitle={[customer.phone, customer.email].filter(Boolean).join(" · ") || undefined}>
        {customer.phone && (
          <a href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`} className="btn btn-ghost">
            Call
          </a>
        )}
        {customer.email && (
          <a href={`mailto:${customer.email}`} className="btn btn-ghost">
            Email
          </a>
        )}
        <Link href={`/app/jobs/new?customer=${customer.id}`} className="btn btn-primary">
          New {niche.job.singular.toLowerCase()}
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lifetime revenue" value={money(revenue)} />
        <Stat label="Visits" value={count(done.length)} hint={done[0] ? `Last ${dateLabel(done[0].date)}` : undefined} />
        <Stat label="Profit from customer" value={money(done.reduce((s, j) => s + jobProfit(j), 0))} />
        <Stat label="Owes you" value={money(owed)} tone={owed > 0 ? "bad" : undefined} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <Card title={`Vehicles · ${vehicles.length}`}>
            <ul className="divide-y divide-line">
              {vehicles.map((v) => {
                const ns = nextService(lastVisitFor(v.id), v.nextServiceAt, business.reminderMonths, today);
                return (
                  <li key={v.id} className="py-3 first:pt-0">
                    <EditVehicleToggle customerId={customer.id} vehicle={v}>
                      <div>
                        <div className="font-semibold">{vehicleLabel(v)}</div>
                        <div className="text-xs text-ink-2">
                          {[v.plate && `Plate ${v.plate}`, v.vin && `VIN ${v.vin}`, v.mileage && `${v.mileage.toLocaleString("en-US")} mi`].filter(Boolean).join(" · ") || "No details yet"}
                        </div>
                        {ns.due && isElite(user) && (
                          <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${badge[ns.status]}`}>
                            Service {ns.status === "overdue" ? "overdue since" : "due"} {dateLabel(ns.due)}
                          </span>
                        )}
                      </div>
                    </EditVehicleToggle>
                    <div className="mt-1 flex gap-3">
                      <Link href={`/app/jobs/new?customer=${customer.id}&vehicle=${v.id}`} className="text-xs font-semibold text-brand hover:underline">
                        New {niche.job.short} for this vehicle
                      </Link>
                      <DeleteButton action={deleteVehicle} id={v.id} label={vehicleLabel(v)} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <details className="mt-3 rounded-lg border border-line px-3 py-2" open={vehicles.length === 0}>
              <summary className="cursor-pointer text-sm font-semibold text-brand">+ Add a vehicle</summary>
              <div className="mt-3">
                <VehicleForm customerId={customer.id} />
              </div>
            </details>
          </Card>

          <Card title={`Service history · ${jobs.length}`} className="overflow-hidden p-0">
            {jobs.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-2">No {niche.job.plural.toLowerCase()} yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">{niche.job.short} #</th>
                      <th className="px-4 py-2.5 font-semibold">Date</th>
                      <th className="px-4 py-2.5 font-semibold">Vehicle</th>
                      <th className="px-4 py-2.5 font-semibold">Work</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => {
                      const v = vehicles.find((x) => x.id === j.vehicleId);
                      return (
                        <tr key={j.id} className="border-t border-line">
                          <td className="px-4 py-2">
                            <Link href={`/app/jobs/${j.id}`} className="font-semibold hover:text-brand hover:underline">
                              {j.ref}
                            </Link>
                            {j.status !== "completed" && <span className="ml-2 text-xs text-muted">{statusLabel(j.status)}</span>}
                            {!j.paid && j.status === "completed" && <span className="ml-2 rounded bg-warning/20 px-1.5 text-[10px] font-bold uppercase">Unpaid</span>}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-ink-2">{dateLabel(j.date)}</td>
                          <td className="px-4 py-2 text-ink-2">{v ? vehicleLabel(v) : "—"}</td>
                          <td className="px-4 py-2">{j.category}</td>
                          <td className="num px-4 py-2 text-right">{money(jobRevenue(j))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Details">
            <CustomerForm initial={customer} />
          </Card>
          <Card title="Delete customer">
            <p className="mb-3 text-sm text-ink-2">Removes the customer and their vehicles. Their past {niche.job.plural.toLowerCase()} stay in your numbers.</p>
            <DeleteButton action={deleteCustomer} id={customer.id} label={customer.name} />
          </Card>
        </div>
      </div>
    </>
  );
}
