"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { GraduationCap, Save, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { mentorsApi } from "@/lib/api/client";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormError from "@/components/ui/FormError";
import MentorApprovedPanel from "@/components/profile/MentorApprovedPanel";
import type { MyMentorProfile } from "@/lib/supabase/mentors";

type TabId = "info" | "mentor";

function tabFromParam(v: string | null): TabId {
  if (v === "mentor") return "mentor";
  return "info";
}

function InfoRow({
  label,
  required,
  align = "center",
  children,
}: {
  label: string;
  required?: boolean;
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    <div className={`flex gap-4 py-1.5 ${align === "start" ? "items-start" : "items-center"}`}>
      <span
        className={`w-28 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 ${
          align === "start" ? "pt-2" : ""
        }`}
      >
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </span>
      <div className="min-w-0 flex-1 text-sm text-slate-900 dark:text-slate-100">{children}</div>
    </div>
  );
}

function ProfilePageContent() {
  const tp = useTranslations("profilePage");
  const tProf = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser, updateProfile } = useAuth();

  const [tab, setTab] = useState<TabId>(() => tabFromParam(searchParams.get("tab")));
  const [hasLoaded, setHasLoaded] = useState(false);
  const [mentorMine, setMentorMine] = useState<MyMentorProfile | null | undefined>(undefined);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    bio: "",
    phone: "",
    address: "",
    languages: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  const loadMentorStatus = useCallback(async () => {
    try {
      const mine = await mentorsApi.getMine();
      setMentorMine(mine.data?.mentor ?? null);
    } catch {
      setMentorMine(null);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        avatar: user.avatar || "",
        bio: user.bio || "",
        phone: user.phone || "",
        address: user.address || "",
        languages: user.languages || [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setHasLoaded(false);
      return;
    }
    setHasLoaded(false);
    void loadMentorStatus();
  }, [user?.id, user?.role, loadMentorStatus]);

  const mentorApproved = Boolean(
    mentorMine && (mentorMine.approvalStatus || "approved") === "approved"
  );

  useEffect(() => {
    if (!hasLoaded) return;
    if (searchParams.get("tab") === "mentor" && !mentorApproved) {
      router.replace(`/${locale}/my/profile/apply`);
    }
  }, [hasLoaded, searchParams, mentorApproved, router, locale]);

  const roleLabel = (() => {
    const key = user?.role === "user" ? "user" : user?.role ?? "user";
    try {
      return tProf(`roles.${key}`);
    } catch {
      return key;
    }
  })();

  const handleSave = async () => {
    const nextErr = "";
    if (!formData.name.trim()) {
      setSaveError("이름은 필수입니다.");
      return;
    }
    if (formData.name.trim().length < 2 || formData.name.trim().length > 40) {
      setSaveError("이름은 2~40자로 입력해 주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      setSaveError("전화번호는 필수입니다.");
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(formData.phone.trim())) {
      setSaveError("전화번호 형식이 올바르지 않습니다.");
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setSaveError(tp("info.passwordMismatch"));
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setSaveError(tp("info.passwordTooShort"));
      return;
    }
    setSaving(true);
    setSaveError(nextErr);
    const res = await updateProfile({
      name: formData.name,
      avatar: formData.avatar,
      bio: formData.bio,
      phone: formData.phone,
      newPassword: newPassword || undefined,
    });
    if (!res.success) {
      setSaveError(res.error || "프로필 저장에 실패했습니다.");
      setSaving(false);
      return;
    }
    await refreshUser();
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsEditing(false);
    setSaving(false);
  };

  const handleAvatarUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSaveError(tp("info.avatarImageOnly"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError(tp("info.avatarTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || !user || !hasLoaded) {
    return <LoadingState message={tp("loading")} />;
  }

  const mentorDoc = mentorMine;
  const tabs: { id: TabId; label: string; icon: typeof UserIcon }[] = [
    { id: "info", label: tp("tabs.info"), icon: UserIcon },
    { id: "mentor", label: tp("tabs.mentor"), icon: GraduationCap },
  ];

  return (
    <div className="ds-page">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="py-4 flex items-center gap-4">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {user.email} · <span className="font-semibold text-primary-600">{roleLabel}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="py-5 space-y-6">
        {mentorApproved && (
          <div className="flex flex-wrap gap-2 rounded-xl bg-zinc-100 dark:bg-slate-800 p-1 ring-1 ring-zinc-200/80 dark:ring-slate-700">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  router.replace(`/${locale}/my/profile?tab=${id}`, { scroll: false });
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === id
                    ? "bg-white dark:bg-slate-700 text-zinc-900 dark:text-slate-100 shadow-sm ring-1 ring-zinc-200 dark:ring-slate-600"
                    : "text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}
        {tab === "mentor" && mentorApproved && mentorDoc && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{tp("mentor.title")}</h2>
            <MentorApprovedPanel
              tp={tp}
              locale={locale}
              mentorDoc={mentorDoc}
              userRole={user.role}
              onUpdated={setMentorMine}
            />
          </>
        )}

        {tab === "info" && (
          <PlatformCard>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{tp("info.title")}</h2>
              <div className="flex shrink-0 items-center gap-2">
                {!isEditing ? (
                  <>
                    <Button type="button" onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                      {tProf("edit")}
                    </Button>
                    {user.role === "user" && !mentorApproved && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => router.push(`/${locale}/my/profile/apply`)}
                      >
                        {tp("info.mentorCta")}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={saving}
                      onClick={handleSave}
                      className="inline-flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? tProf("saving") : tp("info.save")}
                    </Button>
                    <Button type="button" size="sm" onClick={() => setIsEditing(false)} variant="secondary">
                      {tProf("cancel")}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <InfoRow label={tProf("name")} required>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p>{user.name}</p>
                )}
              </InfoRow>
              <InfoRow label={tp("info.avatarLabel")} align="start">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        N/A
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        {tp("info.avatarUpload")}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(file);
                          }}
                        />
                      </label>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: "" })}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {tp("info.avatarRemove")}
                        </button>
                      )}
                    </div>
                  </div>
                ) : formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <p className="text-slate-500">—</p>
                )}
              </InfoRow>
              <InfoRow label={tProf("email")} align="start">
                <div>
                  <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-1">{tp("info.emailHelp")}</p>
                </div>
              </InfoRow>
              <InfoRow label={tProf("bio")} align="start">
                {isEditing ? (
                  <Textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{formData.bio || "—"}</p>
                )}
              </InfoRow>
              <InfoRow label={tp("info.phoneLabel")} required>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={tp("info.phonePlaceholder")}
                  />
                ) : (
                  <p>{formData.phone || "—"}</p>
                )}
              </InfoRow>
              <InfoRow label={tp("info.addressLabel")}>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={tp("info.addressPlaceholder")}
                  />
                ) : (
                  <p>{formData.address || "—"}</p>
                )}
              </InfoRow>
              {isEditing && (
                <>
                  <div className="pt-4">
                    <p className="text-sm font-semibold text-slate-800">{tp("info.passwordTitle")}</p>
                    <p className="text-xs text-slate-500 mt-1">{tp("info.passwordHelp")}</p>
                  </div>
                  <InfoRow label={tp("info.currentPassword")}>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={tp("info.currentPassword")}
                    />
                  </InfoRow>
                  <InfoRow label={tp("info.newPassword")}>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={tp("info.newPassword")}
                    />
                  </InfoRow>
                  <InfoRow label={tp("info.confirmNewPassword")}>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder={tp("info.confirmNewPassword")}
                    />
                  </InfoRow>
                </>
              )}
              <FormError message={saveError} />
            </div>
          </PlatformCard>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
