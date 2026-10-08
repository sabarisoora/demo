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
  checklist: jsonb("checklist").$type<Record<string, Record<string, boolean>>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("jobs_business_date_idx").on(t.businessId, t.date)],
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
