import { autoRepair } from "./auto-repair";
import type { Niche } from "./types";

// Register new niches here.
export const niches: Record<string, Niche> = {
  [autoRepair.slug]: autoRepair,
};

export const defaultNiche = autoRepair;

export function getNiche(slug: string | null | undefined): Niche {
  return (slug && niches[slug]) || defaultNiche;
}

export type { Niche } from "./types";
