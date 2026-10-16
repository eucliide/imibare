"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia, getCurrentUser } from "@/lib/auth";

export async function logout() {
  const { session } = await getCurrentUser();

  if (session) {
    await lucia.invalidateSession(session.id);
  }

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/login");
}
