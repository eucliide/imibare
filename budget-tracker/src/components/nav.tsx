"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavClient } from "./nav-client";

export function Nav() {
  const pathname = usePathname();
  const [shouldShowNav, setShouldShowNav] = useState(false);

  useEffect(() => {
    // Only show nav on authenticated routes (not login or signup)
    const isPublicRoute = pathname === "/login" || pathname === "/signup";
    setShouldShowNav(!isPublicRoute);
  }, [pathname]);

  // Don't render nav on public routes
  if (!shouldShowNav) {
    return null;
  }

  return <NavClient />;
}
