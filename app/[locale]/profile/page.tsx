"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Save,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { authApi, enrollmentApi, lecturesApi, mentorsApi, sessionApi } from "@/lib/api/client";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import Toast from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Field from "@/components/ui/Field";
import FormError from "@/components/ui/FormError";
import MentorApprovedPanel from "@/components/profile/MentorApprovedPanel";
import MentorStatusPanel from "@/components/profile/MentorStatusPanel";

type TabId = "overview" | "learning" | "sessions" | "mentor" | "info";

function tabFromParam(v: string | null): TabId {
  if (v === "learning" || v === "sessions" || v === "mentor" || v === "info") return v;
  return "overview";
}

function enrollmentTone(s: string) {
  if (s === "completed") return "green" as const;
  if (s === "cancelled") return "red" as const;
  return "blue" as const;
}

function sessionTone(s: string) {
  if (s === "completed") return "green" as const;
  if (s === "cancelled") return "red" as const;
  return "blue" as const;
}

function ProfilePageContent() {
  const tp = useTranslations("profilePage");
  const tProf = useTranslations("profile");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const fmt = useFormatter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [tab, setTab] = useState<TabId>(() => tabFromParam(searchParams.get("tab")));
  const [hasLoaded, setHasLoaded] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [mentorMine, setMentorMine] = useState<any | null | undefined>(undefined);
  const [myLectures, setMyLectures] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    bio: "",
    location: "",
    phone: "",
    address: "",
    languages: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [mentorTitle, setMentorTitle] = useState("");
  const [mentorLocation, setMentorLocation] = useState("");
  const [mentorBio, setMentorBio] = useState("");
  const [mentorLangs, setMentorLangs] = useState("");
  const [mentorSpecs, setMentorSpecs] = useState("");
  const [mentorPrice, setMentorPrice] = useState("0");
  const [mentorAvail, setMentorAvail] = useState<"available" | "limited" | "unavailable">("available");
  const [mentorSubmitting, setMentorSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [mentorErrors, setMentorErrors] = useState<Record<string, string>>({});
  const [sessionDuration, setSessionDuration] = useState("60");
  const [sessionFormat, setSessionFormat] = useState<"online" | "offline" | "both">("online");
  const [yearsOfExperience, setYearsOfExperience] = useState("0");
  const [education, setEducation] = useState("");
  const [careerSummary, setCareerSummary] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [mentoringStyle, setMentoringStyle] = useState("");
  const [recommendedFor, setRecommendedFor] = useState("");
  const [notRecommendedFor, setNotRecommendedFor] = useState("");

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  const loadAll = useCallback(async () => {
    try {
      const [enr, sess, mine] = await Promise.all([
        enrollmentApi.getMine(),
        sessionApi.getMine(),
        mentorsApi.getMine(),
      ]);
      setEnrollments(enr.data?.enrollments || []);
      setSessions(sess.data?.sessions || []);
      setMentorMine(mine.data?.mentor ?? null);

      const m = mine.data?.mentor;
      const st = m?.approvalStatus || "approved";
      if (m && st === "approved") {
        const lec = await lecturesApi.getMine();
        setMyLectures(lec.data?.lectures || []);
      } else {
        setMyLectures([]);
      }
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
        location: user.location || "",
        phone: user.phone || "",
        address: user.address || "",
        languages: user.languages || [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (!mentorMine || mentorMine.approvalStatus !== "rejected") return;
    setMentorTitle(mentorMine.title || "");
    setMentorLocation(mentorMine.location || "");
    setMentorBio(mentorMine.bio || "");
    setMentorLangs((mentorMine.languages || []).join(", "));
    setMentorSpecs((mentorMine.specialties || []).join(", "));
    setMentorPrice(String(mentorMine.price ?? 0));
    if (mentorMine.availability) setMentorAvail(mentorMine.availability);
  }, [mentorMine]);

  useEffect(() => {
    if (!user?.id) {
      setHasLoaded(false);
      return;
    }
    setHasLoaded(false);
    void loadAll();
  }, [user?.id, user?.role, loadAll]);

  const enrollmentLabel = useMemo(() => {
    return (s: string) => {
      if (s === "active") return tStatus("enrollment.active");
      if (s === "completed") return tStatus("enrollment.completed");
      if (s === "cancelled") return tStatus("enrollment.cancelled");
      return s;
    };
  }, [tStatus]);

  const sessionLabel = useMemo(() => {
    return (s: string) => {
      if (s === "upcoming") return tStatus("session.upcoming");
      if (s === "completed") return tStatus("session.completed");
      if (s === "cancelled") return tStatus("session.cancelled");
      return s;
    };
  }, [tStatus]);

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
    if (!formData.location.trim()) {
      setSaveError("활동 지역은 필수입니다.");
      return;
    }
    if (formData.location.trim().length < 2 || formData.location.trim().length > 80) {
      setSaveError("활동 지역은 2~80자로 입력해 주세요.");
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
    const res = await authApi.updateProfile({
      name: formData.name,
      avatar: formData.avatar,
      bio: formData.bio,
      location: formData.location,
      phone: formData.phone,
      address: formData.address,
      languages: formData.languages,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    if (res.error) {
      setSaveError(res.error);
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

  const submitMentorApplication = async () => {
    if (!user) return;
    const errors: Record<string, string> = {};
    const languages = mentorLangs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const specialties = mentorSpecs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedPrice = parseInt(mentorPrice, 10) || 0;
    const parsedDuration = parseInt(sessionDuration, 10) || 0;
    const parsedYears = parseInt(yearsOfExperience, 10) || 0;
    const links = portfolioLinks
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!mentorTitle.trim()) errors.title = "멘토 직함은 필수입니다.";
    if (!mentorLocation.trim()) errors.location = "활동 지역은 필수입니다.";
    if (!mentorBio.trim() || mentorBio.trim().length < 40) errors.bio = "소개는 40자 이상 입력해 주세요.";
    if (languages.length === 0) errors.languages = "언어를 1개 이상 입력해 주세요.";
    if (specialties.length === 0) errors.specialties = "전문 분야를 1개 이상 입력해 주세요.";
    if (parsedPrice < 0) errors.price = "상담 가격은 0원 이상이어야 합니다.";
    if (parsedDuration < 15 || parsedDuration > 240) errors.sessionDuration = "세션 시간은 15~240분 사이여야 합니다.";
    if (parsedYears < 0 || parsedYears > 60) errors.years = "경력은 0~60년 사이로 입력해 주세요.";
    if (!mentoringStyle.trim()) errors.mentoringStyle = "멘토링 스타일은 필수입니다.";
    if (introVideoUrl.trim() && !/^https?:\/\/\S+$/i.test(introVideoUrl.trim())) errors.introVideoUrl = "소개 영상 URL 형식이 올바르지 않습니다.";
    if (links.some((x) => !/^https?:\/\/\S+$/i.test(x))) errors.portfolioLinks = "포트폴리오 링크는 http(s) URL만 입력 가능합니다.";

    setMentorErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setMentorSubmitting(true);
    const res = await mentorsApi.apply({
      title: mentorTitle.trim(),
      location: mentorLocation.trim(),
      bio: mentorBio.trim(),
      languages,
      specialties,
      price: parsedPrice,
      availability: mentorAvail,
      sessionDuration: parsedDuration,
      sessionFormat,
      yearsOfExperience: parsedYears,
      education: education.trim(),
      careerSummary: careerSummary.trim(),
      responseTime: responseTime.trim(),
      timezone: timezone.trim(),
      introVideoUrl: introVideoUrl.trim(),
      portfolioLinks: links,
      mentoringStyle: mentoringStyle.trim(),
      recommendedFor: recommendedFor.trim(),
      notRecommendedFor: notRecommendedFor.trim(),
    });
    setMentorSubmitting(false);
    if (res.error) {
      setToast({ message: res.error, variant: "error" });
      return;
    }
    setToast({ message: tp("mentor.pending"), variant: "success" });
    await loadAll();
    await refreshUser();
  };

  if (authLoading || !user || !hasLoaded) {
    return <LoadingState message={tp("loading")} />;
  }

  const mentorDoc = mentorMine;
  const mentorStatus: string | null = mentorDoc
    ? mentorDoc.approvalStatus || "approved"
    : null;
  const mentorApproved = mentorStatus === "approved";

  const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: tp("tabs.overview"), icon: BarChart3 },
    { id: "learning", label: tp("tabs.learning"), icon: BookOpen },
    { id: "sessions", label: tp("tabs.sessions"), icon: Calendar },
    { id: "mentor", label: tp("tabs.mentor"), icon: GraduationCap },
    { id: "info", label: tp("tabs.info"), icon: UserIcon },
  ];

  return (
    <div className="ds-page">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          closeLabel={tCommon("close")}
        />
      )}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
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
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tp("title")}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {user.name} · {user.email} ·{" "}
                <span className="font-semibold text-primary-600">{tProf(`roles.${user.role}`)}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="ds-container py-8 space-y-6">
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
        {tab === "overview" && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{tp("overview.subtitle")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlatformCard>
                <p className="text-sm text-slate-500 dark:text-slate-400">{tp("overview.enrollments")}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{enrollments.length}</p>
                <Link
                  href={`/${locale}/my/courses?tab=status`}
                  className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary-600"
                >
                  {tCommon("myEnrollments")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </PlatformCard>
              <PlatformCard>
                <p className="text-sm text-slate-500 dark:text-slate-400">{tp("overview.sessions")}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{sessions.length}</p>
                <Link
                  href={`/${locale}/my/sessions`}
                  className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary-600"
                >
                  {tCommon("mySessions")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </PlatformCard>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/lectures`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {tp("overview.goLectures")}
              </Link>
              <Link
                href={`/${locale}/mentors`}
                className="rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {tp("overview.goMentors")}
              </Link>
              <Link
                href={`/${locale}/my/dashboard`}
                className="rounded-xl bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {tp("overview.goDashboard")}
              </Link>
            </div>
            {user.role === "mentee" && (
              <PlatformCard className="bg-primary-50/80 ring-primary-100">
                <p className="font-semibold text-slate-900">{tp("overview.mentorCta")}</p>
                <p className="text-sm text-slate-600 mt-1">{tp("overview.mentorCtaDesc")}</p>
                <Button
                  type="button"
                  onClick={() => {
                    setTab("mentor");
                    router.replace(`/${locale}/my/profile?tab=mentor`, { scroll: false });
                  }}
                >
                  {tp("tabs.mentor")}
                </Button>
              </PlatformCard>
            )}
          </>
        )}

        {tab === "learning" && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{tp("learning.subtitle")}</p>
            {enrollments.length === 0 ? (
              <PlatformCard>
                <p className="text-slate-600">{tp("learning.empty")}</p>
                <Link href={`/${locale}/lectures`} className="inline-block mt-3 text-sm font-semibold text-primary-600">
                  {tp("overview.goLectures")}
                </Link>
              </PlatformCard>
            ) : (
              <div className="space-y-3">
                {enrollments.map((e) => (
                  <PlatformCard key={e.id}>
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {e.lecture?.title || "—"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {e.lecture?.category} ·{" "}
                          {e.enrolledAt
                            ? fmt.dateTime(new Date(e.enrolledAt), { dateStyle: "medium" })
                            : ""}
                        </p>
                      </div>
                      <StatusBadge label={enrollmentLabel(e.status)} tone={enrollmentTone(e.status)} />
                    </div>
                    {e.lecture?.id && (
                      <Link
                        href={`/${locale}/lectures/${e.lecture.id}`}
                        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary-600"
                      >
                        {tp("learning.view")}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </PlatformCard>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "sessions" && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{tp("sessions.subtitle")}</p>
            {sessions.length === 0 ? (
              <PlatformCard>
                <p className="text-slate-600">{tp("sessions.empty")}</p>
                <Link href={`/${locale}/mentors`} className="inline-block mt-3 text-sm font-semibold text-primary-600">
                  {tp("overview.goMentors")}
                </Link>
              </PlatformCard>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <PlatformCard key={s.id}>
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          {s.mentorName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {s.date
                            ? fmt.dateTime(new Date(s.date), {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : ""}
                        </p>
                      </div>
                      <StatusBadge label={sessionLabel(s.status)} tone={sessionTone(s.status)} />
                    </div>
                    {s.mentorId && (
                      <Link
                        href={`/${locale}/mentors/${s.mentorId}`}
                        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary-600"
                      >
                        {tp("sessions.with")}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </PlatformCard>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "mentor" && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{tp("mentor.title")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{tp("mentor.applyLead")}</p>

            {mentorApproved && mentorDoc ? (
                <MentorApprovedPanel
                  tp={tp}
                  locale={locale}
                  mentorDoc={mentorDoc}
                  userRole={user.role}
                  myLectures={myLectures}
                />
            ) : !mentorDoc ? (
              <PlatformCard>
                <h3 className="font-semibold text-slate-900 mb-4">{tp("mentor.formTitle")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.mentorTitleLabel")}</label>
                    <Input
                      className="mt-1"
                      value={mentorTitle}
                      onChange={(e) => setMentorTitle(e.target.value)}
                    />
                    {mentorErrors.title && <p className="text-xs text-red-600 mt-1">{mentorErrors.title}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.locationLabel")}</label>
                    <Input
                      className="mt-1"
                      value={mentorLocation}
                      onChange={(e) => setMentorLocation(e.target.value)}
                    />
                    {mentorErrors.location && <p className="text-xs text-red-600 mt-1">{mentorErrors.location}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.bioLabel")}</label>
                    <Textarea
                      rows={4}
                      className="mt-1"
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                    />
                    {mentorErrors.bio && <p className="text-xs text-red-600 mt-1">{mentorErrors.bio}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.languagesLabel")}</label>
                    <Input
                      className="mt-1"
                      value={mentorLangs}
                      onChange={(e) => setMentorLangs(e.target.value)}
                    />
                    {mentorErrors.languages && <p className="text-xs text-red-600 mt-1">{mentorErrors.languages}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.specialtiesLabel")}</label>
                    <Input
                      className="mt-1"
                      value={mentorSpecs}
                      onChange={(e) => setMentorSpecs(e.target.value)}
                    />
                    {mentorErrors.specialties && <p className="text-xs text-red-600 mt-1">{mentorErrors.specialties}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.priceLabel")}</label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={mentorPrice}
                      onChange={(e) => setMentorPrice(e.target.value)}
                    />
                    {mentorErrors.price && <p className="text-xs text-red-600 mt-1">{mentorErrors.price}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">세션 시간(분)</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                    />
                    {mentorErrors.sessionDuration && <p className="text-xs text-red-600 mt-1">{mentorErrors.sessionDuration}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">세션 형식</label>
                    <Select
                      className="mt-1"
                      value={sessionFormat}
                      onChange={(e) => setSessionFormat(e.target.value as typeof sessionFormat)}
                    >
                      <option value="online">온라인</option>
                      <option value="offline">오프라인</option>
                      <option value="both">모두 가능</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">경력(년)</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                    />
                    {mentorErrors.years && <p className="text-xs text-red-600 mt-1">{mentorErrors.years}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">학력/자격</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">경력 요약</label>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={careerSummary}
                      onChange={(e) => setCareerSummary(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">평균 응답 시간</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="예: 24시간 이내"
                      value={responseTime}
                      onChange={(e) => setResponseTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">시간대</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">소개 영상 URL (선택)</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={introVideoUrl}
                      onChange={(e) => setIntroVideoUrl(e.target.value)}
                    />
                    {mentorErrors.introVideoUrl && <p className="text-xs text-red-600 mt-1">{mentorErrors.introVideoUrl}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">포트폴리오 링크(줄바꿈 구분, 선택)</label>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={portfolioLinks}
                      onChange={(e) => setPortfolioLinks(e.target.value)}
                    />
                    {mentorErrors.portfolioLinks && <p className="text-xs text-red-600 mt-1">{mentorErrors.portfolioLinks}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">멘토링 스타일</label>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentoringStyle}
                      onChange={(e) => setMentoringStyle(e.target.value)}
                    />
                    {mentorErrors.mentoringStyle && <p className="text-xs text-red-600 mt-1">{mentorErrors.mentoringStyle}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">추천 대상</label>
                    <textarea
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={recommendedFor}
                      onChange={(e) => setRecommendedFor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">비추천 대상</label>
                    <textarea
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={notRecommendedFor}
                      onChange={(e) => setNotRecommendedFor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.avail")}</label>
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorAvail}
                      onChange={(e) => setMentorAvail(e.target.value as typeof mentorAvail)}
                    >
                      <option value="available">{tp("mentor.availAvailable")}</option>
                      <option value="limited">{tp("mentor.availLimited")}</option>
                      <option value="unavailable">{tp("mentor.availUnavailable")}</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    disabled={mentorSubmitting}
                    onClick={submitMentorApplication}
                    fullWidth
                  >
                    {tp("mentor.submit")}
                  </Button>
                </div>
              </PlatformCard>
            ) : (
              <MentorStatusPanel
                tp={tp}
                mentorStatus={mentorStatus}
                mentorSubmitting={mentorSubmitting}
                submitMentorApplication={submitMentorApplication}
                mentorTitle={mentorTitle}
                setMentorTitle={setMentorTitle}
                mentorLocation={mentorLocation}
                setMentorLocation={setMentorLocation}
                mentorBio={mentorBio}
                setMentorBio={setMentorBio}
                mentorLangs={mentorLangs}
                setMentorLangs={setMentorLangs}
                mentorSpecs={mentorSpecs}
                setMentorSpecs={setMentorSpecs}
                mentorPrice={mentorPrice}
                setMentorPrice={setMentorPrice}
                mentorAvail={mentorAvail}
                setMentorAvail={setMentorAvail}
              />
            )}
          </>
        )}

        {tab === "info" && (
          <PlatformCard>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{tp("info.title")}</h2>
            <div className="space-y-4">
              <Field label={tProf("name")} required>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-900">{user.name}</p>
                )}
              </Field>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("info.avatarLabel")}</label>
                {isEditing ? (
                  <div className="mt-2 flex items-center gap-3">
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
                    className="mt-2 w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700">—</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tProf("email")}</label>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                <p className="text-xs text-slate-400 mt-1">{tp("info.emailHelp")}</p>
              </div>
              <Field label={tProf("bio")}>
                {isEditing ? (
                  <Textarea
                    rows={4}
                    className="mt-1"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{formData.bio || "—"}</p>
                )}
              </Field>
              <Field label={tProf("location")} required>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700">{formData.location || "—"}</p>
                )}
              </Field>
              <Field label={tp("info.phoneLabel")} required>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={tp("info.phonePlaceholder")}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700">{formData.phone || "—"}</p>
                )}
              </Field>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("info.addressLabel")}</label>
                {isEditing ? (
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={tp("info.addressPlaceholder")}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700">{formData.address || "—"}</p>
                )}
              </div>
              {isEditing && (
                <>
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold text-slate-800">{tp("info.passwordTitle")}</p>
                    <p className="text-xs text-slate-500 mt-1">{tp("info.passwordHelp")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("info.currentPassword")}</label>
                    <input
                      type="password"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={tp("info.currentPassword")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("info.newPassword")}</label>
                    <input
                      type="password"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={tp("info.newPassword")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("info.confirmNewPassword")}</label>
                    <input
                      type="password"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder={tp("info.confirmNewPassword")}
                    />
                  </div>
                </>
              )}
              <FormError message={saveError} />
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                  >
                    {tProf("edit")}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={handleSave}
                      className="inline-flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? tProf("saving") : tp("info.save")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      variant="secondary"
                    >
                      {tProf("cancel")}
                    </Button>
                  </>
                )}
              </div>
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
