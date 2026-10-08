import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { loadEntries } from "@/lib/data";
import { dateLabel, moneyFormatter } from "@/lib/format";
import { getNiche } from "@/niches";
import { Card, Empty, PageHeader } from "@/components/ui";
import { PAGE_SIZE, Pager, parsePage } from "@/components/pager";
import { deleteExpense } from "../actions";
import { DeleteButton, ExpenseForm } from "../entry-forms";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ edit?: string; page?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const { expenses } = await loadEntries(business.id);
  const money = moneyFormatter(business.country);
  const editing = sp.edit ? expenses.find((e) => e.id === sp.edit) : undefined;
  const page = parsePage(sp.page);
  const rows = expenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Expenses" subtitle={`Overhead for the ${niche.businessNoun}: rent, insurance, marketing, software and so on. Direct job costs go on each ${niche.job.singular.toLowerCase()}.`}>
        <a href="/api/export/expenses" className="btn btn-ghost">
          Export CSV
        </a>
        <Link href="/app/import" className="btn btn-ghost">
          Import CSV
        </Link>
      </PageHeader>

      <Card title={editing ? `Edit ${editing.ref || "expense"}` : "Add an expense"}>
        <ExpenseForm key={editing?.id ?? "new"} categories={niche.expenseCategories} initial={editing} />
      </Card>

      <div className="mt-4">
        {expenses.length === 0 ? (
          <Empty title="No expenses yet">Add one above or import a bank/credit card CSV.</Empty>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Ref</th>
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold">Vendor</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id} className={`border-t border-line ${editing?.id === e.id ? "bg-brand-soft" : ""}`}>
                      <td className="px-4 py-2 font-medium">{e.ref}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-ink-2">{dateLabel(e.date)}</td>
                      <td className="px-4 py-2">{e.category}</td>
                      <td className="px-4 py-2 text-ink-2">{e.vendor}</td>
                      <td className="num px-4 py-2 text-right">{money(e.amount)}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-3">
                          <Link href={`/app/expenses?edit=${e.id}`} className="text-xs font-semibold text-brand hover:underline">
                            Edit
                          </Link>
                          <DeleteButton action={deleteExpense} id={e.id} label={e.ref || "this expense"} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        <Pager page={page} total={expenses.length} base="/app/expenses" />
      </div>
    </>
  );
}
