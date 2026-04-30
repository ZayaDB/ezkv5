// API 클라이언트 유틸리티
import { API_BASE_URL, apiRequest, authToken } from "./core";

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
    //   authToken.set(response.data.token);
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
      authToken.set(response.data.token);
    }
    
    return response;
  },

  logout: () => {
    authToken.remove();
  },

  getCurrentUser: async () => {
    const token = authToken.get();
    if (!token) return null;
    
    try {
      // 서버에서 실제 사용자 정보 가져오기
      const response = await apiRequest<{ user: any }>('/api/auth/me');
      if (response.data?.user) {
        return response.data.user;
      }
      // 토큰이 유효하지 않으면 제거
      authToken.remove();
      return null;
    } catch {
      authToken.remove();
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
      authToken.set(response.data.token);
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
    sessionDuration?: number;
    sessionFormat?: "online" | "offline" | "both";
    yearsOfExperience?: number;
    education?: string;
    careerSummary?: string;
    responseTime?: string;
    timezone?: string;
    introVideoUrl?: string;
    portfolioLinks?: string[];
    mentoringStyle?: string;
    recommendedFor?: string;
    notRecommendedFor?: string;
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
  getById: async (id: string) => {
    return apiRequest<any>(`/api/lectures/${id}`);
  },
  create: async (payload: {
    title: string;
    type: "online" | "offline";
    category: string;
    price: number;
    duration: string;
    description: string;
    image?: string;
    shortDescription?: string;
    targetAudience?: string;
    prerequisites?: string;
    whatYouWillLearn?: string[];
    curriculum?: string[];
    totalLessons?: number;
    totalHours?: number;
    difficulty?: "beginner" | "intermediate" | "advanced";
    maxStudents?: number;
    language?: string;
    previewVideoUrl?: string;
    materialsIncluded?: string[];
    faq?: string[];
  }) => {
    return apiRequest<any>("/api/lectures", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update: async (
    id: string,
    payload: {
      title: string;
      type: "online" | "offline";
      category: string;
      price: number;
      duration: string;
      description: string;
      image?: string;
      shortDescription?: string;
      targetAudience?: string;
      prerequisites?: string;
      whatYouWillLearn?: string[];
      curriculum?: string[];
      totalLessons?: number;
      totalHours?: number;
      difficulty?: "beginner" | "intermediate" | "advanced";
      maxStudents?: number;
      language?: string;
      previewVideoUrl?: string;
      materialsIncluded?: string[];
      faq?: string[];
    }
  ) => {
    return apiRequest<any>(`/api/lectures/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  uploadImage: async (file: File) => {
    const token = authToken.get();
    const fd = new FormData();
    fd.append("file", file);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/upload/feed`, {
      method: "POST",
      headers,
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "업로드 실패" } as const;
    return { data: { url: data.url as string } };
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
  getChannelPosts: async (limit?: number) => {
    const q = limit ? `?limit=${limit}` : "";
    return apiRequest<{ posts: any[] }>(`/api/admin/channel-posts${q}`);
  },
  deleteChannelPost: async (postId: string, reason: string) => {
    return apiRequest<{ ok?: boolean; error?: string }>(`/api/admin/channel-posts/${postId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });
  },
  listInquiries: async () => {
    return apiRequest<{ inquiries: any[] }>("/api/admin/inquiries");
  },
  replyInquiry: async (id: string, adminReply: string) => {
    return apiRequest<{ inquiry: any }>(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ adminReply }),
    });
  },
};

export const notificationsApi = {
  list: async () => {
    return apiRequest<{
      notifications: {
        id: string;
        kind: string;
        body: string;
        readAt: string | null;
        createdAt: string;
        meta: { postTitle?: string; channelType?: string; channelId?: string };
      }[];
      unreadCount: number;
    }>("/api/me/notifications");
  },
  markRead: async (payload: { all?: boolean; ids?: string[] }) => {
    return apiRequest<{ ok: boolean; modified?: number }>("/api/me/notifications", {
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

export type ChannelFeedKind = "community" | "freelancer";

export type PublicFeedKind = "community" | "freelancer";

export const publicFeedApi = {
  list: async (feed: PublicFeedKind) => {
    return apiRequest<{ posts: any[] }>(`/api/feed/${feed}`);
  },
  create: async (feed: PublicFeedKind, payload: { body: string; attachmentUrls?: string[] }) => {
    return apiRequest<{ post?: { id: string }; error?: string }>(`/api/feed/${feed}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listComments: async (feed: PublicFeedKind, postId: string) => {
    return apiRequest<{ comments: any[] }>(`/api/feed/${feed}/${postId}/comments`);
  },
  addComment: async (feed: PublicFeedKind, postId: string, body: string) => {
    return apiRequest<{ ok?: boolean; error?: string }>(`/api/feed/${feed}/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },
  toggleLike: async (feed: PublicFeedKind, postId: string) => {
    return apiRequest<{ likeCount: number; likedByMe: boolean }>(`/api/feed/${feed}/${postId}/like`, {
      method: "POST",
    });
  },
  uploadFile: async (file: File) => {
    const token = authToken.get();
    const fd = new FormData();
    fd.append("file", file);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/upload/feed`, {
      method: "POST",
      headers,
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "업로드 실패" } as const;
    return { data: { url: data.url as string } };
  },
};

export const channelFeedApi = {
  listPosts: async (channel: ChannelFeedKind, channelId: string) => {
    const base =
      channel === "community"
        ? `/api/community/${channelId}/posts`
        : `/api/freelancers/${channelId}/posts`;
    return apiRequest<{ posts: any[] }>(base);
  },
  createPost: async (
    channel: ChannelFeedKind,
    channelId: string,
    payload: { title: string; body: string }
  ) => {
    const base =
      channel === "community"
        ? `/api/community/${channelId}/posts`
        : `/api/freelancers/${channelId}/posts`;
    return apiRequest<{ post?: { id: string }; error?: string }>(base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listComments: async (
    channel: ChannelFeedKind,
    channelId: string,
    postId: string
  ) => {
    const base =
      channel === "community"
        ? `/api/community/${channelId}/posts/${postId}/comments`
        : `/api/freelancers/${channelId}/posts/${postId}/comments`;
    return apiRequest<{ comments: any[] }>(base);
  },
  addComment: async (
    channel: ChannelFeedKind,
    channelId: string,
    postId: string,
    body: string
  ) => {
    const base =
      channel === "community"
        ? `/api/community/${channelId}/posts/${postId}/comments`
        : `/api/freelancers/${channelId}/posts/${postId}/comments`;
    return apiRequest<{ ok?: boolean; error?: string }>(base, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },
};

export const myActivityApi = {
  getContexts: async () => {
    return apiRequest<{
      community: { id: string; name: string }[];
      freelancers: { id: string; name: string }[];
    }>("/api/my-activity/contexts");
  },
};

export type LifeBudgetKind = "expense" | "income";
export type LifeRecurrenceType = "none" | "weekly" | "biweekly" | "monthly";
export type LifeEventCategory = "personal" | "work" | "health" | "parttime" | "other";
export type LifeEventStatus = "planned" | "completed" | "cancelled";

export type LifeRecurrence = {
  type: LifeRecurrenceType;
  interval?: number;
  until?: string | null;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
};

export type LifeBudgetLine = {
  id: string;
  kind: LifeBudgetKind;
  label: string;
  amount: number;
  date: string;
  recurrence: LifeRecurrence;
};

export type LifeBudgetOccurrence = {
  id: string;
  sourceId: string;
  kind: LifeBudgetKind;
  label: string;
  amount: number;
  date: string;
  recurrence: LifeRecurrence;
};

export type LifeEvent = {
  id: string;
  sourceId?: string;
  title: string;
  notes: string;
  startsAt: string;
  endsAt?: string | null;
  category: LifeEventCategory;
  status: LifeEventStatus;
  recurrence: LifeRecurrence;
};

export const lifePlanApi = {
  getBudgetLines: async (params?: { fromIso?: string; toIso?: string }) => {
    const q = new URLSearchParams();
    if (params?.fromIso) q.set("from", params.fromIso);
    if (params?.toIso) q.set("to", params.toIso);
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return apiRequest<{
      lines: LifeBudgetLine[];
      occurrences: LifeBudgetOccurrence[];
    }>(`/api/me/life-budget${suffix}`);
  },
  addBudgetLine: async (payload: {
    kind: LifeBudgetKind;
    label: string;
    amount: number;
    date: string;
    recurrence?: LifeRecurrence;
  }) => {
    return apiRequest<{ line: LifeBudgetLine }>(
      "/api/me/life-budget",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },
  deleteBudgetLine: async (id: string) => {
    return apiRequest<{ ok: boolean }>(`/api/me/life-budget/${id}`, { method: "DELETE" });
  },
  updateBudgetLine: async (
    id: string,
    payload: { kind: LifeBudgetKind; label: string; amount: number; date: string; recurrence?: LifeRecurrence }
  ) => {
    return apiRequest<{ line: LifeBudgetLine }>(
      `/api/me/life-budget/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
  },
  getLifeEvents: async (fromIso: string, toIso: string) => {
    const q = `from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`;
    return apiRequest<{ events: LifeEvent[] }>(`/api/me/life-events?${q}`);
  },
  addLifeEvent: async (payload: {
    title: string;
    startsAt: string;
    endsAt?: string | null;
    notes?: string;
    category?: LifeEventCategory;
    status?: LifeEventStatus;
    recurrence?: LifeRecurrence;
  }) => {
    return apiRequest<{ event: LifeEvent }>(
      "/api/me/life-events",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },
  updateLifeEvent: async (
    id: string,
    payload: {
      title: string;
      startsAt: string;
      endsAt?: string | null;
      notes?: string;
      category?: LifeEventCategory;
      status?: LifeEventStatus;
      recurrence?: LifeRecurrence;
    }
  ) => {
    return apiRequest<{ event: LifeEvent }>(`/api/me/life-events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteLifeEvent: async (id: string) => {
    return apiRequest<{ ok: boolean }>(`/api/me/life-events/${id}`, { method: "DELETE" });
  },
};

export const lectureWishlistApi = {
  list: async () => {
    return apiRequest<{ wishlist: { id: string; lectureId: string; lecture: any }[] }>("/api/me/wishlist");
  },
  add: async (lectureId: string) => {
    return apiRequest<{ ok: boolean }>("/api/me/wishlist", {
      method: "POST",
      body: JSON.stringify({ lectureId }),
    });
  },
  remove: async (lectureId: string) => {
    return apiRequest<{ ok: boolean }>(`/api/me/wishlist/${lectureId}`, {
      method: "DELETE",
    });
  },
};

