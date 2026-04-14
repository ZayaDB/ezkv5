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
    router.replace(`/${locale}/profile?tab=mentor`);
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
    });
    setSubmitting(false);
    if (res.error) {
      setToast({ message: res.error || t("error"), variant: "error" });
      return;
    }
    setToast({ message: t("success"), variant: "success" });
    setTimeout(() => router.push(`/${locale}/profile?tab=mentor`), 800);
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
          href={`/${locale}/profile?tab=mentor`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("back")}
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-600 mt-1">{t("subtitle")}</p>
        </div>
        <PlatformCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("courseTitle")}</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1">{t("type")}</span>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("category")}</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("price")}</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("duration")}</label>
              <input
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="예: 8주 / 1일 워크숍"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("description")}</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("imageUrl")}</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? "…" : t("submit")}
            </button>
          </form>
        </PlatformCard>
      </div>
    </div>
  );
}
