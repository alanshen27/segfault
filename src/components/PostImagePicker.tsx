"use client";

import { useRef, useState } from "react";
import { MAX_POST_IMAGES } from "@/lib/storage";

export interface PendingPostImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface PostImagePickerProps {
  images: PendingPostImage[];
  onChange: (images: PendingPostImage[]) => void;
  disabled?: boolean;
}

export default function PostImagePicker({
  images,
  onChange,
  disabled = false,
}: PostImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError("");

    const next = [...images];
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_POST_IMAGES) {
        setError(`You can attach up to ${MAX_POST_IMAGES} images per post`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5 MB");
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    onChange(next);
  };

  const removeImage = (id: string) => {
    const removed = images.find((img) => img.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold">Photos</label>
        <span className="text-xs text-neutral-500 tabular-nums">
          {images.length}/{MAX_POST_IMAGES}
        </span>
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        Attach images to your post. Embedded images in the body are coming later.
      </p>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((img) => (
            <li key={img.id} className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              <img
                src={img.previewUrl}
                alt=""
                className="w-full aspect-video object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 disabled:opacity-50"
                aria-label="Remove image"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {images.length < MAX_POST_IMAGES && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          + Add photos
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
