/**
 * GlassPanel — pure CSS glassmorphism. No third-party library.
 *
 * Why NOT LiquidGlass here:
 *   LiquidGlass uses internal absolute/fixed sizing and SVG filter layers
 *   that fight with CSS grid and flexbox. Layout containers must obey the
 *   normal box model. LiquidGlass belongs on small interactive controls only.
 *
 *   This is architecturally correct: even Apple uses liquid glass on
 *   interactive controls (buttons, pills), not on content panels.
 */
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function GlassPanel({
  children,
  className = "",
  style = {},
  animate = true,
  variant,       // accepted for API compat, unused
  mouseContainer,// accepted for API compat, unused
  ...props
}) {
  const Wrapper = animate ? motion.div : "div";
  const motionProps = animate
    ? { initial: "hidden", animate: "visible", variants: fadeUp, transition: { duration: 0.35, ease: "easeOut" } }
    : {};

  return (
    <Wrapper {...motionProps} className={`glass-panel ${className}`} style={style} {...props}>
      {children}
    </Wrapper>
  );
}