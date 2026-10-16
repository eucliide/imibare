import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { CommandPalette } from "@/components/command-palette";
import { UndoToast } from "@/components/undo-toast";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { benchmarks, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "A premium journal for funded traders.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t0 = Date.now();
  const { user } = await getCurrentUser();
  console.log(`[layout] getCurrentUser: ${Date.now() - t0}ms`);

  const t1 = Date.now();

  const [userBenchmarks, userAccounts] = user
    ? await Promise.all([
        db
          .select({ id: benchmarks.id, name: benchmarks.name })
          .from(benchmarks)
          .where(eq(benchmarks.userId, user.id)),
        db
          .select({ id: accounts.id, name: accounts.name, isArchived: accounts.isArchived })
          .from(accounts)
          .where(eq(accounts.userId, user.id)),
      ])
    : [[], []];
  console.log(`[layout] db queries: ${Date.now() - t1}ms`);

  const activeAccounts = userAccounts.filter((a) => !a.isArchived);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Nav />
        <div className="flex-1">{children}</div>
        {user && (
          <>
            <CommandPalette
              benchmarks={userBenchmarks}
              accounts={activeAccounts}
            />
            <UndoToast />
          </>
        )}
      </body>
    </html>
  );
}
