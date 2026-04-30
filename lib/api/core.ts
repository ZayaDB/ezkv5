export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const tokenManager = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },
  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },
  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },
};

export const authToken = {
  get: tokenManager.get,
  set: tokenManager.set,
  remove: tokenManager.remove,
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = tokenManager.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) return { error: data.error || "요청 처리 중 오류가 발생했습니다." };
    return { data };
  } catch (error: any) {
    console.error("API request error:", error);
    return { error: error.message || "네트워크 오류가 발생했습니다." };
  }
}

