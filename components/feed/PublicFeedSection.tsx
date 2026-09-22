"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { publicFeedApi, type PublicFeedKind } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";

type PostRow = {
  id: string;
  body: string;
  attachmentUrls: string[];
  createdAt: string;
  author: { id: string; name: string };
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
};

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
};

export default function PublicFeedSection({
  feedType,
  compose = false,
  authorId,
  emptyLabel,
  hideAuthor = false,
}: {
  feedType: PublicFeedKind;
  compose?: boolean;
  authorId?: string;
  emptyLabel?: string;
  hideAuthor?: boolean;
}) {
  const t = useTranslations("publicFeed");
  const fmt = useFormatter();
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentRow[]>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await publicFeedApi.list(feedType, authorId ? { authorId } : undefined);
    setPosts((res.data?.posts || []) as PostRow[]);
    setLoading(false);
  }, [feedType, authorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadComments = async (postId: string) => {
    const res = await publicFeedApi.listComments(feedType, postId);
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (res.data?.comments || []) as CommentRow[],
    }));
  };

  const toggleOpen = (postId: string) => {
    if (openId === postId) {
      setOpenId(null);
      return;
    }
    setOpenId(postId);
    if (!commentsByPost[postId]) void loadComments(postId);
  };

  const submitComment = async (postId: string) => {
    const text = (draft[postId] || "").trim();
    if (!text || !isAuthenticated) return;
    setSubmitting(postId);
    const res = await publicFeedApi.addComment(feedType, postId, text);
    setSubmitting(null);
    if (res.error) {
      alert(res.error);
      return;
    }
    setDraft((d) => ({ ...d, [postId]: "" }));
    await loadComments(postId);
    await load();
  };

  const onLike = async (postId: string) => {
    if (!isAuthenticated) return;
    const res = await publicFeedApi.toggleLike(feedType, postId);
    if (res.error) {
      alert(res.error);
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likeCount: res.data?.likeCount ?? p.likeCount, likedByMe: res.data?.likedByMe ?? false }
          : p
      )
    );
  };

  const submitPost = async () => {
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    setMsg("");
    const res = await publicFeedApi.create(feedType, { body: text });
    setPosting(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    setBody("");
    setMsg(t("posted"));
    await load();
  };

  return (
    <div className="space-y-4">
      {compose && isAuthenticated ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={t("bodyPlaceholder")}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-zinc-500">{msg}</p>
            <button
              type="button"
              disabled={posting}
              onClick={() => void submitPost()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {posting ? t("posting") : t("writeTitle")}
            </button>
          </div>
        </div>
      ) : compose && !isAuthenticated ? (
        <p className="text-sm text-zinc-500 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
          {t("loginToComment")}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500 py-6">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-slate-400 py-4 bg-zinc-50 dark:bg-slate-900 rounded-xl px-4 border border-zinc-100 dark:border-slate-800">
          {emptyLabel || t("empty")}
        </p>
      ) : (
        posts.map((p) => (
          <article key={p.id} className="rounded-2xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <header className="flex items-start gap-3 mb-3">
              {hideAuthor ? (
                <p className="text-xs text-zinc-500">
                  {fmt.dateTime(new Date(p.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                </p>
              ) : (
                <>
                  <Link
                    href={`/${locale}/users/${p.author.id}`}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0"
                  >
                    {(p.author.name || "?").charAt(0).toUpperCase()}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${locale}/users/${p.author.id}`}
                      className="font-semibold text-zinc-900 dark:text-white hover:text-primary-600"
                    >
                      {p.author.name}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {fmt.dateTime(new Date(p.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </>
              )}
            </header>
            <p className="text-sm text-zinc-800 dark:text-slate-200 whitespace-pre-wrap mb-3">{p.body}</p>
            {p.attachmentUrls?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {p.attachmentUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <Image
                      src={url}
                      alt=""
                      width={200}
                      height={200}
                      className="max-h-48 w-auto rounded-lg border border-zinc-100 object-cover"
                      unoptimized
                    />
                  </a>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => void onLike(p.id)}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                  p.likedByMe ? "text-rose-600" : "text-zinc-600 dark:text-slate-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${p.likedByMe ? "fill-current" : ""}`} />
                {p.likeCount}
              </button>
              <button
                type="button"
                onClick={() => toggleOpen(p.id)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600"
              >
                <MessageCircle className="w-4 h-4" />
                {t("comments")} ({p.commentCount})
              </button>
            </div>
            {openId === p.id && (
              <div className="mt-4 space-y-3 border-t border-zinc-100 dark:border-slate-800 pt-4">
                {(commentsByPost[p.id] || []).map((c) => (
                  <div key={c.id} className="rounded-lg bg-zinc-50 dark:bg-slate-800 px-3 py-2 text-sm">
                    <Link
                      href={`/${locale}/users/${c.author.id}`}
                      className="font-semibold text-zinc-800 dark:text-slate-100 hover:text-primary-600"
                    >
                      {c.author.name}
                    </Link>
                    <span className="text-zinc-400 text-xs ml-2">
                      {fmt.dateTime(new Date(c.createdAt), { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    <p className="text-zinc-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={draft[p.id] || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                      rows={2}
                      placeholder={t("commentPlaceholder")}
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={submitting === p.id}
                      onClick={() => void submitComment(p.id)}
                      className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {submitting === p.id ? "…" : t("commentSubmit")}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">{t("loginToComment")}</p>
                )}
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
}
