import { env } from "./env";
import { authState } from "@/hooks/store/auth";
import { tokenService } from "@/lib/utils/tokenServices";

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export const buildHeaders = (options?: RequestOptions) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  const { accessToken } = authState();
  if (!options?.skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (env.apiKey) {
    headers.apikey = env.apiKey;
  }

  return headers;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { isAuthed, expiresAt, clear } = authState();
  if (!options.skipAuth && (!isAuthed() || (expiresAt && expiresAt <= Date.now() / 1000))) {
    clear();
    tokenService.clear();
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error_description || errorBody.message || "Request failed";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
