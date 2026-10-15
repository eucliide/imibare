import { getCurrentUser } from "@/lib/auth";
import { NavClient } from "./nav-client";

export async function Nav() {
  try {
    const { user } = await getCurrentUser();

    // Don't render nav if not authenticated
    if (!user) {
      return null;
    }

    return <NavClient />;
  } catch (error) {
    // If auth check fails, don't render nav
    console.error("[Nav] Auth check failed:", error);
    return null;
  }
}
