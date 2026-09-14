import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/contexts/AuthContext";
import { normalizeRole } from "@/lib/auth/userRole";

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  locale: string;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  nationality?: string | null;
  university?: string | null;
  region?: string | null;
  visa_type?: string | null;
  visa_expire_date?: string | null;
  country_status?: string | null;
  onboarding_status?: string | null;
};

function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: normalizeRole(row.role),
    locale: row.locale,
    avatar: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    phone: row.phone ?? undefined,
    nationality: row.nationality ?? null,
    university: row.university ?? null,
    region: row.region ?? null,
    visaType: row.visa_type ?? null,
    visaExpireDate: row.visa_expire_date ?? null,
    countryStatus: row.country_status ?? "unknown",
    onboardingStatus: row.onboarding_status ?? "pending",
  };
}

async function fetchProfile(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}

export const supabaseAuth = {
  async login(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        return {
          success: false as const,
          error:
            "이메일 인증이 필요합니다. 메일함을 확인하거나, Supabase에서 Confirm email을 끄고 다시 가입해 주세요.",
        };
      }
      if (msg.includes("invalid login credentials")) {
        return {
          success: false as const,
          error:
            "이메일 또는 비밀번호가 맞지 않습니다. Supabase에 가입한 계정인지 확인해 주세요. (예전 Spring/Mongo 계정은 다시 가입해야 합니다.)",
        };
      }
      return { success: false as const, error: error.message || "로그인에 실패했습니다." };
    }

    const user = await fetchProfile(data.user.id);
    if (!user) {
      return {
        success: false as const,
        error:
          "로그인은 됐지만 profiles 테이블에 프로필이 없습니다. Supabase SQL Editor에서 supabase/schema.sql을 실행했는지 확인해 주세요.",
      };
    }

    return { success: true as const, user };
  },

  async signup(input: {
    email: string;
    password: string;
    name: string;
    locale: string;
    nationality?: string;
    university?: string;
    region?: string;
    residingInKorea?: boolean;
    visaType?: string;
    visaExpireDate?: string;
  }) {
    const supabase = createClient();
    const email = input.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: { data: { name: input.name.trim() } },
    });

    if (error) {
      return { success: false as const, error: error.message || "회원가입에 실패했습니다." };
    }

    if (!data.user) {
      return { success: false as const, error: "회원가입에 실패했습니다." };
    }

    const countryStatus = input.residingInKorea ? "residing_korea" : "abroad";
    const profilePatch = {
      name: input.name.trim(),
      locale: input.locale || "kr",
      nationality: input.nationality?.trim() || null,
      university: input.university?.trim() || null,
      region: input.region?.trim() || null,
      country_status: countryStatus,
      onboarding_status: "profile_complete",
      visa_type: input.residingInKorea ? input.visaType?.trim() || null : null,
      visa_expire_date: input.residingInKorea ? input.visaExpireDate || null : null,
    };

    if (data.session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profilePatch)
        .eq("id", data.user.id);

      if (profileError) {
        return { success: false as const, error: profileError.message };
      }
    }

    // Supabase는 Confirm email OFF 시 가입과 동시에 세션을 줌 → 로그인 페이지에서 직접 로그인하도록 종료
    await supabase.auth.signOut();

    return {
      success: true as const,
      message: "회원가입이 완료되었습니다. 로그인해 주세요.",
      email,
    };
  },

  async logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;
    return fetchProfile(session.user.id);
  },

  async updateProfile(data: {
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    phone?: string;
    newPassword?: string;
  }) {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false as const, error: "인증이 필요합니다." };
    }

    if (data.newPassword) {
      const { error: pwError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (pwError) {
        return { success: false as const, error: pwError.message };
      }
    }

    const patch: Record<string, string | null> = {};
    if (data.name !== undefined) patch.name = data.name.trim();
    if (data.avatar !== undefined) patch.avatar_url = data.avatar || null;
    if (data.bio !== undefined) patch.bio = data.bio || null;
    if (data.phone !== undefined) patch.phone = data.phone.trim() || null;
    if (data.location !== undefined) patch.region = data.location.trim() || null;

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", session.user.id);

      if (error) {
        return { success: false as const, error: error.message };
      }
    }

    const user = await fetchProfile(session.user.id);
    if (!user) {
      return { success: false as const, error: "프로필을 불러오지 못했습니다." };
    }

    return { success: true as const, user };
  },

  async switchRole(targetRole: "user" | "mentor") {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false as const, error: "인증이 필요합니다." };
    }

    const dbRole = targetRole === "mentor" ? "mentor" : "user";
    const { error } = await supabase
      .from("profiles")
      .update({ role: dbRole })
      .eq("id", session.user.id);

    if (error) {
      return { success: false as const, error: error.message };
    }

    const user = await fetchProfile(session.user.id);
    if (!user) {
      return { success: false as const, error: "프로필을 불러오지 못했습니다." };
    }

    return { success: true as const, user };
  },
};
