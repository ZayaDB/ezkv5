"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { contentApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CommunityGroup } from "@/types";
import GroupPostFeed from "@/components/channel/GroupPostFeed";
import CommunityGroupChat from "@/components/community/CommunityGroupChat";

export default function CommunityDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("community");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const [group, setGroup] = useState<CommunityGroup | null | undefined>(undefined);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  const load = useCallback(async () => {
    const res = await contentApi.getCommunity(id);
    if (res.error || !res.data) {
      setGroup(null);
      return;
    }
    setGroup(res.data as CommunityGroup);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (joining) return;
    setJoining(true);
    setJoinMessage("");
    const res = await contentApi.joinCommunity(id);
    setJoining(false);
    if (res.error) {
      setJoinMessage(res.error);
      return;
    }
    setJoinMessage(t("joinSuccess"));
  };

  if (group === undefined) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-bold text-gray-900 mb-3">{t("notFound")}</p>
          <Link href={`/${locale}/community`} className="text-primary-600 font-semibold hover:underline">
            {t("backToList")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href={`/${locale}/community`}
            className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("backToList")}
          </Link>
          <p className="text-xs font-semibold text-primary-600 mb-1">{group.category}</p>
          <h1 className="text-2xl font-bold text-zinc-900">{group.name}</h1>
          <p className="text-sm text-zinc-600 mt-2">{group.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleJoin()}
              disabled={joining}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {joining ? "…" : t("join")}
            </button>
            {joinMessage ? <p className="text-sm text-primary-700">{joinMessage}</p> : null}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <CommunityGroupChat groupId={id} />
        <section>
          <h2 className="text-sm font-bold text-zinc-900 mb-3">{t("groupPosts")}</h2>
          <GroupPostFeed channel="community" channelId={id} />
        </section>
      </div>
    </div>
  );
}
