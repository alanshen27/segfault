export function serializeAttachments(
  attachments: { id: string; url: string; sortOrder: number }[],
) {
  return attachments
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => ({ id: a.id, url: a.url, sortOrder: a.sortOrder }));
}

export const attachmentInclude = {
  orderBy: { sortOrder: "asc" as const },
  select: { id: true, url: true, sortOrder: true },
};
