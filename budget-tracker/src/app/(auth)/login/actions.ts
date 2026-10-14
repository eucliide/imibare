"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { verifyPassword } from "@/lib/password";
import { lucia } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(_prevState: unknown, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid credentials" };
  }

  const { email, password } = result.data;

  try {
    // Find user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    // Verify password
    const validPassword = await verifyPassword(user.passwordHash, password);
    if (!validPassword) {
      return { error: "Invalid credentials" };
    }

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Invalid credentials" };
  }

  redirect("/dashboard");
}
