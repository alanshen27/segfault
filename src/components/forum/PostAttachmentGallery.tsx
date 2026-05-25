"use client";

import { type ForumPostAttachment } from "@/lib/types";

interface PostAttachmentGalleryProps {
  attachments: ForumPostAttachment[];
}

export default function PostAttachmentGallery({ attachments }: PostAttachmentGalleryProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-5 pt-5">
      <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
        Attached photos ({attachments.length})
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 hover:opacity-90 transition-opacity"
            >
              <img
                src={attachment.url}
                alt=""
                className="w-full max-h-96 object-contain bg-black/20"
                loading="lazy"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
