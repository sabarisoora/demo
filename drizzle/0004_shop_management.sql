CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"qty" numeric(12, 2) DEFAULT 1 NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"unit_cost" numeric(14, 2) DEFAULT 0 NOT NULL,
	"part_id" uuid,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"sku" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"supplier" text DEFAULT '' NOT NULL,
	"unit_cost" numeric(14, 2) DEFAULT 0 NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"on_hand" numeric(12, 2) DEFAULT 0 NOT NULL,
	"reorder_level" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"year" integer,
	"make" text DEFAULT '' NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"vin" text DEFAULT '' NOT NULL,
	"plate" text DEFAULT '' NOT NULL,
	"mileage" integer,
	"next_service_at" date,
	"last_reminded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "email" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "invoice_tax_rate" numeric(6, 3);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "invoice_tax_on_labor" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "invoice_footer" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "labor_rate" numeric(14, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "reminder_months" integer DEFAULT 6 NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "status" text DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "vehicle_id" uuid;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "mileage" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "share_token" text;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_lines" ADD CONSTRAINT "job_lines_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_lines" ADD CONSTRAINT "job_lines_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_lines" ADD CONSTRAINT "job_lines_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_business_name_idx" ON "customers" USING btree ("business_id","name");--> statement-breakpoint
CREATE INDEX "job_lines_job_idx" ON "job_lines" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "parts_business_idx" ON "parts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "vehicles_business_idx" ON "vehicles" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "vehicles_customer_idx" ON "vehicles" USING btree ("customer_id");--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jobs_customer_idx" ON "jobs" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "jobs_vehicle_idx" ON "jobs" USING btree ("vehicle_id");--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_share_token_unique" UNIQUE("share_token");