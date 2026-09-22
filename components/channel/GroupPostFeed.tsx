"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { channelFeedApi, type ChannelFeedKind } from "@/lib/api/client";

type PostRow = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
};

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
};

export default function GroupPostFeed({
  channel,
  channelId,
}: {
  channel: ChannelFeedKind;
  channelId: string;
}) {
  const t = useTranslations("channelFeed");
  const fmt = useFormatter();
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentRow[]>>({});
  const [loadingComments, setLoadingComments] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const res = await channelFeedApi.listPosts(channel, channelId);
    setPosts((res.data?.posts || []) as PostRow[]);
    setLoading(false);
  }, [channel, channelId]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const loadComments = async (postId: string) => {
    setLoadingComments(postId);
    const res = await channelFeedApi.listComments(channel, channelId, postId);
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (res.data?.comments || []) as CommentRow[],
    }));
    setLoadingComments(null);
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
    const text = (commentDraft[postId] || "").trim();
    if (!text || !isAuthenticated) return;
    setSubmitting(postId);
    const res = await channelFeedApi.addComment(channel, channelId, postId, text);
    setSubmitting(null);
    if (res.error) {
      alert(res.error);
      return;
    }
    setCommentDraft((d) => ({ ...d, [postId]: "" }));
    await loadComments(postId);
  };

  const submitPost = async () => {
    const tTitle = title.trim() || "글";
    const tBody = body.trim();
    if (!tBody || posting) return;
    setPosting(true);
    setPostErr("");
    const res = await channelFeedApi.createPost(channel, channelId, { title: tTitle, body: tBody });
    setPosting(false);
    if (res.error) {
      setPostErr(res.error);
      return;
    }
    setTitle("");
    setBody("");
    await loadPosts();
  };

  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={t("bodyPlaceholder")}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
          {postErr ? <p className="text-xs text-red-600">{postErr}</p> : null}
          <button
            type="button"
            disabled={posting}
            onClick={() => void submitPost()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {posting ? "…" : t("writePost")}
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">{t("loginToComment")}</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 py-6">{t("loading")}</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-600 py-4 bg-gray-50 rounded-xl px-4 border border-gray-100">
          {t("empty")}
        </p>
      ) : (
        posts.map((p) => (
          <div key={p.id} className="p-5 bg-white rounded-xl border border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {fmt.dateTime(new Date(p.createdAt), { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{p.body}</p>
            <Link
              href={`/${locale}/users/${p.author.id}`}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              {p.author.name}
            </Link>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => toggleOpen(p.id)}
                className="text-sm font-semibold text-primary-600 hover:underline"
              >
                {openId === p.id ? t("hideComments") : t("comments")}
                {commentsByPost[p.id] != null ? ` (${commentsByPost[p.id].length})` : ""}
              </button>
            </div>
            {openId === p.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                {loadingComments === p.id ? (
                  <p className="text-xs text-gray-500">{t("loading")}</p>
                ) : (
                  (commentsByPost[p.id] || []).map((c) => (
                    <div key={c.id} className="rounded-lg bg-gray-50 p-3">
                      <Link
                        href={`/${locale}/users/${c.author.id}`}
                        className="text-xs font-semibold text-gray-800 hover:text-primary-600"
                      >
                        {c.author.name}
                      </Link>
                      <span className="font-normal text-gray-400 ml-2 text-xs">
                        {fmt.dateTime(new Date(c.createdAt), { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{c.body}</p>
                    </div>
                  ))
                )}
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={commentDraft[p.id] || ""}
                      onChange={(e) =>
                        setCommentDraft((d) => ({ ...d, [p.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder={t("addCommentPlaceholder")}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={submitting === p.id}
                      onClick={() => void submitComment(p.id)}
                      className="self-start rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                    >
                      {submitting === p.id ? "…" : t("submitComment")}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">{t("loginToComment")}</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
