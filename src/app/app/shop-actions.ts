"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, businesses, customers, jobLines, jobs, parts, vehicles } from "@/db";
import { isElite, requireOwner, requireWriter } from "@/lib/auth";
import { applyStock, findOrCreateCustomer } from "@/lib/shop-data";
import { lineTotals, stockDeltas, type JobStatus } from "@/lib/shop";
import { getNiche } from "@/niches";

export type ShopState = { error?: string; ok?: string } | undefined;
const refresh = () => revalidatePath("/app", "layout");
const uuid = z.string().uuid();
const money = z.coerce.number().finite().min(0).max(1e10);
const text = (max: number) => z.string().trim().max(max).default("");
const optInt = (min: number, max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(min).max(max)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v));

// ───────────── Customers ─────────────

const customerSchema = z.object({
  id: uuid.optional().or(z.literal("")),
  name: z.string().trim().min(1, "Enter the customer's name").max(160),
  phone: text(40),
  email: z.string().trim().toLowerCase().max(200).refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Enter a valid email").default(""),
  notes: text(2000),
});

export async function saveCustomer(_: ShopState, form: FormData): Promise<ShopState> {
  const { business } = await requireWriter();
  const p = customerSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const { id, ...v } = p.data;
  if (id) {
    await db.update(customers).set(v).where(and(eq(customers.id, id), eq(customers.businessId, business.id)));
    // Keep the name on past jobs in sync so reports and invoices match.
    await db.update(jobs).set({ customer: v.name }).where(and(eq(jobs.customerId, id), eq(jobs.businessId, business.id)));
    refresh();
    return { ok: "Saved." };
  }
  const [c] = await db.insert(customers).values({ ...v, businessId: business.id }).returning({ id: customers.id });
  refresh();
  redirect(`/app/customers/${c.id}`);
}

export async function deleteCustomer(form: FormData) {
  const { business } = await requireWriter();
  const id = uuid.parse(form.get("id"));
  // Jobs keep the customer's name (customer_id becomes null); vehicles are removed with the customer.
  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.businessId, business.id)));
  refresh();
  redirect("/app/customers");
}

// ───────────── Vehicles ─────────────

const vehicleSchema = z.object({
  id: uuid.optional().or(z.literal("")),
  customerId: uuid,
  year: optInt(1900, 2100),
  make: text(60),
  model: text(60),
  vin: z.string().trim().toUpperCase().max(32).default(""),
  plate: z.string().trim().toUpperCase().max(20).default(""),
  mileage: optInt(0, 5_000_000),
  nextServiceAt: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/)
    .optional()
    .transform((v) => v || null),
});

export async function saveVehicle(_: ShopState, form: FormData): Promise<ShopState> {
  const { business } = await requireWriter();
  const p = vehicleSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message.replace(/^Invalid input.*/, "Check the year and mileage.") };
  const { id, ...v } = p.data;
  if (!v.make && !v.model && !v.plate && !v.vin) return { error: "Enter at least a make/model, plate or VIN." };
  const [owner] = await db.select({ id: customers.id }).from(customers).where(and(eq(customers.id, v.customerId), eq(customers.businessId, business.id))).limit(1);
  if (!owner) return { error: "Customer not found." };
  if (id) await db.update(vehicles).set(v).where(and(eq(vehicles.id, id), eq(vehicles.businessId, business.id)));
  else await db.insert(vehicles).values({ ...v, businessId: business.id });
  refresh();
  return { ok: id ? "Vehicle saved." : "Vehicle added." };
}

export async function deleteVehicle(form: FormData) {
  const { business } = await requireWriter();
  const id = uuid.parse(form.get("id"));
  await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.businessId, business.id)));
  refresh();
}

export async function markReminded(form: FormData) {
  const { user, business } = await requireWriter();
  if (!isElite(user)) return;
  const id = uuid.parse(form.get("id"));
  const undo = form.get("undo") === "1";
  await db
    .update(vehicles)
    .set({ lastRemindedAt: undo ? null : new Date() })
    .where(and(eq(vehicles.id, id), eq(vehicles.businessId, business.id)));
  refresh();
}

// ───────────── Repair orders with line items ─────────────

const lineSchema = z.object({
  kind: z.enum(["part", "labor", "fee"]),
  description: z.string().trim().max(300),
  qty: z.coerce.number().finite().min(0).max(100000),
  unitPrice: money,
  unitCost: money,
  partId: uuid.nullable().optional(),
});

