const FLAG_KEYS = [
  "FEATURE_POS",
  "FEATURE_MEDIA_LIBRARY",
  "FEATURE_CANVAS_BUILDER",
  "FEATURE_PLATFORM_ADMIN",
] as const;

export type FeatureFlagName = (typeof FLAG_KEYS)[number];

export function readFeatureFlags() {
  return FLAG_KEYS.reduce<Record<FeatureFlagName, boolean>>((acc, key) => {
    acc[key] = process.env[key] === "1" || process.env[key] === "true";
    return acc;
  }, {} as Record<FeatureFlagName, boolean>);
}
