"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  label: string;
  previewUrl?: string | null;
  fallback?: React.ReactNode;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  hint?: string;
  shape?: "circle" | "banner";
}

export default function ImageUpload({
  label,
  previewUrl,
  fallback,
  onFileSelect,
  disabled = false,
  hint = "JPEG, PNG, WebP, or GIF · max 2 MB",
  shape = "circle",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? previewUrl ?? null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const previewClass =
    shape === "banner"
      ? "w-full h-28 sm:h-36 rounded-xl object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
      : "w-16 h-16 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700";

  const fallbackClass =
    shape === "banner"
      ? "w-full h-28 sm:h-36 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-2xl ring-2 ring-dashed ring-neutral-300 dark:ring-neutral-600"
      : "w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-2xl ring-2 ring-dashed ring-neutral-300 dark:ring-neutral-600";

  const overlayClass =
    shape === "banner"
      ? "absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
      : "absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium";

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className={shape === "banner" ? "space-y-2" : "flex items-center gap-4"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={`relative group shrink-0 disabled:opacity-50 ${shape === "banner" ? "w-full" : ""}`}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Preview"
              className={previewClass}
            />
          ) : (
            fallback ?? (
              <div className={fallbackClass}>
                +
              </div>
            )
          )}
          <span className={overlayClass}>
            Change
          </span>
        </button>
        <div className="text-xs text-neutral-500">
          <p>Click to upload an image</p>
          <p className="mt-0.5 text-neutral-400">{hint}</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
