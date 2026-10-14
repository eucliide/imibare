"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { signupSchema } from "@/lib/schemas";
import type { ActionResult } from "@/types/actions";

export async function signup(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password, name } = parsed.data;

  // Rate limiting by IP
  const headersList = await headers();
  const ip = headersList.get("cf-connecting-ip") ?? headersList.get("x-forwarded-for") ?? "unknown";
  const rateLimitKey = `signup:${ip}`;

  if (!checkRateLimit(rateLimitKey)) {
    logger.warn("Rate limit exceeded on signup", { ip, email });
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    // Check for existing email
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { error: "Email already registered." };
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ email, hashedPassword, name })
      .returning({ id: users.id });

    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    redirect("/dashboard");
  } catch (error) {
    logger.error("Signup failed", { email, ip }, error instanceof Error ? error : undefined);
    return { error: "Failed to create account. Please try again." };
  }
}
