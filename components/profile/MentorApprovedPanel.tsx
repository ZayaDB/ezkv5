"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import PlatformCard from "@/components/ui/PlatformCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import FormError from "@/components/ui/FormError";
import MentorApplicationDetails from "@/components/admin/moderation/MentorApplicationDetails";
import { mentorsApi } from "@/lib/api/client";
import type { MyMentorProfile } from "@/lib/supabase/mentors";

type Tp = (key: string) => string;

type FormState = {
  title: string;
  location: string;
  bio: string;
  languages: string;
  specialties: string;
  price: string;
  availability: "available" | "limited" | "unavailable";
  sessionDuration: string;
  sessionFormat: "online" | "offline" | "both";
  yearsOfExperience: string;
  education: string;
  careerSummary: string;
  responseTime: string;
  timezone: string;
  introVideoUrl: string;
  portfolioLinks: string;
  mentoringStyle: string;
  recommendedFor: string;
  notRecommendedFor: string;
};

function fromDoc(doc: MyMentorProfile): FormState {
  const format =
    doc.sessionFormat === "offline" || doc.sessionFormat === "both" ? doc.sessionFormat : "online";
  const avail =
    doc.availability === "limited" || doc.availability === "unavailable"
      ? doc.availability
      : "available";
  return {
    title: doc.title || "",
    location: doc.location || "",
    bio: doc.bio || "",
    languages: (doc.languages || []).join(", "),
    specialties: (doc.specialties || []).join(", "),
    price: String(doc.price ?? 0),
    availability: avail,
    sessionDuration: String(doc.sessionDuration || 60),
    sessionFormat: format,
    yearsOfExperience: String(doc.yearsOfExperience ?? 0),
    education: doc.education || "",
    careerSummary: doc.careerSummary || "",
    responseTime: doc.responseTime || "",
    timezone: doc.timezone || "Asia/Seoul",
    introVideoUrl: doc.introVideoUrl || "",
    portfolioLinks: (doc.portfolioLinks || []).join("\n"),
    mentoringStyle: doc.mentoringStyle || "",
    recommendedFor: doc.recommendedFor || "",
    notRecommendedFor: doc.notRecommendedFor || "",
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}

export default function MentorApprovedPanel({
  tp,
  locale,
  mentorDoc,
  userRole,
  onUpdated,
}: {
  tp: Tp;
  locale: string;
  mentorDoc: MyMentorProfile;
  userRole: string;
  onUpdated: (next: MyMentorProfile) => void;
}) {
  const tProf = useTranslations("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(() => fromDoc(mentorDoc));

  useEffect(() => {
    if (!editing) setForm(fromDoc(mentorDoc));
  }, [mentorDoc, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    const languages = form.languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const specialties = form.specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedPrice = parseInt(form.price, 10) || 0;
    const parsedDuration = parseInt(form.sessionDuration, 10) || 0;
    const parsedYears = parseInt(form.yearsOfExperience, 10) || 0;
    const links = form.portfolioLinks
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!form.title.trim()) nextErrors.title = tp("mentor.errTitleRequired");
    if (!form.location.trim()) nextErrors.location = tp("mentor.errLocationRequired");
    if (!form.bio.trim() || form.bio.trim().length < 40) nextErrors.bio = tp("mentor.errBioMin");
    if (languages.length === 0) nextErrors.languages = tp("mentor.errLanguagesRequired");
    if (specialties.length === 0) nextErrors.specialties = tp("mentor.errSpecialtiesRequired");
    if (parsedPrice < 0) nextErrors.price = tp("mentor.errPriceMin");
    if (parsedDuration < 15 || parsedDuration > 240) nextErrors.sessionDuration = tp("mentor.errDurationRange");
    if (parsedYears < 0 || parsedYears > 60) nextErrors.years = tp("mentor.errYearsRange");
    if (!form.mentoringStyle.trim()) nextErrors.mentoringStyle = tp("mentor.errStyleRequired");
    if (form.introVideoUrl.trim() && !/^https?:\/\/\S+$/i.test(form.introVideoUrl.trim())) {
      nextErrors.introVideoUrl = tp("mentor.errIntroVideoUrl");
    }
    if (links.some((x) => !/^https?:\/\/\S+$/i.test(x))) {
      nextErrors.portfolioLinks = tp("mentor.errPortfolioUrl");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaveError("");
    const res = await mentorsApi.updateMine({
      title: form.title.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      languages,
      specialties,
      price: parsedPrice,
      availability: form.availability,
      photo: mentorDoc.photo || undefined,
      sessionDuration: parsedDuration,
      sessionFormat: form.sessionFormat,
      yearsOfExperience: parsedYears,
      education: form.education.trim(),
      careerSummary: form.careerSummary.trim(),
      responseTime: form.responseTime.trim(),
      timezone: form.timezone.trim(),
      introVideoUrl: form.introVideoUrl.trim(),
      portfolioLinks: links,
      mentoringStyle: form.mentoringStyle.trim(),
      recommendedFor: form.recommendedFor.trim(),
      notRecommendedFor: form.notRecommendedFor.trim(),
    });
    setSaving(false);
    if (res.error || !res.data?.mentor) {
      setSaveError(res.error || "멘토 프로필 저장에 실패했습니다.");
      return;
    }
    onUpdated(res.data.mentor);
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <PlatformCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">{tp("mentor.mentorRoleTitle")}</h3>
            <p className="text-sm text-slate-600 mt-1">{mentorDoc.title}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!editing ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
                {tp("mentor.editProfile")}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className="inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? tProf("saving") : tp("info.save")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                    setSaveError("");
                    setForm(fromDoc(mentorDoc));
                  }}
                >
                  {tProf("cancel")}
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/mentors/${mentorDoc.id}`}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            {tp("mentor.publicProfile")}
          </Link>
          {(userRole === "mentor" || userRole === "admin") && (
            <Link
              href={`/${locale}/mentor/lectures/new`}
              className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {tp("mentor.createCourse")}
            </Link>
          )}
        </div>
        {(userRole === "user" || userRole === "mentee") && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            {tp("mentor.approvedMentee")}
          </p>
        )}
      </PlatformCard>

      <PlatformCard>
        {editing ? (
          <div className="space-y-3">
            <Field label={tp("mentor.mentorTitleLabel")} error={errors.title}>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label={tp("mentor.locationLabel")} error={errors.location}>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label={tp("mentor.bioLabel")} error={errors.bio}>
              <Textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            </Field>
            <Field label={tp("mentor.languagesLabel")} error={errors.languages}>
              <Input value={form.languages} onChange={(e) => set("languages", e.target.value)} />
            </Field>
            <Field label={tp("mentor.specialtiesLabel")} error={errors.specialties}>
              <Input value={form.specialties} onChange={(e) => set("specialties", e.target.value)} />
            </Field>
            <Field label={tp("mentor.priceLabel")} error={errors.price}>
              <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label={tp("mentor.sessionDurationLabel")} error={errors.sessionDuration}>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.sessionDuration}
                onChange={(e) => set("sessionDuration", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.sessionFormatLabel")}>
              <Select
                value={form.sessionFormat}
                onChange={(e) => set("sessionFormat", e.target.value as FormState["sessionFormat"])}
              >
                <option value="online">{tp("mentor.formatOnline")}</option>
                <option value="offline">{tp("mentor.formatOffline")}</option>
                <option value="both">{tp("mentor.formatBoth")}</option>
              </Select>
            </Field>
            <Field label={tp("mentor.yearsLabel")} error={errors.years}>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.yearsOfExperience}
                onChange={(e) => set("yearsOfExperience", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.educationLabel")}>
              <Input value={form.education} onChange={(e) => set("education", e.target.value)} />
            </Field>
            <Field label={tp("mentor.careerSummaryLabel")}>
              <Textarea
                rows={3}
                value={form.careerSummary}
                onChange={(e) => set("careerSummary", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.responseTimeLabel")}>
              <Input
                placeholder={tp("mentor.responseTimePlaceholder")}
                value={form.responseTime}
                onChange={(e) => set("responseTime", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.timezoneLabel")}>
              <Input value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
            </Field>
            <Field label={tp("mentor.introVideoLabel")} error={errors.introVideoUrl}>
              <Input value={form.introVideoUrl} onChange={(e) => set("introVideoUrl", e.target.value)} />
            </Field>
            <Field label={tp("mentor.portfolioLabel")} error={errors.portfolioLinks}>
              <Textarea
                rows={3}
                value={form.portfolioLinks}
                onChange={(e) => set("portfolioLinks", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.mentoringStyleLabel")} error={errors.mentoringStyle}>
              <Textarea
                rows={3}
                value={form.mentoringStyle}
                onChange={(e) => set("mentoringStyle", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.recommendedForLabel")}>
              <Textarea
                rows={2}
                value={form.recommendedFor}
                onChange={(e) => set("recommendedFor", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.notRecommendedForLabel")}>
              <Textarea
                rows={2}
                value={form.notRecommendedFor}
                onChange={(e) => set("notRecommendedFor", e.target.value)}
              />
            </Field>
            <Field label={tp("mentor.avail")}>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.availability}
                onChange={(e) => set("availability", e.target.value as FormState["availability"])}
              >
                <option value="available">{tp("mentor.availAvailable")}</option>
                <option value="limited">{tp("mentor.availLimited")}</option>
                <option value="unavailable">{tp("mentor.availUnavailable")}</option>
              </select>
            </Field>
            <FormError message={saveError} />
          </div>
        ) : (
          <MentorApplicationDetails item={mentorDoc} framed={false} />
        )}
      </PlatformCard>

      {(userRole === "mentor" || userRole === "admin") && (
        <PlatformCard>
          <p className="text-sm text-slate-600">{tp("mentor.manageCoursesHint")}</p>
          <Link
            href={`/${locale}/my/lectures`}
            className="inline-flex mt-3 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
          >
            {tp("mentor.goMyLectures")}
          </Link>
        </PlatformCard>
      )}
    </div>
  );
}
