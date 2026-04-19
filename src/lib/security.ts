export function computeRiskScore(input: { failedAttempts: number; ipReputation: number; deviceTrust: number }) {
  const base = 100;
  const penalty = input.failedAttempts * 12 + (100 - input.ipReputation) * 0.3 + (100 - input.deviceTrust) * 0.25;
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
}

export function isSuspiciousActivity(riskScore: number) {
  return riskScore < 45;
}

export function hasTenantAccess(userTenantId: string, recordTenantId: string) {
  return userTenantId === recordTenantId;
}
