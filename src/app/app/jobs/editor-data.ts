import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, parts, type Business, type User } from "@/db";
import { isElite } from "@/lib/auth";
import { getCountry } from "@/lib/countries";
import { loadAllJobs } from "@/lib/data";
import { customerPicker } from "@/lib/shop-data";
import { getNiche } from "@/niches";

/** Everything the repair order editor needs besides the order itself. */
export async function editorContext(user: User, business: Business) {
  const niche = getNiche(business.niche);
  const elite = isElite(user);
  const [customers, partRows, all] = await Promise.all([
    customerPicker(business.id),
    elite
      ? db
          .select({ id: parts.id, name: parts.name, sku: parts.sku, unitPrice: parts.unitPrice, unitCost: parts.unitCost, onHand: parts.onHand })
          .from(parts)
          .where(eq(parts.businessId, business.id))
          .orderBy(asc(parts.name))
      : Promise.resolve(null),
    loadAllJobs(business.id),
  ]);
  const country = getCountry(business.country);
  return {
    customers,
    parts: partRows,
    categories: niche.jobCategories,
    technicians: [...new Set(all.map((j) => j.technician).filter(Boolean))].sort(),
    laborRate: business.laborRate,
    taxRate: business.invoiceTaxRate,
    taxOnLabor: business.invoiceTaxOnLabor,
    taxLabel: country.vat > 0 ? country.vatLabel.split(" ")[0] : "Tax",
    symbol: country.symbol || "",
    labels: {
      singular: niche.job.singular,
      short: niche.job.short,
      a: niche.streams.a,
      b: niche.streams.b,
      customer: niche.job.customerLabel,
      technician: niche.details.technician,
      comeback: niche.details.comeback,
    },
  };
}
