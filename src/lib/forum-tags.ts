import { prisma } from "@/lib/prisma";
import { DEFAULT_FORUM_TAGS } from "@/lib/forum-tag-constants";

export { TAG_COLOR_PRESETS, slugifyTag, pickTagColor } from "@/lib/forum-tag-constants";

export async function ensureDefaultTags(subredditId: string) {
  for (const tag of DEFAULT_FORUM_TAGS) {
    await prisma.forumTag.upsert({
      where: {
        subredditId_slug: { subredditId, slug: tag.slug },
      },
      create: {
        subredditId,
        slug: tag.slug,
        name: tag.name,
        color: tag.color,
      },
      update: {},
    });
  }
}

export async function resolveTagForPost(subredditId: string, tagSlug: string) {
  await ensureDefaultTags(subredditId);
  return prisma.forumTag.findUnique({
    where: { subredditId_slug: { subredditId, slug: tagSlug } },
  });
}
