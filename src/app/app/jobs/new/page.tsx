import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getNiche } from "@/niches";
import { Empty, PageHeader } from "@/components/ui";
import { editorContext } from "../editor-data";
import { RepairOrderEditor } from "../ro-editor";

export const metadata = { title: "New repair order" };

export default async function NewRepairOrderPage({ searchParams }: { searchParams: Promise<{ customer?: string; vehicle?: string; estimate?: string }> }) {
  const sp = await searchParams;
  const { user, business, role } = await requireSession();
  if (role === "viewer") return <ReadOnly />;
  const niche = getNiche(business.niche);
  const ctx = await editorContext(user, business);
  const customer = ctx.customers.find((c) => c.id === sp.customer);
  const vehicle = customer?.vehicles.find((v) => v.id === sp.vehicle);

  return (
    <>
      <div className="mb-2 text-sm">
        <Link href="/app/jobs" className="text-ink-2 hover:text-ink">
          ← {niche.job.plural}
        </Link>
      </div>
      <PageHeader
        title={sp.estimate ? "New estimate" : `New ${niche.job.singular.toLowerCase()}`}
        subtitle="Add the customer, vehicle and each part and labor line. Totals, tax and your profit update as you type."
      />
      <RepairOrderEditor
        {...ctx}
        initial={{
          status: sp.estimate ? "estimate" : "open",
          date: new Date().toISOString().slice(0, 10),
          ref: "",
          category: niche.jobCategories[0],
          customerId: customer?.id ?? null,
          vehicleId: vehicle?.id ?? null,
          mileage: vehicle?.mileage ?? null,
          technician: "",
          notes: "",
          paid: false,
          comeback: false,
          lines: [],
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
