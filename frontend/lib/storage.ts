import { apiBaseUrl } from "@/lib/api";
import { getValidSession } from "@/lib/auth";

function mimeForExtension(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

export async function uploadCompletionImage(localUri: string): Promise<string | null> {
  const session = await getValidSession();
  if (!session?.accessToken) {
    console.warn("[storage] No session – cannot upload image");
    return null;
  }

  try {
    const ext = localUri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
    const mime = mimeForExtension(ext);

    // React Native: `fetch(fileUri).blob()` often yields an empty blob for library / ph://
    // URIs, which produced 0-byte Supabase objects. Append the file reference instead.
    const formData = new FormData();
    formData.append("image", {
      uri: localUri,
      name: `photo.${ext}`,
      type: mime,
    } as unknown as Blob);

    const res = await fetch(`${apiBaseUrl()}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      console.warn("[storage] Upload failed:", json?.error ?? res.status);
      return null;
    }

    return json.data.imageUrl;
  } catch (err) {
    console.warn("[storage] Upload exception:", err);
    return null;
  }
}
