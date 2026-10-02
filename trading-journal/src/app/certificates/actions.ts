"use server";

// Hard deletes are intentional for certificates — they are infrequent
// accounting records, not a journal feed. Soft delete is not needed.

import { db } from "@/db";
import { certificates, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const certSchema = z.object({
  accountId: z.string().uuid(),
  firm: z.string().min(1).max(80),
  accountSize: z.coerce.number().positive(),
  profitTarget: z.coerce.number().positive(),
  maxDrawdown: z.coerce.number().positive(),
  phase: z.enum(["challenge", "verification", "funded"]),
  achievedAt: z.coerce.date(),
  certificateUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

async function assertAccountOwner(accountId: string, userId: string) {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1);
  return account ?? null;
}

function revalidateAll() {
  revalidatePath("/certificates");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function createCertificate(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = certSchema.safeParse({
    accountId: formData.get("accountId"),
    firm: formData.get("firm"),
    accountSize: formData.get("accountSize"),
    profitTarget: formData.get("profitTarget"),
    maxDrawdown: formData.get("maxDrawdown"),
    phase: formData.get("phase"),
    achievedAt: formData.get("achievedAt"),
    certificateUrl: formData.get("certificateUrl"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { success: false, error: "Invalid data. Check all fields." };
  const d = parsed.data;

  const account = await assertAccountOwner(d.accountId, user.id);
  if (!account) return { success: false, error: "Account not found." };

  await db.insert(certificates).values({
    userId: user.id,
    accountId: d.accountId,
    firm: d.firm,
    accountSize: d.accountSize.toString(),
    profitTarget: d.profitTarget.toString(),
    maxDrawdown: d.maxDrawdown.toString(),
    phase: d.phase,
    achievedAt: d.achievedAt,
    certificateUrl: d.certificateUrl || null,
    notes: d.notes || null,
  });

  revalidateAll();
  return { success: true };
}

export async function updateCertificate(id: string, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [existing] = await db
    .select({ id: certificates.id })
    .from(certificates)
    .where(and(eq(certificates.id, id), eq(certificates.userId, user.id)))
    .limit(1);
  if (!existing) return { success: false, error: "Certificate not found." };

  const parsed = certSchema.safeParse({
    accountId: formData.get("accountId"),
    firm: formData.get("firm"),
    accountSize: formData.get("accountSize"),
    profitTarget: formData.get("profitTarget"),
    maxDrawdown: formData.get("maxDrawdown"),
    phase: formData.get("phase"),
    achievedAt: formData.get("achievedAt"),
    certificateUrl: formData.get("certificateUrl"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { success: false, error: "Invalid data. Check all fields." };
  const d = parsed.data;

  const account = await assertAccountOwner(d.accountId, user.id);
  if (!account) return { success: false, error: "Account not found." };

  await db
    .update(certificates)
    .set({
      accountId: d.accountId,
      firm: d.firm,
      accountSize: d.accountSize.toString(),
      profitTarget: d.profitTarget.toString(),
      maxDrawdown: d.maxDrawdown.toString(),
      phase: d.phase,
      achievedAt: d.achievedAt,
      certificateUrl: d.certificateUrl || null,
      notes: d.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(certificates.id, id), eq(certificates.userId, user.id)));

  revalidateAll();
  return { success: true };
}

export async function deleteCertificate(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  await db
    .delete(certificates)
    .where(and(eq(certificates.id, id), eq(certificates.userId, user.id)));

  revalidateAll();
  return { success: true };
}

export async function getCertificate(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [cert] = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.id, id), eq(certificates.userId, user.id)))
    .limit(1);

  return cert ?? null;
}
