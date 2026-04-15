/**
 * Recursively convert BigInt values so JSON.stringify / res.json() never throws.
 * Postgres + Prisma raw queries sometimes return bigint for aggregates and ranks.
 */
export function toJsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? Number(v) : v)),
  );
}
