// API 클라이언트 유틸리티

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 토큰 관리
export const tokenManager = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  },
};

// API 요청 헬퍼
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = tokenManager.get();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || '요청 처리 중 오류가 발생했습니다.',
      };
    }

    return { data };
  } catch (error: any) {
    console.error('API request error:', error);
    return {
      error: error.message || '네트워크 오류가 발생했습니다.',
    };
  }
}

// Auth API
export const authApi = {
  signup: async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'mentee' | 'mentor' | 'admin';
    locale: string;
  }) => {
    const response = await apiRequest<{ user: any; token: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    if (response.data?.token) {
      tokenManager.set(response.data.token);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{ user: any; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (response.data?.token) {
      tokenManager.set(response.data.token);
    }
    
    return response;
  },

  logout: () => {
    tokenManager.remove();
  },

  getCurrentUser: async () => {
    const token = tokenManager.get();
    if (!token) return null;
    
    try {
      // 서버에서 실제 사용자 정보 가져오기
      const response = await apiRequest<{ user: any }>('/api/auth/me');
      if (response.data?.user) {
        return response.data.user;
      }
      // 토큰이 유효하지 않으면 제거
      tokenManager.remove();
      return null;
    } catch {
      tokenManager.remove();
      return null;
    }
  },
};

// Mentors API
export const mentorsApi = {
  getAll: async (params?: {
    category?: string;
    location?: string;
    specialty?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.specialty) queryParams.append('specialty', params.specialty);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest<{ mentors: any[]; pagination: any }>(
      `/api/mentors?${queryParams.toString()}`
    );
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/api/mentors/${id}`);
  },
};

// Admin API
export const adminApi = {
  getStats: async (period: 'all' | 'day' | 'month' | 'year' = 'all') => {
    return apiRequest<any>(`/api/admin/stats?period=${period}`);
  },

  getUsers: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest<{ users: any[]; pagination: any }>(
      `/api/admin/users?${queryParams.toString()}`
    );
  },
};