const roSchema = z.object({
  id: uuid.optional().nullable(),
  status: z.enum(["estimate", "open", "completed"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  ref: z.string().trim().max(60).default(""),
  category: z.string().trim().min(1, "Pick a category").max(120),
  customerId: uuid.nullable().optional(),
  newCustomer: z.string().trim().max(160).default(""),
  vehicleId: uuid.nullable().optional(),
  newVehicle: z
    .object({ year: z.coerce.number().int().min(1900).max(2100).nullable(), make: z.string().trim().max(60), model: z.string().trim().max(60), plate: z.string().trim().max(20) })
    .nullable()
    .optional(),
  mileage: z.coerce.number().int().min(0).max(5_000_000).nullable().optional(),
  technician: z.string().trim().max(80).default(""),
  notes: z.string().trim().max(4000).default(""),
  paid: z.boolean(),
  comeback: z.boolean(),
  lines: z.array(lineSchema).max(200),
});
export type RepairOrderInput = z.input<typeof roSchema>;

/** Saves a repair order from the editor. Totals, hours and stock all follow from the lines. */
export async function saveRepairOrder(input: RepairOrderInput): Promise<{ error?: string; id?: string }> {
  const { user, business } = await requireWriter();
  const p = roSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0].message };
  const v = p.data;
  const lines = v.lines.filter((l) => l.description || l.qty * l.unitPrice > 0);
  if (!lines.length) return { error: "Add at least one part, labor or fee line." };
  const elite = isElite(user);
  const niche = getNiche(business.niche);

  // Parts on lines must belong to this shop (inventory is Elite; otherwise part links are dropped).
  const partIds = [...new Set(lines.map((l) => l.partId).filter((x): x is string => !!x))];
  const owned = elite && partIds.length
    ? new Set((await db.select({ id: parts.id }).from(parts).where(and(eq(parts.businessId, business.id), inArray(parts.id, partIds)))).map((r) => r.id))
    : new Set<string>();
  const clean = lines.map((l, i) => ({ ...l, partId: l.partId && owned.has(l.partId) ? l.partId : null, sort: i }));
  const t = lineTotals(clean, business.invoiceTaxRate, business.invoiceTaxOnLabor);

  const id = await db.transaction(async (tx) => {
    // Customer: picked, or created from a typed name.
    let customerId: string | null = null;
    let customerName = "";
    if (v.customerId) {
      const [c] = await tx.select().from(customers).where(and(eq(customers.id, v.customerId), eq(customers.businessId, business.id))).limit(1);
      if (c) [customerId, customerName] = [c.id, c.name];
    } else if (v.newCustomer) {
      customerId = await findOrCreateCustomer(tx, business.id, v.newCustomer);
      customerName = v.newCustomer;
    }

    // Vehicle: picked (must belong to the customer), or created inline.
    let vehicleId: string | null = null;
    if (customerId && v.vehicleId) {
      const [veh] = await tx.select({ id: vehicles.id }).from(vehicles).where(and(eq(vehicles.id, v.vehicleId), eq(vehicles.customerId, customerId))).limit(1);
      vehicleId = veh?.id ?? null;
    } else if (customerId && v.newVehicle && (v.newVehicle.make || v.newVehicle.model || v.newVehicle.plate)) {
      const [veh] = await tx
        .insert(vehicles)
        .values({ businessId: business.id, customerId, ...v.newVehicle, plate: v.newVehicle.plate.toUpperCase() })
        .returning({ id: vehicles.id });
      vehicleId = veh.id;
    }
    // A newer odometer reading updates the vehicle.
    if (vehicleId && v.mileage) {
      await tx
        .update(vehicles)
        .set({ mileage: v.mileage })
        .where(and(eq(vehicles.id, vehicleId), sql`coalesce(${vehicles.mileage}, 0) < ${v.mileage}`));
    }

    const fields = {
      status: v.status,
      date: v.date,
      category: v.category,
      customer: customerName,
      customerId,
      vehicleId,
      mileage: v.mileage ?? null,
      technician: v.technician,
      notes: v.notes,
      paid: v.paid,
      comeback: v.comeback,
      revenueA: t.revenueA,
      costA: t.costA,
      revenueB: t.revenueB,
      costB: t.costB,
      hours: t.hours,
    };

    let jobId: string;
    let oldLines: { partId: string | null; qty: number }[] = [];
    let oldStatus: string | null = null;
    if (v.id) {
      const [existing] = await tx.select().from(jobs).where(and(eq(jobs.id, v.id), eq(jobs.businessId, business.id))).limit(1);
      if (!existing) throw new Error("not found");
      oldStatus = existing.status;
      oldLines = await tx.select({ partId: jobLines.partId, qty: jobLines.qty }).from(jobLines).where(eq(jobLines.jobId, v.id));
      await tx.update(jobs).set({ ...fields, ref: refForStatus(v.ref || existing.ref, v.status, niche.job.refPrefix) }).where(eq(jobs.id, v.id));
      await tx.delete(jobLines).where(eq(jobLines.jobId, v.id));
      jobId = v.id;
    } else {
      const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.businessId, business.id));
      const ref = v.ref || `${v.status === "estimate" ? "EST-" : niche.job.refPrefix}${1000 + n}`;
      const [created] = await tx.insert(jobs).values({ ...fields, ref, businessId: business.id }).returning({ id: jobs.id });
      jobId = created.id;
    }
    await tx.insert(jobLines).values(clean.map((l) => ({ ...l, jobId, businessId: business.id })));
    if (elite) await applyStock(tx, business.id, stockDeltas(oldLines, oldStatus, clean, v.status));
    return jobId;
  });

  refresh();
  return { id };
}

