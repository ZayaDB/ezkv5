import { trError } from "@/lib/i18n/runtime";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 3 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadPublicImage(
  file: File
): Promise<{ data: { url: string } } | { error: string }> {
  if (file.size > MAX_BYTES) {
    return { error: trError("fileTooLarge") };
  }

  const lowerName = file.name.toLowerCase();
  if (file.type === "image/svg+xml" || lowerName.endsWith(".svg")) {
    return { error: trError("svgNotAllowed") };
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return { error: trError("imageTypeNotAllowed") };
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: trError("loginRequired") };
  }

  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    return { error: error.message || trError("uploadFailed") };
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(path);
  if (!data.publicUrl) {
    return { error: trError("uploadFailed") };
  }
  return { data: { url: data.publicUrl } };
}
