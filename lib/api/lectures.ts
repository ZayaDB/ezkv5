/** 강의 마켓 — Supabase */

export const lecturesApi = {
  getMine: async () => {
    try {
      const { getMyLectures } = await import("@/lib/supabase/lectures");
      const data = await getMyLectures();
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "강의 목록을 불러오지 못했습니다." };
    }
  },
  getById: async (id: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { getApprovedLectureById, getLectureByIdForOwner } = await import("@/lib/supabase/lectures");
      const supabase = createClient();
      const approved = await getApprovedLectureById(supabase, id);
      if (approved) return { data: approved };
      const own = await getLectureByIdForOwner(id);
      if (own) return { data: own };
      return { error: "강의를 찾을 수 없습니다." };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "강의를 불러오지 못했습니다." };
    }
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
    try {
      const { createLecture } = await import("@/lib/supabase/lectures");
      const data = await createLecture(payload);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "강의 등록에 실패했습니다." };
    }
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
    try {
      const { updateLecture } = await import("@/lib/supabase/lectures");
      const data = await updateLecture(id, payload);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "강의 수정에 실패했습니다." };
    }
  },
  uploadImage: async (file: File) => {
    const { uploadPublicImage } = await import("@/lib/supabase/storage");
    return uploadPublicImage(file);
  },
};

export const lectureWishlistApi = {
  list: async () => {
    try {
      const { listWishlist } = await import("@/lib/supabase/wishlist");
      const wishlist = await listWishlist();
      return { data: { wishlist } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "찜 목록 조회 실패" };
    }
  },
  add: async (lectureId: string) => {
    try {
      const { addToWishlist } = await import("@/lib/supabase/wishlist");
      const data = await addToWishlist(lectureId);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "찜 추가 실패" };
    }
  },
  remove: async (lectureId: string) => {
    try {
      const { removeFromWishlist } = await import("@/lib/supabase/wishlist");
      const data = await removeFromWishlist(lectureId);
      return { data };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "찜 삭제 실패" };
    }
  },
};