const STATUS_FLOW: JobStatus[] = ["estimate", "open", "completed"];

/** An approved estimate becomes a repair order: EST-1004 → RO-1004 (custom numbers are kept). */
function refForStatus(ref: string, status: string, prefix: string) {
  return status !== "estimate" && /^EST-\d+$/.test(ref) ? ref.replace(/^EST-/, prefix) : ref;
}

/** Moves a repair order along Estimate → In progress → Completed (or back), adjusting stock. */
export async function setJobStatus(form: FormData) {
  const { user, business } = await requireWriter();
  const id = uuid.parse(form.get("id"));
  const status = z.enum(STATUS_FLOW as [JobStatus, ...JobStatus[]]).parse(form.get("status"));
  await db.transaction(async (tx) => {
    const [j] = await tx.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.businessId, business.id))).limit(1);
    if (!j || j.status === status) return;
    const lines = await tx.select({ partId: jobLines.partId, qty: jobLines.qty }).from(jobLines).where(eq(jobLines.jobId, id));
    // Completing work dates it today unless it already has a later date.
    const today = new Date().toISOString().slice(0, 10);
    const date = status === "completed" && j.status !== "completed" && j.date < today ? today : j.date;
    const ref = refForStatus(j.ref, status, getNiche(business.niche).job.refPrefix);
    await tx.update(jobs).set({ status, date, ref }).where(eq(jobs.id, id));
    if (isElite(user)) await applyStock(tx, business.id, stockDeltas(lines, j.status, lines, status));
  });
  refresh();
}

/** Creates (or removes) the customer-facing link for an invoice/estimate. */
export async function setShared(form: FormData) {
  const { business } = await requireWriter();
  const id = uuid.parse(form.get("id"));
  const on = form.get("on") === "1";
  await db
    .update(jobs)
    .set({ shareToken: on ? randomBytes(18).toString("base64url") : null })
    .where(and(eq(jobs.id, id), eq(jobs.businessId, business.id)));
  refresh();
}

/** Deletes a repair order and returns any parts it used to stock. */
export async function deleteRepairOrder(form: FormData) {
  const { user, business } = await requireWriter();
  const id = uuid.parse(form.get("id"));
  await db.transaction(async (tx) => {
    const [j] = await tx.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.businessId, business.id))).limit(1);
    if (!j) return;
    const lines = await tx.select({ partId: jobLines.partId, qty: jobLines.qty }).from(jobLines).where(eq(jobLines.jobId, id));
    if (isElite(user)) await applyStock(tx, business.id, stockDeltas(lines, j.status, [], null));
    await tx.delete(jobs).where(eq(jobs.id, id));
  });
  refresh();
  redirect("/app/jobs");
}

// ───────────── Shop & invoice settings ─────────────

const shopSchema = z.object({
  address: text(300),
  phone: text(40),
  email: text(200),
  invoiceTaxRate: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 50), "Tax rate must be between 0 and 50"),
  invoiceTaxOnLabor: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  invoiceFooter: text(1000),
  laborRate: money,
  reminderMonths: z.coerce.number().int().min(1).max(36),
});

export async function saveShopSettings(_: ShopState, form: FormData): Promise<ShopState> {
  const { business } = await requireOwner();
  const p = shopSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  await db.update(businesses).set(p.data).where(eq(businesses.id, business.id));
  refresh();
  return { ok: "Shop details saved." };
}

// ───────────── Inventory (Elite) ─────────────

const partSchema = z.object({
  id: uuid.optional().or(z.literal("")),
  sku: text(60),
  name: z.string().trim().min(1, "Enter the part name").max(200),
  category: text(80),
  supplier: text(120),
  unitCost: money,
  unitPrice: money,
  onHand: z.coerce.number().finite().min(-1e6).max(1e7),
  reorderLevel: z.coerce.number().finite().min(0).max(1e7),
});

export async function savePart(_: ShopState, form: FormData): Promise<ShopState> {
  const { user, business } = await requireWriter();
  if (!isElite(user)) return { error: "Inventory is an Elite feature." };
  const p = partSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const { id, ...v } = p.data;
  if (id) await db.update(parts).set(v).where(and(eq(parts.id, id), eq(parts.businessId, business.id)));
  else await db.insert(parts).values({ ...v, businessId: business.id });
  refresh();
  if (id) redirect("/app/inventory");
  return { ok: "Part added." };
}

export async function adjustStock(form: FormData) {
  const { user, business } = await requireWriter();
  if (!isElite(user)) return;
  const id = uuid.parse(form.get("id"));
  const by = z.coerce.number().finite().min(-1e6).max(1e6).parse(form.get("by"));
  await db.update(parts).set({ onHand: sql`${parts.onHand} + ${by}` }).where(and(eq(parts.id, id), eq(parts.businessId, business.id)));
  refresh();
}

export async function deletePart(form: FormData) {
  const { user, business } = await requireWriter();
  if (!isElite(user)) return;
  const id = uuid.parse(form.get("id"));
  await db.delete(parts).where(and(eq(parts.id, id), eq(parts.businessId, business.id)));
  refresh();
}
