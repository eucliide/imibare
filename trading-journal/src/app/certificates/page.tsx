import { db } from "@/db";
import { certificates, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { computeCertificateStats, groupByFirm } from "@/lib/certificates";
import { CertificatesClient } from "./certificates-client";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.createdAt);

  const rows = await db
    .select({
      cert: certificates,
      accountName: accounts.name,
    })
    .from(certificates)
    .leftJoin(accounts, eq(certificates.accountId, accounts.id))
    .where(eq(certificates.userId, user.id))
    .orderBy(desc(certificates.achievedAt));

  const allCerts = rows.map((r) => ({
    ...r.cert,
    accountName: r.accountName ?? "Unknown account",
  }));

  const stats = computeCertificateStats(allCerts);
  const firmGroups = groupByFirm(allCerts);

  const nonArchivedAccounts = userAccounts
    .filter((a) => !a.isArchived)
    .map((a) => ({ id: a.id, name: a.name }));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <CertificatesClient
          certs={allCerts}
          stats={stats}
          firmGroups={firmGroups}
          accounts={nonArchivedAccounts}
        />
      </div>
    </main>
  );
}
