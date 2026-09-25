"use server";

import { db } from "@/db";
import { playbookSetups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  rules: z.string().min(1, "Rules are required").max(2000),
});

export async function createSetup(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const raw = {
    name: formData.get("name"),
    rules: formData.get("rules"),
  };

  const parsed = setupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid setup data." };
  }

  try {
    await db.insert(playbookSetups).values({
      userId: user.id,
      name: parsed.data.name.toUpperCase(),
      rules: parsed.data.rules,
    });
    revalidatePath("/playbook");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to save setup." };
  }
}

export async function deleteSetup(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    await db
      .delete(playbookSetups)
      .where(
        and(
          eq(playbookSetups.id, id),
          eq(playbookSetups.userId, user.id)
        )
      );
    revalidatePath("/playbook");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to delete setup." };
  }
}
