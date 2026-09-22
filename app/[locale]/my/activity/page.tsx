"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import LoadingState from "@/components/ui/LoadingState";
import { publicFeedApi, communityApi, contentApi, type PublicFeedKind } from "@/lib/api/client";

type MyPost = {
  id: string;
  body: string;
  feedType: string;
  createdAt: string;
};

export default function MyActivityPage() {
  const t = useTranslations("myPages.activity");
  const tFeed = useTranslations("publicFeed");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const tComm = useTranslations("community");
  const [feedType, setFeedType] = useState<PublicFeedKind>("community");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [mine, setMine] = useState<MyPost[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCat, setGroupCat] = useState("모임");
  const [creating, setCreating] = useState(false);
  const [groupMsg, setGroupMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [myGroups, setMyGroups] = useState<{ id: string; name: string; category: string }[]>([]);

  const loadMine = useCallback(async () => {
    if (!user?.id) return;
    const [c, f, mem] = await Promise.all([
      publicFeedApi.list("community"),
      publicFeedApi.list("freelancer"),
      communityApi.getMyMemberships(),
    ]);
    const all = [
      ...((c.data?.posts || []) as { id: string; body: string; createdAt: string; author?: { id: string } }[]).map(
        (p) => ({ ...p, feedType: "community" })
      ),
      ...((f.data?.posts || []) as { id: string; body: string; createdAt: string; author?: { id: string } }[]).map(
        (p) => ({ ...p, feedType: "freelancer" })
      ),
    ];
    setMine(
      all
        .filter((p) => p.author?.id === user.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 20)
    );
    const memberships = (mem.data?.memberships || []) as {
      group: { id: string; name: string; category: string } | null;
    }[];
    setMyGroups(
      memberships
        .map((m) => m.group)
        .filter((g): g is { id: string; name: string; category: string } => Boolean(g))
    );
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (user) void loadMine();
  }, [user, loadMine]);

  const submitPost = async () => {
    setMsg(null);
    const bo = body.trim();
    if (!bo) {
      setMsg({ type: "err", text: t("postErr") });
      return;
    }
    setSubmitting(true);
    const res = await publicFeedApi.create(feedType, { body: bo });
    setSubmitting(false);
    if (res.error) {
      setMsg({ type: "err", text: res.error });
      return;
    }
    setBody("");
    setMsg({ type: "ok", text: t("postOkCommunity") });
    await loadMine();
  };

  const createGroup = async () => {
    setGroupMsg(null);
    if (!groupName.trim()) {
      setGroupMsg({ type: "err", text: t("groupNameErr") });
      return;
    }
    setCreating(true);
    const res = await contentApi.createCommunityGroup({
      name: groupName,
      description: groupDesc,
      category: groupCat,
    });
    setCreating(false);
    if (res.error) {
      setGroupMsg({ type: "err", text: res.error });
      return;
    }
    setGroupName("");
    setGroupDesc("");
    setGroupMsg({ type: "ok", text: t("groupOkCommunity") });
    await loadMine();
  };

  if (authLoading || !user) {
    return <LoadingState />;
  }

  const viewHref =
    feedType === "freelancer"
      ? `/${locale}/community?tab=jobs`
      : `/${locale}/community`;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm text-zinc-600 mt-1">{t("subtitlePublic")}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFeedType("community")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              feedType === "community" ? "bg-primary-600 text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {t("channelCommunity")}
          </button>
          <button
            type="button"
            onClick={() => setFeedType("freelancer")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              feedType === "freelancer" ? "bg-primary-600 text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {t("channelJobs")}
          </button>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder={tFeed("bodyPlaceholder")}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
        {msg && (
          <p className={`text-sm font-medium ${msg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
            {msg.text}{" "}
            {msg.type === "ok" ? (
              <Link href={viewHref} className="underline">
                {t("viewOnCommunity")}
              </Link>
            ) : null}
          </p>
        )}
        <button
          type="button"
          disabled={submitting}
          onClick={() => void submitPost()}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? tFeed("posting") : t("submitPost")}
        </button>
      </div>

      <div>
        <h2 className="text-sm font-bold text-zinc-900 mb-3">{t("myPosts")}</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("myPostsEmpty")}</p>
        ) : (
          <ul className="space-y-3">
            {mine.map((p) => (
              <li key={p.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs text-zinc-500 mb-1">
                  {p.feedType === "freelancer" ? t("channelJobs") : t("channelCommunity")}
                </p>
                <p className="text-sm text-zinc-800 whitespace-pre-wrap">{p.body}</p>
              </li>
            ))}
          </ul>
        )}
        <Link href={`/${locale}/community`} className="inline-block mt-4 text-sm font-semibold text-primary-600">
          {t("viewOnCommunity")}
        </Link>
      </div>

      <div id="group" className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-bold text-zinc-900">{tComm("createGroup")}</h2>
        <p className="text-sm text-zinc-600">{t("groupHint")}</p>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder={tComm("groupName")}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
        <textarea
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
          placeholder={tComm("groupDesc")}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
        <select
          value={groupCat}
          onChange={(e) => setGroupCat(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="모임">{tComm("catMeetup")}</option>
          <option value="비자">{tComm("catVisa")}</option>
          <option value="공부">{tComm("catStudy")}</option>
          <option value="구인">{tComm("catJob")}</option>
        </select>
        {groupMsg && (
          <p className={`text-sm font-medium ${groupMsg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
            {groupMsg.text}{" "}
            {groupMsg.type === "ok" ? (
              <Link href={`/${locale}/community?tab=groups`} className="underline">
                {t("viewGroups")}
              </Link>
            ) : null}
          </p>
        )}
        <button
          type="button"
          disabled={creating}
          onClick={() => void createGroup()}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {creating ? "…" : tComm("createGroup")}
        </button>
      </div>

      <div>
        <h2 className="text-sm font-bold text-zinc-900 mb-3">{t("myGroups")}</h2>
        {myGroups.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("myGroupsEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {myGroups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/${locale}/community/${g.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:border-primary-300"
                >
                  {g.name}
                  <span className="ml-2 text-xs font-normal text-zinc-500">{g.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
