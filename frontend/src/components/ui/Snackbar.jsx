/**
 * Snackbar — liquid glass toast notification.
 *
 * LiquidGlass works perfectly here: fixed position, self-contained,
 * not part of any layout flow. Snackbar IS the leaf node Apple uses
 * liquid glass for — small, floating, interactive-adjacent UI.
 *
 * glassSize drives the visual pill. We use a fixed width and let
 * text be centered inside. The wrapper div handles the framer-motion
 * positioning so LiquidGlass just renders at top:50% left:50% as designed.
 */
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LiquidGlass from "liquid-glass-react";
import { supportsLiquidGlass } from "../../utils/browserSupport";

const SNACKBAR_WIDTH = 320;
const SNACKBAR_HEIGHT = 48;

export default function Snackbar({ message, visible, onHide }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  const content = (
    <span style={{
      fontWeight: 600,
      fontSize: 14,
      color: "#0f172a",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    }}>
      {message}
    </span>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="snackbar"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            pointerEvents: "none",
            // Outer wrapper: normal-flow anchor for LiquidGlass centering
            width: SNACKBAR_WIDTH,
            height: SNACKBAR_HEIGHT,
          }}
        >
          {supportsLiquidGlass ? (
            <div style={{ position: "relative", width: SNACKBAR_WIDTH, height: SNACKBAR_HEIGHT }}>
              <LiquidGlass
                glassSize={{ width: SNACKBAR_WIDTH, height: SNACKBAR_HEIGHT }}
                displacementScale={55}
                blurAmount={0.06}
                saturation={130}
                aberrationIntensity={1.5}
                elasticity={0}
                cornerRadius={100}
                overLight={true}
                mode="standard"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                }}
              >
                {content}
              </LiquidGlass>
            </div>
          ) : (
            // CSS fallback
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(20, 30, 50, 0.88)",
              borderRadius: 100,
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#fff", whiteSpace: "nowrap" }}>
                {message}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}