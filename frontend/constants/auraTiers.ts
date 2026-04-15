import { tailwindColors } from "@/constants/tailwind-colors";

export type AuraTierDef = {
  label: string;
  color: string;
  bg: string;
  minPoints: number;
};

/** Highest minPoints first — first match wins (same rule as Aura tab). */
export const AURA_TIERS_DESC: AuraTierDef[] = [
  { label: "red", color: tailwindColors["aura-red"], bg: tailwindColors["aura-red-tint"], minPoints: 500 },
  { label: "orange", color: tailwindColors["aura-orange"], bg: "#FFF8EE", minPoints: 300 },
  { label: "yellow", color: tailwindColors["aura-yellow"], bg: "#FFFDE7", minPoints: 150 },
  { label: "green", color: tailwindColors["aura-green"], bg: tailwindColors["aura-green-light"], minPoints: 75 },
  { label: "blue", color: tailwindColors["aura-blue"], bg: "#EEF2FF", minPoints: 25 },
  { label: "purple", color: tailwindColors["aura-purple"], bg: "#F5EEFF", minPoints: 0 },
];

export function getTierForPoints(points: number): AuraTierDef {
  return AURA_TIERS_DESC.find((t) => points >= t.minPoints) ?? AURA_TIERS_DESC[AURA_TIERS_DESC.length - 1];
}

/** Next tier floor strictly above `points` (milestones 25 → 75 → 150 → …). Null if already at max. */
export function getNextAuraThreshold(points: number): number | null {
  const thresholds = [25, 75, 150, 300, 500];
  const next = thresholds.find((t) => t > points);
  return next ?? null;
}

/** Tier you reach when you hit `threshold` points (used for “next” sparkle color). */
export function getTierAtThreshold(threshold: number): AuraTierDef {
  return getTierForPoints(threshold);
}
