"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia, getCurrentUser } from "@/lib/auth";

export async function logout() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await lucia.invalidateSession(user.sessionId);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/login");
}
