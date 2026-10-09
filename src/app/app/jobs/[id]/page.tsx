import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { requestOrigin } from "@/lib/email";
import { moneyFormatter } from "@/lib/format";
import { jobProfit, jobRevenue } from "@/lib/metrics";
import { statusLabel, vehicleLabel } from "@/lib/shop";
import { getJobWithLines } from "@/lib/shop-data";
import { getNiche } from "@/niches";
import { InvoiceView } from "@/components/invoice-view";
import { Card } from "@/components/ui";
import { PrintButton } from "../../accountant/print-button";
import { setJobPaid } from "../../actions";
import { DeleteButton } from "../../entry-forms";
import { deleteRepairOrder, setJobStatus, setShared } from "../../shop-actions";
import { CopyLink } from "./share-link";

export const metadata = { title: "Repair order" };

export default async function RepairOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { business } = await requireSession();
  const data = await getJobWithLines(business.id, id);
  if (!data) notFound();
  const { job, lines, customer, vehicle } = data;
  const niche = getNiche(business.niche);
  const money = moneyFormatter(business.country);
  const shareUrl = job.shareToken ? `${await requestOrigin()}/i/${job.shareToken}` : null;
  const profit = jobProfit(job);
  const revenue = jobRevenue(job);
  const missingShop = !business.address && !business.phone;

  const next: { status: string; label: string; primary?: boolean }[] =
    job.status === "estimate"
      ? [{ status: "open", label: "Approve: start work", primary: true }, { status: "completed", label: "Mark completed" }]
      : job.status === "open"
        ? [{ status: "completed", label: "Mark completed", primary: true }, { status: "estimate", label: "Back to estimate" }]
        : [{ status: "open", label: "Reopen" }];

  return (
    <>
      <div className="no-print mb-2 text-sm">
        <Link href="/app/jobs" className="text-ink-2 hover:text-ink">
          ← {niche.job.plural}
        </Link>
        {customer && (
          <>
            <span className="text-muted"> · </span>
            <Link href={`/app/customers/${customer.id}`} className="text-ink-2 hover:text-ink">
              {customer.name}
            </Link>
          </>
        )}
      </div>

      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{job.ref}</h1>
          <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">{statusLabel(job.status)}</span>
          {job.status === "completed" && !job.paid && <span className="rounded bg-warning/20 px-2 py-0.5 text-xs font-bold uppercase">Unpaid</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {next.map((n) => (
            <form key={n.status} action={setJobStatus}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="status" value={n.status} />
              <button className={`btn ${n.primary ? "btn-primary" : "btn-ghost"}`}>{n.label}</button>
            </form>
          ))}
          {job.status === "completed" && (
            <form action={setJobPaid}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="paid" value={job.paid ? "false" : "true"} />
              <button className={`btn ${job.paid ? "btn-ghost" : "btn-primary"}`}>{job.paid ? "Mark unpaid" : "Mark paid"}</button>
            </form>
          )}
          <Link href={`/app/jobs/${job.id}/edit`} className="btn btn-ghost">
            Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {missingShop && (
            <p className="no-print mb-3 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-ink-2">
              Add your shop's address and phone in{" "}
              <Link href="/app/settings#shop" className="font-semibold text-brand hover:underline">
                Settings
              </Link>{" "}
              so they print on invoices.
            </p>
          )}
          <InvoiceView business={business} job={job} lines={lines} customer={customer} vehicle={vehicle} niche={niche} />
        </div>
        <div className="no-print space-y-4">
          <Card title="Share with customer">
            {shareUrl ? (
              <>
                <p className="mb-2 text-sm text-ink-2">Anyone with this link can view this {job.status === "estimate" ? "estimate" : "invoice"} (no login). Text or email it.</p>
                <CopyLink url={shareUrl} />
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                  {customer?.phone && (
                    <a className="text-brand hover:underline" href={`sms:${customer.phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(`Your ${job.status === "estimate" ? "estimate" : "invoice"} from ${business.name}: ${shareUrl}`)}`}>
                      Text it
                    </a>
                  )}
                  {customer?.email && (
                    <a
                      className="text-brand hover:underline"
                      href={`mailto:${customer.email}?subject=${encodeURIComponent(`${job.status === "estimate" ? "Estimate" : "Invoice"} ${job.ref} from ${business.name}`)}&body=${encodeURIComponent(`Hi ${customer.name.split(" ")[0]},\n\nHere is your ${job.status === "estimate" ? "estimate" : "invoice"}: ${shareUrl}\n\nThank you,\n${business.name}`)}`}
                    >
                      Email it
                    </a>
                  )}
                  <form action={setShared}>
                    <input type="hidden" name="id" value={job.id} />
                    <input type="hidden" name="on" value="0" />
                    <button className="text-critical-ink hover:underline">Turn off link</button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink-2">Create a private link your customer can open on their phone. You can turn it off any time.</p>
                <form action={setShared}>
                  <input type="hidden" name="id" value={job.id} />
                  <input type="hidden" name="on" value="1" />
                  <button className="btn btn-primary">Create link</button>
                </form>
              </>
            )}
          </Card>
          <Card title="Your numbers">
            <dl className="num space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="font-sans text-ink-2">Revenue (before tax)</dt>
                <dd>{money(revenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-sans text-ink-2">Cost</dt>
                <dd>{money(revenue - profit)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 font-semibold">
                <dt className="font-sans">Profit</dt>
                <dd className={profit < 0 ? "text-critical-ink" : "text-good-ink"}>
                  {money(profit)} <span className="text-xs font-normal text-muted">{revenue ? `${Math.round((profit / revenue) * 100)}%` : ""}</span>
                </dd>
              </div>
            </dl>
            {job.status !== "completed" && <p className="mt-2 text-xs text-muted">Counts in your reports once it's completed.</p>}
            {(job.technician || vehicle) && (
              <p className="mt-3 text-xs text-ink-2">
                {job.technician && <>{niche.details.technician}: {job.technician}. </>}
                {vehicle && <>Vehicle: {vehicleLabel(vehicle)}.</>}
              </p>
            )}
          </Card>
          <Card title="Delete">
            <DeleteButton action={deleteRepairOrder} id={job.id} label={job.ref} />
          </Card>
        </div>
      </div>
    </>
  );
}
