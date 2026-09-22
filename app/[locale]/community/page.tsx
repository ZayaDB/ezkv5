import { queryCommunityGroups } from "@/lib/data/queries";
import CommunityHome from "@/components/community/CommunityHome";
import type { CommunityGroup } from "@/types";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "jobs" || sp.tab === "groups" ? sp.tab : "feed";
  let groups: CommunityGroup[] = [];
  try {
    groups = await queryCommunityGroups({ limit: 200 });
  } catch {
    groups = [];
  }
  return <CommunityHome groups={groups} initialTab={tab} />;
}
