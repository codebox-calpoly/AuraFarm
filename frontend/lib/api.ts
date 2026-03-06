import Constants from "expo-constants";
import { getSession } from "@/lib/auth";

type ApiOk<T> = { success: true; data: T; message?: string };
type ApiErr = { success: false; error?: string; message?: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export type Challenge = {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  difficulty: string;
  pointsReward: number;
  createdAt: string;
};

function apiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as Record<string, any> | undefined;
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    extra?.apiUrl ??
    "http://localhost:3000"
  );
}

async function authHeader(): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session?.accessToken) return {};
  return { Authorization: `Bearer ${session.accessToken}` };
}

export async function getChallenges(): Promise<ApiResponse<Challenge[]>> {
  const res = await fetch(`${apiBaseUrl()}/api/challenges`);
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? json?.message ?? `Request failed (${res.status})`,
    };
  }
  return json;
}

export async function submitCompletion(input: {
  challengeId: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  caption?: string;
}): Promise<ApiResponse<{ id: number }>> {
  const headers = await authHeader();
  if (!headers.Authorization) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${apiBaseUrl()}/api/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? json?.message ?? `Request failed (${res.status})`,
    };
  }

  return json;
}

