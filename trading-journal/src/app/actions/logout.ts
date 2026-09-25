"use server";

import { lucia, getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const { session } = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  await lucia.invalidateSession(session.id);

  const blankCookie = lucia.createBlankSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(
    blankCookie.name,
    blankCookie.value,
    blankCookie.attributes
  );

  redirect("/login");
}
