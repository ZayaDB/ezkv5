import { trError } from "@/lib/i18n/runtime";
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
            trError("emailNotConfirmed"),
        };
      }
      if (msg.includes("invalid login credentials")) {
        return {
          success: false as const,
          error:
            trError("invalidCredentials"),
        };
      }
      return { success: false as const, error: error.message || trError("loginFailed") };
    }

    const user = await fetchProfile(data.user.id);
    if (!user) {
      return {
        success: false as const,
        error:
          trError("profileMissing"),
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
      return { success: false as const, error: error.message || trError("signupFailed") };
    }

    if (!data.user) {
      return { success: false as const, error: trError("signupFailed") };
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
      message: trError("signupComplete"),
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
      return { success: false as const, error: trError("authRequired") };
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
      return { success: false as const, error: trError("profileLoadFailed") };
    }

    return { success: true as const, user };
  },
};
