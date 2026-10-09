import { describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { customers } from "./schema";
import { ref } from "./ref";

describe("ref()", () => {
  it("keeps the table name where Drizzle would drop it (single-table select)", () => {
    const db = drizzle.mock();
    const bare = db.select({ n: sql`(select 1 from jobs j where j.customer_id = ${customers.id})` }).from(customers).toSQL().sql;
    const safe = db.select({ n: sql`(select 1 from jobs j where j.customer_id = ${ref(customers.id)})` }).from(customers).toSQL().sql;
    expect(bare).toContain('j.customer_id = "id"'); // the trap: would resolve to jobs.id
    expect(safe).toContain('j.customer_id = "customers"."id"');
  });
});
