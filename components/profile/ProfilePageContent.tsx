"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { uploadPublicImage } from "@/lib/supabase/storage";
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
        className={`w-28 shrink-0 text-sm font-medium text-brand-ink dark:text-snow-muted ${
          align === "start" ? "pt-2" : ""
        }`}
      >
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </span>
      <div className="min-w-0 flex-1 text-sm text-brand-ink dark:text-snow">{children}</div>
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
      setSaveError(tp("errNameRequired"));
      return;
    }
    if (formData.name.trim().length < 2 || formData.name.trim().length > 40) {
      setSaveError(tp("errNameLength"));
      return;
    }
    if (!formData.phone.trim()) {
      setSaveError(tp("errPhoneRequired"));
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(formData.phone.trim())) {
      setSaveError(tp("errPhoneFormat"));
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
      setSaveError(res.error || tp("errSaveFailed"));
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

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSaveError(tp("info.avatarImageOnly"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError(tp("info.avatarTooLarge"));
      return;
    }
    setSaveError("");
    // Shrink to a 512px square-ish WebP and store it in Storage (not as base64 in the DB).
    const resized = await resizeImage(file, 512).catch(() => file);
    const result = await uploadPublicImage(resized);
    if ("error" in result) {
      setSaveError(result.error);
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: result.data.url }));
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
    <div className="w-full space-y-8">
      <header>
        <div className="flex items-center gap-4">
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover ring-1 ring-hairline dark:ring-hairline-dark"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-xl font-bold text-white dark:bg-teal-dark dark:text-night">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-[1.2] text-ink dark:text-snow sm:text-[32px]">{user.name}</h1>
            <p className="mt-1 truncate text-sm text-ink-muted dark:text-snow-muted">
              {user.email} · <span className="font-semibold text-teal dark:text-teal-dark">{roleLabel}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {mentorApproved && (
          <div className="flex gap-6 border-b border-hairline dark:border-hairline-dark" role="tablist">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  router.replace(`/${locale}/my/profile?tab=${id}`, { scroll: false });
                }}
                role="tab"
                aria-selected={tab === id}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab === id
                    ? "border-teal text-teal dark:border-teal-dark dark:text-teal-dark"
                    : "border-transparent text-ink-muted hover:text-ink dark:text-snow-muted dark:hover:text-snow"
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
            <h2 className="text-lg font-semibold text-brand-ink dark:text-snow">{tp("mentor.title")}</h2>
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
              <h2 className="text-lg font-semibold text-brand-ink dark:text-snow">{tp("info.title")}</h2>
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
            <div className="divide-y divide-brand-line dark:divide-hairline-dark">
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
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-brand-line"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-brand-mist flex items-center justify-center text-brand-soft/70 text-xs dark:text-snow-muted dark:bg-night">
                        N/A
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex cursor-pointer rounded-lg border border-brand-line px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-mist dark:text-snow-muted dark:bg-night dark:border-hairline-dark">
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
                          className="rounded-lg border border-brand-line px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-mist dark:text-snow-muted dark:bg-night dark:border-hairline-dark"
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
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-brand-line"
                  />
                ) : (
                  <p className="text-brand-soft dark:text-snow-muted">—</p>
                )}
              </InfoRow>
              <InfoRow label={tProf("email")} align="start">
                <div>
                  <p className="text-brand-soft dark:text-snow-muted">{user.email}</p>
                  <p className="text-xs text-brand-soft/70 mt-1 dark:text-snow-muted">{tp("info.emailHelp")}</p>
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
                  <p className="whitespace-pre-wrap text-brand-ink dark:text-snow">{formData.bio || "—"}</p>
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
                    <p className="text-sm font-semibold text-brand-ink dark:text-snow">{tp("info.passwordTitle")}</p>
                    <p className="text-xs text-brand-soft mt-1 dark:text-snow-muted">{tp("info.passwordHelp")}</p>
                  </div>
                  <InfoRow label={tp("info.currentPassword")}>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-brand-line px-3 py-2 text-sm dark:border-hairline-dark"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={tp("info.currentPassword")}
                    />
                  </InfoRow>
                  <InfoRow label={tp("info.newPassword")}>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-brand-line px-3 py-2 text-sm dark:border-hairline-dark"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={tp("info.newPassword")}
                    />
                  </InfoRow>
                  <InfoRow label={tp("info.confirmNewPassword")}>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-brand-line px-3 py-2 text-sm dark:border-hairline-dark"
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
        <div className="min-h-screen bg-brand-mist dark:bg-night-card flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-line border-t-primary-600 rounded-full animate-spin dark:border-hairline-dark" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

async function resizeImage(file: File, max: number): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(url);
  }
}
