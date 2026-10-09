"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, businesses } from "@/db";
import { isElite, requireOwner } from "@/lib/auth";

export type GoalsState = { error?: string; ok?: string } | undefined;

const amount = z.coerce.number().finite().min(0).max(1e12);
const pct = z.coerce.number().finite().min(0).max(100).transform((v) => v / 100);

export async function saveGoals(_: GoalsState, form: FormData): Promise<GoalsState> {
  const { user, business } = await requireOwner();
  if (!isElite(user)) return { error: "Goals are an Elite feature." };
  const parsed = z
    .object({ revenue: amount, netProfit: z.coerce.number().finite().min(-1e12).max(1e12), avgTicket: amount, jobCount: amount, grossMargin: pct, netMargin: pct })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Check the numbers: amounts must be 0 or more and margins between 0 and 100." };
  await db.update(businesses).set({ goals: parsed.data }).where(eq(businesses.id, business.id));
  revalidatePath("/app/elite/scorecard");
  return { ok: "Goals saved." };
}
