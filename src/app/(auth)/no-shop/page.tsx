import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { logout } from "../actions";
import { startOwnShop } from "@/app/app/team/actions";

export const metadata = { title: "No shop", robots: { index: false } };

export default async function NoShopPage({ searchParams }: { searchParams: Promise<{ paused?: string }> }) {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const paused = (await searchParams).paused === "1";
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{paused ? "Team access is paused" : "You're not part of a shop"}</h1>
      <p className="mt-2 mb-6 text-sm text-ink-2">
        {paused
          ? "Team logins are part of the shop's Elite plan, which isn't active right now. Ask the shop owner to renew it; your access comes back as soon as they do."
          : "You were removed from the shop you belonged to, or haven't joined one yet. Ask the owner for a new invitation, or start your own free shop."}
      </p>
      <div className="flex flex-wrap gap-3">
        {!paused && (
          <form action={startOwnShop}>
            <button className="btn btn-primary">Start my own free shop</button>
          </form>
        )}
        <form action={logout}>
          <button className="btn btn-ghost">Log out</button>
        </form>
      </div>
    </>
  );
}
