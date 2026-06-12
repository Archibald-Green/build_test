const SUPPORTED_SIZES = new Set(["small", "medium", "large"]);

export const DEFAULT_WATERMARK = Object.freeze({
  enabled: true,
  text: "eSepte ONLINE",
  opacity: 0.08,
  size: "medium",
});

export function resolveWatermark(test) {
  const watermark = test?.watermark;

  if (watermark?.enabled === false) {
    return null;
  }

  if (watermark === undefined) {
    return { ...DEFAULT_WATERMARK };
  }

  const text =
    typeof watermark.text === "string" && watermark.text.trim()
      ? watermark.text.trim()
      : test?.title || DEFAULT_WATERMARK.text;
  const opacity =
    typeof watermark.opacity === "number" &&
    Number.isFinite(watermark.opacity) &&
    watermark.opacity >= 0 &&
    watermark.opacity <= 1
      ? watermark.opacity
      : DEFAULT_WATERMARK.opacity;
  const size = SUPPORTED_SIZES.has(watermark.size)
    ? watermark.size
    : DEFAULT_WATERMARK.size;

  return {
    enabled: true,
    text,
    opacity,
    size,
  };
}
