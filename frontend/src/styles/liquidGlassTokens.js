/**
 * LIQUID GLASS DESIGN TOKENS
 * Single source of truth for all LiquidGlass visual parameters.
 * Tune values here — no component files need touching.
 *
 * Variant guide:
 *   panel   → main content panels (large, subtle refraction)
 *   sidebar → sidebar containers (lighter, less prominent)
 *   modal   → floating modals/overlays (strong refraction)
 *   card    → small cards, dropzones (medium weight)
 *   button  → interactive buttons (high elasticity, full pill)
 */

export const GLASS_VARIANTS = {
  panel: {
    displacementScale: 55,
    blurAmount: 0.06,
    saturation: 130,
    aberrationIntensity: 1.2,
    elasticity: 0.12,
    cornerRadius: 24,
    overLight: true,
    mode: "standard",
  },
  sidebar: {
    displacementScale: 40,
    blurAmount: 0.04,
    saturation: 120,
    aberrationIntensity: 0.8,
    elasticity: 0.10,
    cornerRadius: 20,
    overLight: true,
    mode: "standard",
  },
  modal: {
    displacementScale: 65,
    blurAmount: 0.08,
    saturation: 140,
    aberrationIntensity: 1.8,
    elasticity: 0.15,
    cornerRadius: 28,
    overLight: true,
    mode: "standard",
  },
  card: {
    displacementScale: 45,
    blurAmount: 0.05,
    saturation: 125,
    aberrationIntensity: 1.0,
    elasticity: 0.12,
    cornerRadius: 16,
    overLight: true,
    mode: "standard",
  },
  button: {
    displacementScale: 64,
    blurAmount: 0.10,
    saturation: 150,
    aberrationIntensity: 2.0,
    elasticity: 0.35,
    cornerRadius: 100,
    overLight: true,
    mode: "standard",
  },
};