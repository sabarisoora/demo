import { getTableName, sql, type Column } from "drizzle-orm";

/**
 * A fully qualified column reference ("table"."column") for use inside raw subqueries.
 * Drizzle drops the table name in single-table selects, so `${customers.id}` inside a
 * subquery over jobs would silently resolve to jobs.id. Always use ref() for outer columns.
 */
export function ref(column: Column) {
  return sql.raw(`"${getTableName(column.table)}"."${column.name}"`);
}
