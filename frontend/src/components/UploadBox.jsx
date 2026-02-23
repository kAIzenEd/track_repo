import React from "react";
import { useDropzone } from "react-dropzone";

export default function UploadBox({ onUpload }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/wav": [".wav"],
      "audio/mpeg": [".mp3"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
  });

  return (
    <div {...getRootProps()} className="upload-box" role="button">
      <input {...getInputProps()} />
      <p style={{ fontSize: 16, fontWeight: 700 }}>Drag & Drop audio here</p>
      <p style={{ fontSize: 13, color: "#666" }}>Supports .wav and .mp3 — or click to browse</p>
    </div>
  );
}
