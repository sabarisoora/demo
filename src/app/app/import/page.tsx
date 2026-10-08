import { requireSession } from "@/lib/auth";
import { getNiche } from "@/niches";
import { Card, PageHeader } from "@/components/ui";
import { ImportForm } from "./import-form";

export const metadata = { title: "Import CSV" };

export default async function ImportPage() {
  const { business } = await requireSession();
  const niche = getNiche(business.niche);
  const { a, b } = niche.streams;
  return (
    <>
      <PageHeader
        title="Import CSV"
        subtitle={`Export from your current software, spreadsheet or bank, and upload it here. Columns are matched by name, so you usually don't need to rename anything.`}
      />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <ImportForm jobLabel={niche.job.plural} />
        </Card>
        <Card title="Recognized columns" className="text-sm lg:col-span-2">
          <h3 className="font-semibold">{niche.job.plural}</h3>
          <ul className="mt-1 mb-4 space-y-0.5 text-ink-2">
            <li>
              <code>Date</code> <span className="text-muted">(required)</span>
            </li>
            <li>
              <code>{a} Revenue</code>, <code>{a} Cost</code>, <code>{b} Revenue</code>, <code>{b} Cost</code>
            </li>
            <li>
              or a single <code>Total</code> + <code>Cost</code>
            </li>
            <li>
              <code>Category</code> / <code>Service Type</code>, <code>Customer</code>, <code>{niche.job.short} Number</code>
            </li>
          </ul>
          <h3 className="font-semibold">Expenses</h3>
          <ul className="mt-1 mb-4 space-y-0.5 text-ink-2">
            <li>
              <code>Date</code>, <code>Amount</code> <span className="text-muted">(required)</span>
            </li>
            <li>
              <code>Category</code>, <code>Vendor</code> / <code>Payee</code>, <code>Ref</code>
            </li>
          </ul>
          <p className="text-xs text-muted">
            Tip: from the Excel workbook, save the {niche.job.plural} or Expense sheet as CSV (File → Save As → CSV) and import it directly. Imports add to existing data.
          </p>
        </Card>
      </div>
    </>
  );
}
