import React from "react";
import { useDropzone } from "react-dropzone";

/**
 * UploadBox — NO GlassPanel wrapper.
 *
 * Root cause of the file-manager-on-mode-click bug:
 *   getRootProps() injects onClick that opens the file dialog.
 *   When this was spread onto a div wrapping GlassPanel, ANY click
 *   anywhere inside that div (including the Mode select) triggered it.
 *
 * Fix: getRootProps() goes on the innermost visual box only.
 *   The outer div is a plain layout container with NO event handlers.
 *   Only clicking inside the dashed box opens the file dialog.
 */
export default function UploadBox({ onUpload }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "audio/wav": [".wav"],
      "audio/mpeg": [".mp3"],
      "audio/aac": [".aac"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.length > 0) onUpload(acceptedFiles[0]);
    },
  });

  return (
    // Outer div: pure layout, zero event handlers
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      {/* Inner div: owns ALL dropzone events, visually styled */}
      <div
        {...getRootProps()}
        style={{
          padding: "36px 24px",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 16,
          border: isDragActive
            ? "2px solid var(--liquid-primary)"
            : "2px dashed rgba(29, 78, 216, 0.35)",
          background: isDragActive
            ? "rgba(29, 78, 216, 0.08)"
            : "rgba(210, 228, 245, 0.38)",
          transition: "all 0.2s ease",
          userSelect: "none",
        }}
      >
        <input {...getInputProps()} />
        <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-main)" }}>
          {isDragActive ? "Drop it! 🎯" : "Drag & Drop audio here"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Supports .wav, .mp3, .aac
        </p>
      </div>
    </div>
  );
}