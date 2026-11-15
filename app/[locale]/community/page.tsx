export const revalidate = 300;

import { setRequestLocale } from "next-intl/server";
import { queryCommunityGroups } from "@/lib/data/queries";
import CommunityHome from "@/components/community/CommunityHome";
import type { CommunityGroup } from "@/types";

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let groups: CommunityGroup[] = [];
  try {
    groups = await queryCommunityGroups({ limit: 200 });
  } catch {
    groups = [];
  }
  // ?tab= is read on the client so this page stays cacheable.
  return <CommunityHome groups={groups} />;
}
