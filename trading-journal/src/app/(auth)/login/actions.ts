"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas";

export async function login(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid credentials." };
  }

  const { email, password } = parsed.data;

  // Rate limiting by IP
  const headersList = await headers();
  const ip = headersList.get("cf-connecting-ip") ?? headersList.get("x-forwarded-for") ?? "unknown";
  const rateLimitKey = `login:${ip}`;

  if (!checkRateLimit(rateLimitKey)) {
    logger.warn("Rate limit exceeded on login", { ip, email });
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Same error for "not found" and "wrong password" — prevents user enumeration
    if (!user) {
      return { error: "Invalid credentials." };
    }

    const valid = await verifyPassword(user.hashedPassword, password);
    if (!valid) {
      return { error: "Invalid credentials." };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    redirect("/dashboard");
  } catch (error) {
    logger.error("Login failed", { email, ip }, error instanceof Error ? error : undefined);
    return { error: "Failed to log in. Please try again." };
  }
}
