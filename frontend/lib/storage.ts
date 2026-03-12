import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

const BUCKET = "completion-images";

async function ensureSupabaseSession(): Promise<boolean> {
  const stored = await getSession();
  if (!stored?.accessToken || !stored?.refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
  });

  return !error;
}

export async function uploadCompletionImage(localUri: string): Promise<string | null> {
  const ok = await ensureSupabaseSession();
  if (!ok) return null;

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const ext = localUri.split(".").pop()?.toLowerCase() || "jpg";
    const contentType = ext === "png" ? "image/png" : "image/jpeg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, { contentType, upsert: false });

    if (error || !data?.path) return null;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl ?? null;
  } catch {
    return null;
  }
}

