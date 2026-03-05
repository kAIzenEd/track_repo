/**
 * Liquid Glass (SVG feDisplacementMap backdrop distortion) requires
 * Chrome/Chromium. Safari and Firefox do not render the displacement.
 *
 * When false, GlassPanel and GlassButton fall back to your existing
 * CSS glassmorphism (.glass-panel from glass.css) — zero visual breakage,
 * just a less dynamic effect.
 */
export const supportsLiquidGlass = (() => {
  if (typeof navigator === "undefined") return false;
  const isChrome =
    /Chrome/.test(navigator.userAgent) &&
    /Google Inc/.test(navigator.vendor);
  return isChrome;
})();