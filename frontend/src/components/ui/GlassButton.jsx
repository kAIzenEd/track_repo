/**
 * GlassButton — correctly wired to liquid-glass-react internals.
 *
 * KEY INSIGHT from source: LiquidGlass centers itself using
 *   transform: translate(-50% + elasticX, -50% + elasticY)
 * so it MUST sit inside a position:relative wrapper that is the
 * exact same size as glassSize. Without this the button floats
 * out of flow and wrecks flex/grid alignment.
 *
 * Pattern:
 *   <div style={{ position:'relative', width, height, display:'inline-block' }}>
 *     <LiquidGlass glassSize={{ width, height }}
 *                  style={{ position:'absolute', top:'50%', left:'50%' }}>
 *       children
 *     </LiquidGlass>
 *   </div>
 *
 * The outer div is in normal flow. LiquidGlass renders inside it,
 * centered via transform. Flex/grid sees the outer div, not LiquidGlass.
 *
 * overLight: true because our background is light blue/grey.
 * Source: when overLight=true → boxShadow is heavier + overlay darkens
 * slightly for contrast, which is exactly what Apple does on light BGs.
 */
import LiquidGlass from "liquid-glass-react";
import { supportsLiquidGlass } from "../../utils/browserSupport";

export default function GlassButton({
  children,
  onClick,
  className = "",
  style = {},
  disabled = false,
  width = 110,
  height = 36,
}) {
  if (!supportsLiquidGlass) {
    return (
      <button
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        className={`glass-button ${className}`}
        style={{ opacity: disabled ? 0.5 : 1, height, ...style }}
      >
        {children}
      </button>
    );
  }

  return (
    // Outer div: participates in flex/grid layout as normal flow element
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "inline-block",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <LiquidGlass
        glassSize={{ width, height }}
        displacementScale={70}
        blurAmount={0.07}
        saturation={160}
        aberrationIntensity={2}
        elasticity={0.32}
        cornerRadius={80}
        overLight={true}
        mode="standard"
        onClick={!disabled ? onClick : undefined}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
        }}
      >
        <span style={{
          fontWeight: 600,
          fontSize: 13,
          color: "var(--liquid-primary)",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {children}
        </span>
      </LiquidGlass>
    </div>
  );
}