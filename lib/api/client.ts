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
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
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
    
    // 회원가입 시 토큰 저장하지 않음 (자동 로그인 방지)
    // if (response.data?.token) {
    //   tokenManager.set(response.data.token);
    // }
    
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

  updateProfile: async (data: {
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    phone?: string;
    address?: string;
    currentPassword?: string;
    newPassword?: string;
    languages?: string[];
    locale?: string;
  }) => {
    return apiRequest<{ user: any }>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  switchRole: async (targetRole: "mentee" | "mentor") => {
    const response = await apiRequest<{ user: any; token: string }>("/api/auth/switch-role", {
      method: "POST",
      body: JSON.stringify({ targetRole }),
    });

    if (response.data?.token) {
      tokenManager.set(response.data.token);
    }

    return response;
  },
};

export const contentApi = {
  getLecture: (id: string) => apiRequest<any>(`/api/lectures/${id}`),
  getCommunity: (id: string) => apiRequest<any>(`/api/community/${id}`),
  getFreelancer: (id: string) => apiRequest<any>(`/api/freelancers/${id}`),
  joinCommunity: (id: string) =>
    apiRequest<any>(`/api/community/${id}/join`, {
      method: "POST",
    }),
  applyFreelancer: (id: string) =>
    apiRequest<any>(`/api/freelancers/${id}/apply`, {
      method: "POST",
    }),
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

  getMine: async () => {
    return apiRequest<{ mentor: any | null }>("/api/mentors/me");
  },

  apply: async (payload: {
    title: string;
    location: string;
    bio: string;
    languages?: string[];
    specialties?: string[];
    price?: number | string;
    availability?: string;
    photo?: string;
  }) => {
    return apiRequest<any>("/api/mentors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const lecturesApi = {
  getMine: async () => {
    return apiRequest<{ lectures: any[] }>("/api/lectures?mine=1");
  },
  create: async (payload: {
    title: string;
    type: "online" | "offline";
    category: string;
    price: number;
    duration: string;
    description: string;
    image?: string;
  }) => {
    return apiRequest<any>("/api/lectures", {
      method: "POST",
      body: JSON.stringify(payload),
    });
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
  getUserDetail: async (userId: string) => {
    return apiRequest<any>(`/api/admin/users/${userId}`);
  },
  createAdminUser: async (payload: {
    email: string;
    name: string;
    password: string;
    locale?: 'kr' | 'en' | 'mn';
  }) => {
    return apiRequest<any>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  resetUserPassword: async (payload: { userId: string; newPassword: string }) => {
    return apiRequest<any>('/api/admin/users', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getModerationQueue: async () => {
    return apiRequest<any>("/api/admin/moderation");
  },
  updateModerationStatus: async (payload: {
    type: "community" | "freelancer" | "mentor";
    id: string;
    status: string;
  }) => {
    return apiRequest<any>("/api/admin/moderation", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const enrollmentApi = {
  getMine: async () => {
    return apiRequest<{ enrollments: any[] }>("/api/enrollments");
  },
  create: async (lectureId: string) => {
    return apiRequest<{ enrollment: any }>("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ lectureId }),
    });
  },
  updateStatus: async (
    enrollmentId: string,
    status: "active" | "completed" | "cancelled"
  ) => {
    return apiRequest<{ enrollment: any }>(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export const sessionApi = {
  getMine: async () => {
    return apiRequest<{ sessions: any[] }>("/api/sessions");
  },
  create: async (payload: {
    mentorId: string;
    date: string;
    duration?: number;
    type?: "online" | "offline";
    notes?: string;
  }) => {
    return apiRequest<{ session: any }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateStatus: async (
    sessionId: string,
    status: "upcoming" | "completed" | "cancelled"
  ) => {
    return apiRequest<{ session: any }>(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export const communityApi = {
  getMyMemberships: async () => {
    return apiRequest<{ memberships: any[] }>("/api/community-memberships");
  },
};

export const freelancerApi = {
  getMyApplications: async () => {
    return apiRequest<{ applications: any[] }>("/api/freelancer-applications");
  },
};

export const inquiryApi = {
  list: async () => {
    return apiRequest<{ inquiries: any[] }>("/api/inquiries");
  },
  create: async (payload: { subject: string; body: string }) => {
    return apiRequest<{ inquiry: any }>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: { subject?: string; body?: string }) => {
    return apiRequest<{ inquiry: any }>(`/api/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ ok: boolean }>(`/api/inquiries/${id}`, {
      method: "DELETE",
    });
  },
};

