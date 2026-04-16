import Constants from "expo-constants";
import axios from "axios";
import { getValidSession, refreshSession } from "@/lib/auth";

type ApiOk<T> = { success: true; data: T; message?: string };
type ApiErr = { success: false; error?: string; message?: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export type Challenge = {
  id: number;
  title: string;
  description: string;
  photoGuidelines?: string;
  latitude: number;
  longitude: number;
  difficulty: string;
  pointsReward: number;
  createdAt: string;
};

export type UserProfile = {
  id: number;
  name: string;
  auraPoints: number;
  streak: number;
  completionsCount: number;
  rank?: number;
};

export type UserCompletion = {
  id: number;
  userId: number;
  challengeId: number;
  latitude: number;
  longitude: number;
  imageUri?: string | null;
  imageUrl?: string | null;
  caption?: string | null;
  completedAt: string;
  challenge: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    pointsReward: number;
  };
};

export type FeedCompletion = {
  id: number;
  userId: number;
  challengeId: number;
  latitude: number;
  longitude: number;
  imageUri?: string | null;
  imageUrl?: string | null;
  caption?: string | null;
  completedAt: string;
  likes?: number;
  user: {
    id: number;
    name: string | null;
  };
  challenge: {
    id: number;
    title: string;
    pointsReward: number;
  };
};

export function apiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as Record<string, any> | undefined;
  const envUrl = process.env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl;
  if (envUrl) return envUrl;
  const hostUri: string | undefined =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }
  return "http://localhost:3000";
}

async function authHeader(): Promise<Record<string, string>> {
  const session = await getValidSession();
  if (!session?.accessToken) return {};
  return { Authorization: `Bearer ${session.accessToken}` };
}

async function getUserIdFromSession(): Promise<number | null> {
  const session = await getValidSession();
  if (!session?.userId) return null;
  return typeof session.userId === "number"
    ? session.userId
    : parseInt(String(session.userId), 10) || null;
}

async function authedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await authHeader();
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });
  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed?.accessToken) {
      return fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${refreshed.accessToken}`,
          ...(options.headers as Record<string, string> ?? {}),
        },
      });
    }
  }
  return res;
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
  const session = await getValidSession();
  if (!session?.accessToken) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await authedFetch(`${apiBaseUrl()}/api/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export async function getUserProfileFromApi(): Promise<
  ApiResponse<UserProfile>
> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { success: false, error: "No user in session" };
  }

  const res = await fetch(`${apiBaseUrl()}/api/users/${userId}`);
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? json?.message ?? `Request failed (${res.status})`,
    };
  }
  return json;
}

export async function getUserCompletionsFromApi(): Promise<
  ApiResponse<UserCompletion[]>
> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { success: false, error: "No user in session" };
  }

  const res = await fetch(`${apiBaseUrl()}/api/users/${userId}/completions`);
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? json?.message ?? `Request failed (${res.status})`,
    };
  }
  return json;
}

export async function getFeedCompletionsFromApi(): Promise<
  ApiResponse<FeedCompletion[]>
> {
  const res = await fetch(`${apiBaseUrl()}/api/completions?limit=20`);
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? json?.message ?? `Request failed (${res.status})`,
    };
  }
  return json;
}

export type LeaderboardEntry = {
  userId: number;
  userName: string;
  auraPoints: number;
  streak: number;
  completionsCount: number;
  rank: number;
};

export async function getLeaderboardFromApi(limit = 50): Promise<ApiResponse<LeaderboardEntry[]>> {
  const res = await fetch(`${apiBaseUrl()}/api/leaderboard?limit=${limit}`);
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json?.error ?? json?.message ?? `Request failed (${res.status})`,
    };
  }
  return json;
}

export async function likeCompletion(completionId: number): Promise<ApiResponse<{ likes: number }>> {
  const res = await authedFetch(`${apiBaseUrl()}/api/completions/${completionId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export async function changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<unknown>> {
  const session = await getValidSession();
  if (!session?.accessToken) {
    return { success: false, error: "Not authenticated" };
  }
  const res = await authedFetch(`${apiBaseUrl()}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
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

export async function flagCompletion(completionId: number, reason?: string): Promise<ApiResponse<unknown>> {
  const res = await authedFetch(`${apiBaseUrl()}/api/flags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completionId, reason: reason ?? null }),
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

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: number; email: string; name: string; auraPoints?: number; streak?: number };
};

async function authFetch<T>(
  path: string,
  body: object
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${apiBaseUrl()}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json?.error ?? json?.message ?? "Request failed",
      };
    }
    return json;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return {
      success: false,
      error: msg.includes("fetch") || msg.includes("network")
        ? "Cannot reach server. Make sure the backend is running and you're on the same network."
        : msg,
    };
  }
}

export async function apiSignUp(input: {
  email: string;
  password: string;
  username: string;
}): Promise<ApiResponse<{ id: number; email: string; name: string }>> {
  return authFetch("signup", input);
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<ApiResponse<AuthSession>> {
  return authFetch("login", input);
}

export async function apiVerify(input: {
  email: string;
  token: string;
}): Promise<ApiResponse<AuthSession>> {
  return authFetch("verify", input);
}

export async function apiResend(email: string): Promise<ApiResponse<{ message: string }>> {
  return authFetch("resend", { email });
}

export async function apiForgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  return authFetch("forgot-password", { email });
}

const apiClient = axios.create();

apiClient.interceptors.request.use(async (config) => {
  // Resolve on each request so device LAN / Metro host is correct (import-time URL is often localhost).
  config.baseURL = `${apiBaseUrl()}/api`;
  const session = await getValidSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

export default apiClient;
