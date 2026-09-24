"use server";

import { db } from "@/db";
import { playbookSetups } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  rules: z.string().min(1, "Rules are required").max(2000),
});

export async function createSetup(formData: FormData) {
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
  try {
    await db.delete(playbookSetups).where(eq(playbookSetups.id, id));
    revalidatePath("/playbook");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to delete setup." };
  }
}