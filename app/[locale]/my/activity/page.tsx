"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import PlatformCard from "@/components/ui/PlatformCard";
import LoadingState from "@/components/ui/LoadingState";
import { BookMarked, ChevronRight, MessageSquare, PenLine, Wallet } from "lucide-react";
import { publicFeedApi, type PublicFeedKind } from "@/lib/api/client";

export default function MyActivityPage() {
  const t = useTranslations("myPages.activity");
  const tFeed = useTranslations("publicFeed");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const composeRef = useRef<HTMLDivElement>(null);
  const [feedType, setFeedType] = useState<PublicFeedKind>("community");
  const [body, setBody] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const scrollToWrite = () => {
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setMsg(null);
    const next: string[] = [...urls];
    for (let i = 0; i < files.length && next.length < 10; i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) continue;
      const res = await publicFeedApi.uploadFile(f);
      if ("error" in res && res.error) {
        setMsg({ type: "err", text: res.error });
        break;
      }
      if ("data" in res && res.data?.url) next.push(res.data.url);
    }
    setUrls(next);
    setUploading(false);
    e.target.value = "";
  };

  const submitPost = async () => {
    setMsg(null);
    const bo = body.trim();
    if (!bo) {
      setMsg({ type: "err", text: t("postErr") });
      return;
    }
    setSubmitting(true);
    const res = await publicFeedApi.create(feedType, { body: bo, attachmentUrls: urls });
    setSubmitting(false);
    if (res.error) {
      setMsg({ type: "err", text: res.error });
      return;
    }
    setBody("");
    setUrls([]);
    setMsg({ type: "ok", text: tFeed("posted") });
  };

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  if (authLoading || !user) {
    return <LoadingState />;
  }

  const links = [
    {
      href: `/${locale}/community`,
      title: t("quickCommunityBrowse"),
      icon: MessageSquare,
    },
    {
      href: `/${locale}/freelancers`,
      title: t("quickFreelancersBrowse"),
      icon: Wallet,
    },
    {
      href: `/${locale}/my/courses`,
      title: t("quickCourses"),
      icon: BookMarked,
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
          <p className="text-sm text-zinc-600 mt-1">{t("subtitlePublic")}</p>
        </div>
        <button
          type="button"
          onClick={scrollToWrite}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          <PenLine className="w-4 h-4" />
          {tFeed("writeTitle")}
        </button>
      </div>

      <div ref={composeRef} id="write">
        <PlatformCard padding="lg">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1 flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary-600" />
            {tFeed("writeTitle")}
          </h2>
          <p className="text-sm text-zinc-600 mb-4">{tFeed("writeHint")}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">{t("channelType")}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFeedType("community")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    feedType === "community"
                      ? "bg-primary-600 text-white"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {t("channelCommunity")}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedType("freelancer")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    feedType === "freelancer"
                      ? "bg-primary-600 text-white"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {t("channelFreelancer")}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">{t("bodyField")}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder={tFeed("bodyPlaceholder")}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">{tFeed("attach")}</label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading || urls.length >= 10}
                onChange={(e) => void onFiles(e)}
                className="block w-full text-sm text-zinc-600"
              />
              {urls.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                  {urls.map((u) => (
                    <li key={u} className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1">
                      <span className="max-w-[180px] truncate">{u}</span>
                      <button
                        type="button"
                        className="text-red-600 font-semibold"
                        onClick={() => setUrls((prev) => prev.filter((x) => x !== u))}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {msg && (
              <p className={`text-sm font-medium ${msg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
                {msg.text}
              </p>
            )}
            <button
              type="button"
              disabled={submitting || uploading}
              onClick={() => void submitPost()}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting || uploading ? tFeed("posting") : t("submitPost")}
            </button>
          </div>
        </PlatformCard>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Quick</p>
        <div className="space-y-3">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <PlatformCard className="flex items-center justify-between gap-3 hover:border-primary-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-zinc-900">{item.title}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </PlatformCard>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
