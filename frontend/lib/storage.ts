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
    case "mov":
    case "m4v":
      return "video/quicktime";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mkv":
      return "video/x-matroska";
    default:
      return "image/jpeg";
  }
}

function extForMime(mime: string): string {
  if (mime === "video/quicktime") return "mov";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  if (mime.startsWith("video/")) return "mp4";
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/**
 * Upload completion proof (photo or video) to `/api/upload`.
 * Field name stays `image` for backend compatibility.
 */
export async function uploadCompletionMedia(
  localUri: string,
  opts?: { mimeType?: string },
): Promise<string | null> {
  const session = await getValidSession();
  if (!session?.accessToken) {
    console.warn("[storage] No session – cannot upload media");
    return null;
  }

  const ext =
    localUri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  const mime = opts?.mimeType || mimeForExtension(ext);
  const safeName = `upload.${extForMime(mime)}`;

  try {
    const formData = new FormData();
    formData.append("image", {
      uri: localUri,
      name: safeName,
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

    return json.data.imageUrl as string;
  } catch (err) {
    console.warn("[storage] Upload exception:", err);
    return null;
  }
}

/** @deprecated Use `uploadCompletionMedia` */
export const uploadCompletionImage = uploadCompletionMedia;
