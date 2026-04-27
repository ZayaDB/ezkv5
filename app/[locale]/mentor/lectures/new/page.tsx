"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { lecturesApi } from "@/lib/api/client";
import PlatformCard from "@/components/ui/PlatformCard";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import FormError from "@/components/ui/FormError";
import Input from "@/components/ui/Input";
import SectionTitle from "@/components/ui/SectionTitle";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

export default function MentorLectureNewPage() {
  const t = useTranslations("profilePage.lectureNew");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  useEffect(() => {
    void refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only to sync DB role after admin approval
  }, []);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"online" | "offline">("online");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [totalLessons, setTotalLessons] = useState("0");
  const [totalHours, setTotalHours] = useState("0");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [maxStudents, setMaxStudents] = useState("30");
  const [language, setLanguage] = useState("ko");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [materialsIncluded, setMaterialsIncluded] = useState("");
  const [faq, setFaq] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== "mentor" && user.role !== "admin")) {
    router.replace(`/${locale}/my/profile?tab=mentor`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await lecturesApi.create({
      title: title.trim(),
      type,
      category: category.trim() || "기타",
      price: parseInt(price, 10) || 0,
      duration: duration.trim() || "-",
      description: description.trim(),
      image: image.trim() || undefined,
      shortDescription: shortDescription.trim(),
      targetAudience: targetAudience.trim(),
      prerequisites: prerequisites.trim(),
      whatYouWillLearn: whatYouWillLearn.split("\n").map((x) => x.trim()).filter(Boolean),
      curriculum: curriculum.split("\n").map((x) => x.trim()).filter(Boolean),
      totalLessons: parseInt(totalLessons, 10) || 0,
      totalHours: parseFloat(totalHours) || 0,
      difficulty,
      maxStudents: parseInt(maxStudents, 10) || 30,
      language,
      previewVideoUrl: previewVideoUrl.trim(),
      materialsIncluded: materialsIncluded.split("\n").map((x) => x.trim()).filter(Boolean),
      faq: faq.split("\n").map((x) => x.trim()).filter(Boolean),
    });
    setSubmitting(false);
    if (res.error) {
      setToast({ message: res.error || t("error"), variant: "error" });
      return;
    }
    setToast({ message: t("success"), variant: "success" });
    setTimeout(() => router.push(`/${locale}/my/profile?tab=mentor`), 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          closeLabel={tCommon("close")}
        />
      )}
      <div className="max-w-lg mx-auto space-y-6">
        <Link
          href={`/${locale}/my/profile?tab=mentor`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("back")}
        </Link>
        <div>
          <SectionTitle title={t("title")} description={t("subtitle")} />
        </div>
        <PlatformCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t("courseTitle")} required>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label={t("type")} required>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={type === "online"}
                    onChange={() => setType("online")}
                  />
                  {t("online")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={type === "offline"}
                    onChange={() => setType("offline")}
                  />
                  {t("offline")}
                </label>
              </div>
            </Field>
            <Field label={t("category")} required>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Field>
            <Field label={t("price")} required>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field label={t("duration")} required>
              <Input
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="예: 8주 / 1일 워크숍"
              />
            </Field>
            <Field label="짧은 소개" required>
              <Textarea
                required
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </Field>
            <Field label={t("description")} required>
              <Textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <div>
              <Field label="대상 학습자" required>
              <Textarea
                required
                rows={2}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
              </Field></div>
            <div>
              <Field label="사전 요구사항">
              <Textarea
                rows={2}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
              />
              </Field></div>
            <div>
              <Field label="학습 포인트(줄바꿈 3개 이상)" required>
              <Textarea
                required
                rows={4}
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
              />
              </Field></div>
            <div>
              <Field label="커리큘럼(줄바꿈)" required>
              <Textarea
                required
                rows={4}
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value)}
              />
              </Field></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">총 레슨 수</label>
                <Input type="number" min={0} value={totalLessons} onChange={(e) => setTotalLessons(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">총 시간(시간)</label>
                <Input type="number" min={0} step="0.5" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">난이도</label>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">최대 수강생</label>
                <Input type="number" min={1} value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">강의 언어</label>
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">미리보기 영상 URL</label>
                <Input value={previewVideoUrl} onChange={(e) => setPreviewVideoUrl(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">제공 자료(줄바꿈)</label>
              <Textarea rows={3} value={materialsIncluded} onChange={(e) => setMaterialsIncluded(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">FAQ(줄바꿈)</label>
              <Textarea rows={3} value={faq} onChange={(e) => setFaq(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("imageUrl")}</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <FormError message={toast?.variant === "error" ? toast.message : ""} />
            <Button
              type="submit"
              disabled={submitting}
              fullWidth
            >
              {submitting ? "…" : t("submit")}
            </Button>
          </form>
        </PlatformCard>
      </div>
    </div>
  );
}
