/**
 * Lightweight haptic feedback helper.
 * Falls back silently on devices/browsers without the Vibration API.
 */
export type HapticPattern = "tap" | "soft" | "success" | "warn";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  soft: 14,
  success: [10, 40, 18],
  warn: [20, 60, 20],
};

export const haptic = (pattern: HapticPattern = "tap") => {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* noop */
  }
};