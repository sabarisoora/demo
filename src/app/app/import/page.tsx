import { requireSession } from "@/lib/auth";
import { getNiche } from "@/niches";
import { Card, OwnerOnly, PageHeader } from "@/components/ui";
import { ImportForm } from "./import-form";
import { WorkbookForm } from "./workbook-form";

export const metadata = { title: "Import data" };

export default async function ImportPage() {
  const { business, role } = await requireSession();
  if (role !== "owner") return <OwnerOnly title="Import data" />;
  const niche = getNiche(business.niche);
  const { a, b } = niche.streams;
  return (
    <>
      <PageHeader
        title="Import data"
        subtitle="Bring in your ProfitIQS Excel workbook, or a CSV from your shop software, spreadsheet or bank. CSV columns are matched by name."
      />
      <Card title="Moving from the ProfitIQS Excel workbook?" className="mb-4 border-brand/40">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <WorkbookForm />
          </div>
          <div className="text-sm text-ink-2 lg:col-span-2">
            <p>Upload the Essential or Elite workbook as it is. No need to save sheets as CSV.</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5">
              <li>
                <strong>Essential:</strong> repair orders, expenses, your business name, country and opening cash.
              </li>
              <li>
                <strong>Elite:</strong> also customers, vehicles, technicians, hours, comebacks and your full parts inventory. Open or waiting-for-parts ROs come in as “In progress”.
              </li>
            </ul>
          </div>
        </div>
      </Card>
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
