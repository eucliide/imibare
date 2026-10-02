// src/lib/certificates.ts

const r2 = (n: number) => Math.round(n * 100) / 100;

export type Certificate = {
  id: string;
  firm: string;
  accountSize: string;
  profitTarget: string;
  maxDrawdown: string;
  phase: string;
  achievedAt: Date;
};

export type CertificateStats = {
  total: number;
  byPhase: { challenge: number; verification: number; funded: number };
  totalProfitTargetHit: number;
  latestAchievedAt: Date | null;
};

export function computeCertificateStats(certs: Certificate[]): CertificateStats {
  if (certs.length === 0) {
    return {
      total: 0,
      byPhase: { challenge: 0, verification: 0, funded: 0 },
      totalProfitTargetHit: 0,
      latestAchievedAt: null,
    };
  }

  const byPhase = { challenge: 0, verification: 0, funded: 0 };
  let totalProfitTargetHit = 0;
  let latestAchievedAt: Date | null = null;

  for (const c of certs) {
    const phase = c.phase as keyof typeof byPhase;
    if (phase in byPhase) byPhase[phase]++;
    totalProfitTargetHit = r2(totalProfitTargetHit + parseFloat(c.profitTarget));
    const d = new Date(c.achievedAt);
    if (!latestAchievedAt || d > latestAchievedAt) latestAchievedAt = d;
  }

  return { total: certs.length, byPhase, totalProfitTargetHit, latestAchievedAt };
}

export type FirmGroup = { firm: string; count: number; totalSize: number };

export function groupByFirm(certs: Certificate[]): FirmGroup[] {
  const map = new Map<string, FirmGroup>();
  for (const c of certs) {
    const existing = map.get(c.firm) ?? { firm: c.firm, count: 0, totalSize: 0 };
    existing.count++;
    existing.totalSize = r2(existing.totalSize + parseFloat(c.accountSize));
    map.set(c.firm, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
