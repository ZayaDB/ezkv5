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
    return { error: "파일이 너무 큽니다. (최대 3MB)" };
  }

  const lowerName = file.name.toLowerCase();
  if (file.type === "image/svg+xml" || lowerName.endsWith(".svg")) {
    return { error: "SVG 파일은 허용되지 않습니다." };
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return { error: "jpeg, png, webp, gif 이미지만 업로드할 수 있습니다." };
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: "로그인이 필요합니다." };
  }

  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    return { error: error.message || "업로드에 실패했습니다." };
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(path);
  if (!data.publicUrl) {
    return { error: "업로드에 실패했습니다." };
  }
  return { data: { url: data.publicUrl } };
}
