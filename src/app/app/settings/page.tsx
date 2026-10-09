import Link from "next/link";
import { isElite, requireSession } from "@/lib/auth";
import { countries, getCountry } from "@/lib/countries";
import { dateLabel } from "@/lib/format";
import { Card, OwnerOnly, PageHeader, TAX_DISCLAIMER } from "@/components/ui";
import { SettingsForm } from "./settings-form";
import { DataTools } from "./danger";
import { ShopForm } from "./shop-form";
import { getNiche } from "@/niches";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, business, role } = await requireSession();
  if (role !== "owner") return <OwnerOnly title="Settings" />;
  const elite = isElite(user);
  return (
    <>
      <PageHeader title="Settings" subtitle="Your country sets the currency and default tax rates. Override any rate your accountant gives you." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <SettingsForm initial={business} countries={countries} />
            <p className="mt-6 text-xs text-muted">{TAX_DISCLAIMER}</p>
          </Card>
          <section id="shop" className="scroll-mt-6">
            <Card title="Shop & invoices">
              <ShopForm
                initial={business}
                taxLabel={getCountry(business.country).vat > 0 ? getCountry(business.country).vatLabel.split(" ")[0] : "Sales tax"}
                laborLabel={getNiche(business.niche).streams.b}
              />
            </Card>
          </section>
        </div>
        <div className="space-y-4">
          <Card title="Plan">
            <p className="text-sm">
              {elite ? (
                <>
                  <strong className="text-accent">Elite</strong>
                  {user.eliteUntil && ` · active until ${dateLabel(user.eliteUntil.toISOString().slice(0, 10))}`}
                </>
              ) : (
                <>
                  <strong>Essential (free)</strong>
                </>
              )}
            </p>
            {!elite && (
              <Link href="/app/upgrade" className="btn btn-primary mt-3">
                Upgrade to Elite
              </Link>
            )}
            {elite && <p className="mt-2 text-xs text-muted">Manage or cancel your subscription from the Digistore24 receipt email.</p>}
          </Card>
          <Card title="Data">
            <p className="mb-3 text-sm text-ink-2">Load demo data to explore, or wipe everything to start fresh.</p>
            <DataTools />
          </Card>
        </div>
      </div>
    </>
  );
}
