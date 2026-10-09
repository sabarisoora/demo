import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { Goals } from "@/niches/types";

const money = (name: string) =>
  numeric(name, { precision: 14, scale: 2, mode: "number" }).notNull().default(0);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  // "free" | "elite"
  plan: text("plan").notNull().default("free"),
  // When a cancelled subscription stops granting Elite. Null = no end date.
  eliteUntil: timestamp("elite_until", { withTimezone: true }),
  ds24OrderId: text("ds24_order_id"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  // Weekly summary email: opt-out flag, one-click unsubscribe token, last send time.
  digestOptOut: boolean("digest_opt_out").notNull().default(false),
  unsubscribeToken: text("unsubscribe_token"),
  lastDigestAt: timestamp("last_digest_at", { withTimezone: true }),
  // DS24 affiliate + campaign that referred this user (captured at signup).
  affiliate: text("affiliate"),
  campaign: text("campaign"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 of the cookie token; the raw token never touches the database.
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  niche: text("niche").notNull().default("auto-repair"),
  name: text("name").notNull().default(""),
  ownerName: text("owner_name").notNull().default(""),
  country: text("country").notNull().default("United States"),
  vatRegistered: boolean("vat_registered").notNull().default(false),
  // Null = use the country default.
  vatRateOverride: numeric("vat_rate_override", { precision: 6, scale: 3, mode: "number" }),
  reserveRateOverride: numeric("reserve_rate_override", { precision: 6, scale: 3, mode: "number" }),
  fiscalYearStart: integer("fiscal_year_start").notNull().default(1),
  openingCash: money("opening_cash"),
  reserveSetAside: money("reserve_set_aside"),
  // { "2026-10": { "bank": true, ... }, "docs": { "statements": true, ... } }
  // KPI Scorecard goals; null = the niche's defaults.
  goals: jsonb("goals").$type<Goals>(),
  checklist: jsonb("checklist").$type<Record<string, Record<string, boolean>>>().notNull().default({}),
  // Shop details printed on invoices and estimates.
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  // Sales tax/VAT added on invoices (percent, null = none). Applies to parts, or to everything.
  invoiceTaxRate: numeric("invoice_tax_rate", { precision: 6, scale: 3, mode: "number" }),
  invoiceTaxOnLabor: boolean("invoice_tax_on_labor").notNull().default(false),
  invoiceFooter: text("invoice_footer").notNull().default(""),
  // Default labor rate for new labor lines, and how often vehicles are due for service.
  laborRate: money("labor_rate"),
  reminderMonths: integer("reminder_months").notNull().default(6),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull().default(""),
    email: text("email").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("customers_business_name_idx").on(t.businessId, t.name)],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    year: integer("year"),
    make: text("make").notNull().default(""),
    model: text("model").notNull().default(""),
    vin: text("vin").notNull().default(""),
    plate: text("plate").notNull().default(""),
    mileage: integer("mileage"),
    // Service reminders: an explicit due date overrides "last visit + reminder interval".
    nextServiceAt: date("next_service_at", { mode: "string" }),
    lastRemindedAt: timestamp("last_reminded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("vehicles_business_idx").on(t.businessId), index("vehicles_customer_idx").on(t.customerId)],
);

// Inventory (Elite).
export const parts = pgTable(
  "parts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().default(""),
    name: text("name").notNull(),
    category: text("category").notNull().default(""),
    supplier: text("supplier").notNull().default(""),
    unitCost: money("unit_cost"),
    unitPrice: money("unit_price"),
    onHand: numeric("on_hand", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
    reorderLevel: numeric("reorder_level", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("parts_business_idx").on(t.businessId)],
);

// A sale/job. Each niche names the two revenue streams (auto repair: parts + labor).
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    ref: text("ref").notNull().default(""),
    date: date("date", { mode: "string" }).notNull(),
    category: text("category").notNull(),
    customer: text("customer").notNull().default(""),
    revenueA: money("revenue_a"),
    costA: money("cost_a"),
    revenueB: money("revenue_b"),
    costB: money("cost_b"),
    // Optional detail used by the Elite technician, receivables and comeback reports.
    technician: text("technician").notNull().default(""),
    hours: numeric("hours", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
    paid: boolean("paid").notNull().default(true),
    comeback: boolean("comeback").notNull().default(false),
    // "estimate" | "open" | "completed". Only completed jobs count in the numbers.
    status: text("status").notNull().default("completed"),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    mileage: integer("mileage"),
    notes: text("notes").notNull().default(""),
    // Unguessable token for the customer-facing invoice/estimate link (null = not shared).
    shareToken: text("share_token").unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("jobs_business_date_idx").on(t.businessId, t.date),
    index("jobs_customer_idx").on(t.customerId),
    index("jobs_vehicle_idx").on(t.vehicleId),
  ],
);

// Line items on a repair order. Their totals are written back onto the job's revenue/cost streams.
export const jobLines = pgTable(
  "job_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    // "part" (stream A) | "labor" | "fee" (stream B)
    kind: text("kind").notNull(),
    description: text("description").notNull().default(""),
    qty: numeric("qty", { precision: 12, scale: 2, mode: "number" }).notNull().default(1),
    unitPrice: money("unit_price"),
    unitCost: money("unit_cost"),
    partId: uuid("part_id").references(() => parts.id, { onDelete: "set null" }),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("job_lines_job_idx").on(t.jobId)],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    ref: text("ref").notNull().default(""),
    date: date("date", { mode: "string" }).notNull(),
    category: text("category").notNull(),
    vendor: text("vendor").notNull().default(""),
    amount: money("amount"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("expenses_business_date_idx").on(t.businessId, t.date)],
);

// Team members of a shop (Elite). The owner is businesses.user_id; members join by invitation.
// A user belongs to one shop: their own, or one they were invited to.
export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  // "staff" (can enter and edit work) | "viewer" (read-only, e.g. an accountant)
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invites = pgTable(
  "invites",
  {
    // SHA-256 of the token in the invitation link.
    id: text("id").primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("invites_business_idx").on(t.businessId)],
);

// One-time links for password reset and email verification. Only a hash of the token is stored.
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // "reset" | "verify"
    kind: text("kind").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (t) => [index("auth_tokens_user_idx").on(t.userId)],
);

// Fixed-window counters for rate limiting (login attempts, signups, reset emails).
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

// Every Digistore24 IPN call, for auditing and support.
export const ipnEvents = pgTable("ipn_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  event: text("event").notNull(),
  orderId: text("order_id"),
  productId: text("product_id"),
  email: text("email"),
  userId: uuid("user_id"),
  payload: jsonb("payload").$type<Record<string, string>>().notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Part = typeof parts.$inferSelect;
export type JobLine = typeof jobLines.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
