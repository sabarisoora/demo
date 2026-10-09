import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, businesses, customers, jobLines, jobs, vehicles } from "@/db";
import { getNiche } from "@/niches";
import { InvoiceView } from "@/components/invoice-view";
import { PrintButton } from "@/app/app/accountant/print-button";

export const metadata = { title: "Invoice", robots: { index: false, follow: false } };

// Public, login-free view of one shared invoice/estimate. The token is 18 random bytes.
export default async function SharedInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) notFound();
  const [row] = await db.select({ job: jobs, business: businesses }).from(jobs).innerJoin(businesses, eq(businesses.id, jobs.businessId)).where(eq(jobs.shareToken, token)).limit(1);
  if (!row) notFound();
  const { job, business } = row;
  const [lines, customer, vehicle] = await Promise.all([
    db.select().from(jobLines).where(eq(jobLines.jobId, job.id)).orderBy(asc(jobLines.sort)),
    job.customerId ? db.select().from(customers).where(and(eq(customers.id, job.customerId), eq(customers.businessId, business.id))).limit(1) : Promise.resolve([]),
    job.vehicleId ? db.select().from(vehicles).where(and(eq(vehicles.id, job.vehicleId), eq(vehicles.businessId, business.id))).limit(1) : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="no-print mb-4 flex justify-end">
        <PrintButton />
      </div>
      <InvoiceView business={business} job={job} lines={lines} customer={customer[0] ?? null} vehicle={vehicle[0] ?? null} niche={getNiche(business.niche)} />
      <p className="no-print mt-6 text-center text-xs text-muted">
        Questions? Contact {business.name}
        {business.phone && ` at ${business.phone}`}.
      </p>
    </main>
  );
}
