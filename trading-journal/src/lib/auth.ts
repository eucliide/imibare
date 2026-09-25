import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { cookies } from "next/headers";
import { cache } from "react";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(attributes) {
    return {
      email: attributes.email,
      name: attributes.name,
    };
  },
});

// Module augmentation so TypeScript knows the shape of user attributes
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
    };
  }
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Cached per-request. Safe to call from any server component or server action.

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { user: null, session: null };
  }

  const { user, session } = await lucia.validateSession(sessionId);

  try {
    if (session?.fresh) {
      const freshCookie = lucia.createSessionCookie(session.id);
      cookieStore.set(
        freshCookie.name,
        freshCookie.value,
        freshCookie.attributes
      );
    }
    if (!session) {
      const blankCookie = lucia.createBlankSessionCookie();
      cookieStore.set(
        blankCookie.name,
        blankCookie.value,
        blankCookie.attributes
      );
    }
  } catch {
    // Server components cannot set cookies during render — safe to ignore.
  }

  return { user, session };
});
