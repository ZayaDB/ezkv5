import { createServerSupabase } from "@/lib/supabase/server";
import {
  queryCommunityByIdWith,
  queryCommunityGroupsWith,
  queryFreelancerByIdWith,
  queryFreelancerGroupsWith,
  queryStudyInfosWith,
} from "@/lib/supabase/catalog-core";
import type { StudyInfo } from "@/types";

export async function queryCommunityGroups(options?: { category?: string; limit?: number }) {
  const supabase = await createServerSupabase();
  return queryCommunityGroupsWith(supabase, options);
}

export async function queryCommunityById(id: string) {
  const supabase = await createServerSupabase();
  return queryCommunityByIdWith(supabase, id);
}

export async function queryFreelancerGroups(options?: { category?: string; limit?: number }) {
  const supabase = await createServerSupabase();
  return queryFreelancerGroupsWith(supabase, options);
}

export async function queryFreelancerById(id: string) {
  const supabase = await createServerSupabase();
  return queryFreelancerByIdWith(supabase, id);
}

export async function queryStudyInfos(options?: { category?: StudyInfo["category"] }) {
  const supabase = await createServerSupabase();
  return queryStudyInfosWith(supabase, options);
}
