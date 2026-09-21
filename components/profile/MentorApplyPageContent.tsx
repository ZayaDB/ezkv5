"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { mentorsApi } from "@/lib/api/client";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import MentorStatusPanel from "@/components/profile/MentorStatusPanel";

export default function MentorApplyPageContent() {
  const tp = useTranslations("profilePage");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [mentorMine, setMentorMine] = useState<any | null | undefined>(undefined);
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
    if (!user?.id) {
      setHasLoaded(false);
      return;
    }
    setHasLoaded(false);
    void loadMentorStatus();
  }, [user?.id, user?.role, loadMentorStatus]);

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

  const mentorDoc = mentorMine;
  const mentorStatus: string | null = mentorDoc ? mentorDoc.approvalStatus || "approved" : null;
  const mentorApproved = mentorStatus === "approved";

  useEffect(() => {
    if (!hasLoaded || !user) return;
    if (mentorApproved) {
      router.replace(`/${locale}/my/profile?tab=mentor`);
    }
  }, [hasLoaded, user, mentorApproved, router, locale]);

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

    if (!mentorTitle.trim()) errors.title = tp("mentor.errTitleRequired");
    if (!mentorLocation.trim()) errors.location = tp("mentor.errLocationRequired");
    if (!mentorBio.trim() || mentorBio.trim().length < 40) errors.bio = tp("mentor.errBioMin");
    if (languages.length === 0) errors.languages = tp("mentor.errLanguagesRequired");
    if (specialties.length === 0) errors.specialties = tp("mentor.errSpecialtiesRequired");
    if (parsedPrice < 0) errors.price = tp("mentor.errPriceMin");
    if (parsedDuration < 15 || parsedDuration > 240) errors.sessionDuration = tp("mentor.errDurationRange");
    if (parsedYears < 0 || parsedYears > 60) errors.years = tp("mentor.errYearsRange");
    if (!mentoringStyle.trim()) errors.mentoringStyle = tp("mentor.errStyleRequired");
    if (introVideoUrl.trim() && !/^https?:\/\/\S+$/i.test(introVideoUrl.trim())) {
      errors.introVideoUrl = tp("mentor.errIntroVideoUrl");
    }
    if (links.some((x) => !/^https?:\/\/\S+$/i.test(x))) {
      errors.portfolioLinks = tp("mentor.errPortfolioUrl");
    }

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
    await loadMentorStatus();
    await refreshUser();
  };

  if (authLoading || !user || !hasLoaded || mentorApproved) {
    return <LoadingState message={tp("loading")} />;
  }

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
      <div className="ds-container py-8 space-y-6">
        <Link
          href={`/${locale}/my/profile`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {tp("mentor.backToProfile")}
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tp("mentor.formTitle")}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{tp("mentor.applyLead")}</p>
        </div>

        {!mentorDoc ? (
          <PlatformCard>
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
                <label className="text-sm font-medium text-slate-700">{tp("mentor.sessionDurationLabel")}</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                />
                {mentorErrors.sessionDuration && (
                  <p className="text-xs text-red-600 mt-1">{mentorErrors.sessionDuration}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.sessionFormatLabel")}</label>
                <Select
                  className="mt-1"
                  value={sessionFormat}
                  onChange={(e) => setSessionFormat(e.target.value as typeof sessionFormat)}
                >
                  <option value="online">{tp("mentor.formatOnline")}</option>
                  <option value="offline">{tp("mentor.formatOffline")}</option>
                  <option value="both">{tp("mentor.formatBoth")}</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.yearsLabel")}</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                />
                {mentorErrors.years && <p className="text-xs text-red-600 mt-1">{mentorErrors.years}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.educationLabel")}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.careerSummaryLabel")}</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={careerSummary}
                  onChange={(e) => setCareerSummary(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.responseTimeLabel")}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder={tp("mentor.responseTimePlaceholder")}
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.timezoneLabel")}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.introVideoLabel")}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={introVideoUrl}
                  onChange={(e) => setIntroVideoUrl(e.target.value)}
                />
                {mentorErrors.introVideoUrl && (
                  <p className="text-xs text-red-600 mt-1">{mentorErrors.introVideoUrl}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.portfolioLabel")}</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                />
                {mentorErrors.portfolioLinks && (
                  <p className="text-xs text-red-600 mt-1">{mentorErrors.portfolioLinks}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.mentoringStyleLabel")}</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={mentoringStyle}
                  onChange={(e) => setMentoringStyle(e.target.value)}
                />
                {mentorErrors.mentoringStyle && (
                  <p className="text-xs text-red-600 mt-1">{mentorErrors.mentoringStyle}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.recommendedForLabel")}</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={recommendedFor}
                  onChange={(e) => setRecommendedFor(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{tp("mentor.notRecommendedForLabel")}</label>
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
              <Button type="button" disabled={mentorSubmitting} onClick={submitMentorApplication} fullWidth>
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
      </div>
    </div>
  );
}
