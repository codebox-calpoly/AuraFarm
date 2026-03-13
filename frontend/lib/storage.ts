import { apiBaseUrl } from "@/lib/api";
import { getValidSession } from "@/lib/auth";

export async function uploadCompletionImage(localUri: string): Promise<string | null> {
  const session = await getValidSession();
  if (!session?.accessToken) {
    console.warn("[storage] No session – cannot upload image");
    return null;
  }

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const ext = localUri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
    const formData = new FormData();
    formData.append("image", blob, `photo.${ext}`);

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
