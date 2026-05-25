import { createClient } from "@/lib/supabase-client";

export const AVATAR_BUCKET = "avatars";
export const COMMUNITY_ICON_BUCKET = "community-icons";
export const COMMUNITY_BANNER_BUCKET = "community-banners";
export const POST_IMAGE_BUCKET = "post-images";
export const PROJECT_IMAGE_BUCKET = "project-images";

const MAX_POST_IMAGES = 10;

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForType(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function uploadImage(
  bucket: string,
  path: string,
  file: File,
  maxBytes = MAX_BYTES,
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use JPEG, PNG, WebP, or GIF");
  }
  if (file.size > maxBytes) {
    throw new Error(`Image must be under ${Math.round(maxBytes / (1024 * 1024))} MB`);
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error("Storage is not configured");
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function uploadAvatar(supabaseUserId: string, file: File): Promise<string> {
  const path = `${supabaseUserId}/avatar.${extForType(file.type)}`;
  return uploadImage(AVATAR_BUCKET, path, file);
}

export async function uploadCommunityIcon(slug: string, file: File): Promise<string> {
  const path = `${slug}/icon.${extForType(file.type)}`;
  return uploadImage(COMMUNITY_ICON_BUCKET, path, file);
}

export async function uploadCommunityBanner(slug: string, file: File): Promise<string> {
  const path = `${slug}/banner.${extForType(file.type)}`;
  return uploadImage(COMMUNITY_BANNER_BUCKET, path, file, 5 * 1024 * 1024);
}

export async function uploadPostImage(postId: string, index: number, file: File): Promise<string> {
  const path = `${postId}/${index}.${extForType(file.type)}`;
  return uploadImage(POST_IMAGE_BUCKET, path, file, 5 * 1024 * 1024);
}

export async function uploadProjectImage(projectId: string, index: number, file: File): Promise<string> {
  const path = `${projectId}/${index}.${extForType(file.type)}`;
  return uploadImage(PROJECT_IMAGE_BUCKET, path, file, 5 * 1024 * 1024);
}

export { MAX_POST_IMAGES };
