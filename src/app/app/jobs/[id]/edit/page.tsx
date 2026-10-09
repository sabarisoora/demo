import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import type { JobStatus, LineKind } from "@/lib/shop";
import { getJobWithLines } from "@/lib/shop-data";
import { getNiche } from "@/niches";
import { Empty, PageHeader } from "@/components/ui";
import { editorContext } from "../../editor-data";
import { RepairOrderEditor } from "../../ro-editor";

export const metadata = { title: "Edit repair order" };

export default async function EditRepairOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { user, business, role } = await requireSession();
  if (role === "viewer") return <ReadOnly />;
  const data = await getJobWithLines(business.id, id);
  if (!data) notFound();
  const { job, lines } = data;
  const niche = getNiche(business.niche);
  const ctx = await editorContext(user, business);

  // Jobs entered as totals only (quick entry, CSV, sample) become one parts line and one labor line.
  const editLines: { kind: LineKind; description: string; qty: number; unitPrice: number; unitCost: number; partId: string | null }[] = lines.length
    ? lines.map((l) => ({ kind: l.kind as LineKind, description: l.description, qty: l.qty, unitPrice: l.unitPrice, unitCost: l.unitCost, partId: l.partId }))
    : [
        ...(job.revenueA || job.costA ? [{ kind: "part" as const, description: niche.streams.a, qty: 1, unitPrice: job.revenueA, unitCost: job.costA, partId: null }] : []),
        ...(job.revenueB || job.costB
          ? [
              job.hours > 0
                ? { kind: "labor" as const, description: niche.streams.b, qty: job.hours, unitPrice: Math.round((job.revenueB / job.hours) * 100) / 100, unitCost: Math.round((job.costB / job.hours) * 100) / 100, partId: null }
                : { kind: "labor" as const, description: niche.streams.b, qty: 1, unitPrice: job.revenueB, unitCost: job.costB, partId: null },
            ]
          : []),
      ];

  return (
    <>
      <div className="mb-2 text-sm">
        <Link href={`/app/jobs/${job.id}`} className="text-ink-2 hover:text-ink">
          ← {job.ref}
        </Link>
      </div>
      <PageHeader title={`Edit ${job.ref}`} />
      <RepairOrderEditor
        {...ctx}
        initial={{
          id: job.id,
          status: job.status as JobStatus,
          date: job.date,
          ref: job.ref,
          category: job.category,
          customerId: job.customerId,
          vehicleId: job.vehicleId,
          mileage: job.mileage,
          technician: job.technician,
          notes: job.notes,
          paid: job.paid,
          comeback: job.comeback,
          lines: editLines,
        }}
      />
    </>
  );
}

function ReadOnly() {
  return (
    <>
      <PageHeader title="Read-only access" />
      <Empty title="You can view repair orders but not change them">Ask the shop owner for staff access if you need to edit.</Empty>
    </>
  );
}
