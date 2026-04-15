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
    if (newPassword && newPassword !== confirmNewPassword) {
      setSaveError(tp("info.passwordMismatch"));
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setSaveError(tp("info.passwordTooShort"));
      return;
    }
    setSaving(true);
    setSaveError("");
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
    setMentorSubmitting(true);
    const languages = mentorLangs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const specialties = mentorSpecs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await mentorsApi.apply({
      title: mentorTitle.trim(),
      location: mentorLocation.trim(),
      bio: mentorBio.trim(),
      languages,
      specialties,
      price: parseInt(mentorPrice, 10) || 0,
      availability: mentorAvail,
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
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          closeLabel={tCommon("close")}
        />
      )}
      <header className="border-b border-slate-200 bg-white">
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
              <h1 className="text-2xl font-bold text-slate-900">{tp("title")}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {user.name} · {user.email} ·{" "}
                <span className="font-semibold text-primary-600">{tProf(`roles.${user.role}`)}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {tab === "overview" && (
          <>
            <p className="text-sm text-slate-600">{tp("overview.subtitle")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlatformCard>
                <p className="text-sm text-slate-500">{tp("overview.enrollments")}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{enrollments.length}</p>
                <Link
                  href={`/${locale}/my/courses?tab=status`}
                  className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary-600"
                >
                  {tCommon("myEnrollments")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </PlatformCard>
              <PlatformCard>
                <p className="text-sm text-slate-500">{tp("overview.sessions")}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{sessions.length}</p>
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
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                {tp("overview.goMentors")}
              </Link>
              <Link
                href={`/${locale}/my/dashboard`}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                {tp("overview.goDashboard")}
              </Link>
            </div>
            {user.role === "mentee" && (
              <PlatformCard className="bg-primary-50/80 ring-primary-100">
                <p className="font-semibold text-slate-900">{tp("overview.mentorCta")}</p>
                <p className="text-sm text-slate-600 mt-1">{tp("overview.mentorCtaDesc")}</p>
                <button
                  type="button"
                  onClick={() => {
                    setTab("mentor");
                    router.replace(`/${locale}/my/profile?tab=mentor`, { scroll: false });
                  }}
                  className="mt-3 inline-flex rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  {tp("tabs.mentor")}
                </button>
              </PlatformCard>
            )}
          </>
        )}

        {tab === "learning" && (
          <>
            <p className="text-sm text-slate-600">{tp("learning.subtitle")}</p>
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
            <p className="text-sm text-slate-600">{tp("sessions.subtitle")}</p>
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
            <h2 className="text-lg font-semibold text-slate-900">{tp("mentor.title")}</h2>
            <p className="text-sm text-slate-600">{tp("mentor.applyLead")}</p>

            {mentorApproved && mentorDoc ? (
                <div className="space-y-4">
                  <PlatformCard>
                    <h3 className="font-semibold text-slate-900">{tp("mentor.mentorRoleTitle")}</h3>
                    <p className="text-sm text-slate-600 mt-1">{mentorDoc.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/${locale}/mentors/${mentorDoc.id}`}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                      >
                        {tp("mentor.publicProfile")}
                      </Link>
                      {(user.role === "mentor" || user.role === "admin") && (
                        <Link
                          href={`/${locale}/mentor/lectures/new`}
                          className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          {tp("mentor.createCourse")}
                        </Link>
                      )}
                    </div>
                    {user.role === "mentee" && (
                      <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                        {tp("mentor.approvedMentee")}
                      </p>
                    )}
                  </PlatformCard>
                  {(user.role === "mentor" || user.role === "admin") && (
                    <PlatformCard>
                      <h3 className="font-semibold text-slate-900 mb-3">{tp("mentor.myCourses")}</h3>
                      {myLectures.length === 0 ? (
                        <p className="text-sm text-slate-500">{tp("mentor.noCourses")}</p>
                      ) : (
                        <ul className="space-y-2">
                          {myLectures.map((lec: any) => (
                            <li key={lec.id}>
                              <Link
                                href={`/${locale}/lectures/${lec.id}`}
                                className="text-sm font-medium text-primary-600 hover:underline"
                              >
                                {lec.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </PlatformCard>
                  )}
                </div>
            ) : !mentorDoc ? (
              <PlatformCard>
                <h3 className="font-semibold text-slate-900 mb-4">{tp("mentor.formTitle")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.mentorTitleLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorTitle}
                      onChange={(e) => setMentorTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.locationLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorLocation}
                      onChange={(e) => setMentorLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.bioLabel")}</label>
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.languagesLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorLangs}
                      onChange={(e) => setMentorLangs(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.specialtiesLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorSpecs}
                      onChange={(e) => setMentorSpecs(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.priceLabel")}</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorPrice}
                      onChange={(e) => setMentorPrice(e.target.value)}
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
                  <button
                    type="button"
                    disabled={mentorSubmitting}
                    onClick={submitMentorApplication}
                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                  >
                    {tp("mentor.submit")}
                  </button>
                </div>
              </PlatformCard>
            ) : mentorStatus === "pending" ? (
              <PlatformCard>
                <p className="text-sm text-slate-700">{tp("mentor.pending")}</p>
              </PlatformCard>
            ) : mentorStatus === "rejected" ? (
              <PlatformCard>
                <p className="text-sm text-red-700 mb-4">{tp("mentor.rejected")}</p>
                <h3 className="font-semibold text-slate-900 mb-4">{tp("mentor.formTitle")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.mentorTitleLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorTitle}
                      onChange={(e) => setMentorTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.locationLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorLocation}
                      onChange={(e) => setMentorLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.bioLabel")}</label>
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.languagesLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorLangs}
                      onChange={(e) => setMentorLangs(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.specialtiesLabel")}</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorSpecs}
                      onChange={(e) => setMentorSpecs(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">{tp("mentor.priceLabel")}</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={mentorPrice}
                      onChange={(e) => setMentorPrice(e.target.value)}
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
                  <button
                    type="button"
                    disabled={mentorSubmitting}
                    onClick={submitMentorApplication}
                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {tp("mentor.submit")}
                  </button>
                </div>
              </PlatformCard>
            ) : null}
          </>
        )}

        {tab === "info" && (
          <PlatformCard>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{tp("info.title")}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">{tProf("name")}</label>
                {isEditing ? (
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-900">{user.name}</p>
                )}
              </div>
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
              <div>
                <label className="text-sm font-medium text-slate-700">{tProf("bio")}</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{formData.bio || "—"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tProf("location")}</label>
                {isEditing ? (
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700">{formData.location || "—"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("info.phoneLabel")}</label>
                {isEditing ? (
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={tp("info.phonePlaceholder")}
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-700">{formData.phone || "—"}</p>
                )}
              </div>
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
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {tProf("edit")}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? tProf("saving") : tp("info.save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      {tProf("cancel")}
                    </button>
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
