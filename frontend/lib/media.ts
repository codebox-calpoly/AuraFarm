/** Heuristic: remote Supabase URLs and local file paths for video uploads */
export function isVideoUrl(uri: string): boolean {
  if (!uri?.trim()) return false;
  const path = uri.split("?")[0].toLowerCase();
  return /\.(mp4|mov|m4v|webm|mkv)(\?|$)/.test(path);
}
