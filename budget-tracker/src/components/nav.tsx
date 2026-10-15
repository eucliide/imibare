"use client";

import { useEffect, useState } from "react";
import { NavClient } from "./nav-client";

export function Nav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on a public route
    const path = window.location.pathname;
    const isPublicRoute = path === "/login" || path === "/signup";
    
    setIsAuthenticated(!isPublicRoute);
    setIsLoading(false);
  }, []);

  // Don't render anything while checking or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <NavClient />;
}
