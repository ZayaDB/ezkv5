"use client";

import { useState } from "react";
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
  const { user, loading: authLoading } = useAuth();
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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    setToast({ message: t("successPending"), variant: "success" });
    setTimeout(() => router.push(`/${locale}/my/lectures`), 800);
  };

  const handleImageUpload = async (file?: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    const res = await lecturesApi.uploadImage(file);
    setUploadingImage(false);
    if ("error" in res) {
      setToast({ message: res.error || t("imageUploadFail"), variant: "error" });
      return;
    }
    setImage(res.data.url);
    setToast({ message: t("imageUploadOk"), variant: "success" });
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
                placeholder={t("durationPlaceholder")}
              />
            </Field>
            <Field label={t("shortDescription")} required>
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
            <Field label={t("targetAudience")} required>
              <Textarea
                required
                rows={2}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </Field>
            <Field label={t("prerequisites")}>
              <Textarea
                rows={2}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
              />
            </Field>
            <Field label={t("whatYouWillLearn")} required>
              <Textarea
                required
                rows={4}
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
              />
            </Field>
            <Field label={t("curriculum")} required>
              <Textarea
                required
                rows={4}
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("totalLessons")}</label>
                <Input type="number" min={0} value={totalLessons} onChange={(e) => setTotalLessons(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("totalHours")}</label>
                <Input type="number" min={0} step="0.5" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("difficulty")}</label>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="beginner">{t("beginner")}</option>
                  <option value="intermediate">{t("intermediate")}</option>
                  <option value="advanced">{t("advanced")}</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("maxStudents")}</label>
                <Input type="number" min={1} value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("language")}</label>
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("previewVideoUrl")}</label>
                <Input value={previewVideoUrl} onChange={(e) => setPreviewVideoUrl(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("materialsIncluded")}</label>
              <Textarea rows={3} value={materialsIncluded} onChange={(e) => setMaterialsIncluded(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("faq")}</label>
              <Textarea rows={3} value={faq} onChange={(e) => setFaq(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("imageUrl")}</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {uploadingImage ? t("imageUploading") : t("imageUpload")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => void handleImageUpload(e.target.files?.[0])}
                  />
                </label>
                <span className="text-xs text-slate-500">{t("imageHint")}</span>
              </div>
              {image && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={t("imagePreviewAlt")} className="h-36 w-full object-cover" />
                </div>
              )}
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
