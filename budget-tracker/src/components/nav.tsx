import { getCurrentUser } from "@/lib/auth";
import { NavClient } from "./nav-client";

export async function Nav() {
  const { user } = await getCurrentUser();

  // Don't render nav if not authenticated
  if (!user) {
    return null;
  }

  return <NavClient />;
}
