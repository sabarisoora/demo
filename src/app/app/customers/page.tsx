import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { count, dateLabel, moneyFormatter } from "@/lib/format";
import { countCustomers, customerSummaries } from "@/lib/shop-data";
import { Card, Empty, PageHeader } from "@/components/ui";
import { PAGE_SIZE, parsePage } from "@/components/pager";
import { CustomerForm } from "./customer-forms";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 100);
  const page = parsePage(sp.page);
  const { business } = await requireSession();
  const money = moneyFormatter(business.country);
  const [rows, total] = await Promise.all([customerSummaries(business.id, q, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE), countCustomers(business.id)]);
  const more = rows.length > PAGE_SIZE;
  const href = (p: number) => `/app/customers?${new URLSearchParams({ ...(q && { q }), ...(p > 1 && { page: String(p) }) })}`;

  return (
    <>
      <PageHeader title="Customers" subtitle={`${count(total)} customers. Search by name, phone, email, plate, VIN or vehicle.`}>
        <a href="/api/export/customers" className="btn btn-ghost">
          Export CSV
        </a>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <form action="/app/customers" className="flex gap-2">
            <label htmlFor="q" className="sr-only">
              Search customers
            </label>
            <input id="q" name="q" defaultValue={q} className="field" placeholder="Search: name, phone, plate, VIN, “Honda Civic”…" />
            <button className="btn btn-ghost">Search</button>
            {q && (
              <Link href="/app/customers" className="btn btn-ghost">
                Clear
              </Link>
            )}
          </form>

          {rows.length === 0 ? (
            <Empty title={q ? `No customers match “${q}”` : "No customers yet"}>
              {q ? "Try part of a name, the plate or the last digits of a phone number." : "Add one on the right, or they're created automatically when you save a repair order with a customer name."}
            </Empty>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Customer</th>
                      <th className="px-4 py-2.5 font-semibold">Phone</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Vehicles</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Visits</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Lifetime</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Last visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, PAGE_SIZE).map((r) => (
                      <tr key={r.customer.id} className="border-t border-line hover:bg-surface-2">
                        <td className="px-4 py-2.5">
                          <Link href={`/app/customers/${r.customer.id}`} className="font-semibold text-ink hover:text-brand hover:underline">
                            {r.customer.name}
                          </Link>
                          {r.customer.email && <div className="text-xs text-muted">{r.customer.email}</div>}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-ink-2">{r.customer.phone}</td>
                        <td className="num px-4 py-2.5 text-right">{r.vehicleCount}</td>
                        <td className="num px-4 py-2.5 text-right">{r.visits}</td>
                        <td className="num px-4 py-2.5 text-right">{money(r.revenue)}</td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap text-ink-2">{r.lastVisit ? dateLabel(r.lastVisit) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          {(page > 1 || more) && (
            <nav aria-label="Pages" className="flex justify-between text-sm">
              <span className="text-muted">Page {page}</span>
              <span className="flex gap-2">
                {page > 1 && (
                  <Link className="btn btn-ghost" href={href(page - 1)}>
                    ← Previous
                  </Link>
                )}
                {more && (
                  <Link className="btn btn-ghost" href={href(page + 1)}>
                    Next →
                  </Link>
                )}
              </span>
            </nav>
          )}
        </div>
        <Card title="Add a customer" className="h-fit">
          <CustomerForm compact />
        </Card>
      </div>
    </>
  );
}
