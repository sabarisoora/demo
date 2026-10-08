import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landing } from "@/components/landing";
import { niches } from "@/niches";

// One landing page per niche, e.g. /auto-repair. Send each niche's affiliates here.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(niches).map((niche) => ({ niche }));
}

export async function generateMetadata({ params }: { params: Promise<{ niche: string }> }): Promise<Metadata> {
  const niche = niches[(await params).niche];
  if (!niche) return {};
  return {
    title: `${niche.name} Profit Dashboard`,
    description: niche.copy.heroSubtitle,
    alternates: { canonical: `/${niche.slug}` },
  };
}

export default async function NicheLanding({ params }: { params: Promise<{ niche: string }> }) {
  const niche = niches[(await params).niche];
  if (!niche) notFound();
  return <Landing niche={niche} />;
}
