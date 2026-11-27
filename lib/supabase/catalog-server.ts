import { createPublicSupabase } from "@/lib/supabase/public";
import {
  queryCommunityByIdWith,
  queryCommunityGroupsWith,
  queryFreelancerByIdWith,
  queryFreelancerGroupsWith,
  queryStudyInfosWith,
  queryStudyInfoByIdWith,
} from "@/lib/supabase/catalog-core";
import type { StudyInfo } from "@/types";

export async function queryCommunityGroups(options?: { category?: string; limit?: number; locale?: string }) {
  const supabase = createPublicSupabase();
  return queryCommunityGroupsWith(supabase, options);
}

export async function queryCommunityById(id: string, locale?: string) {
  const supabase = createPublicSupabase();
  return queryCommunityByIdWith(supabase, id, locale);
}

export async function queryFreelancerGroups(options?: { category?: string; limit?: number; locale?: string }) {
  const supabase = createPublicSupabase();
  return queryFreelancerGroupsWith(supabase, options);
}

export async function queryFreelancerById(id: string, locale?: string) {
  const supabase = createPublicSupabase();
  return queryFreelancerByIdWith(supabase, id, locale);
}

export async function queryStudyInfoById(id: string, locale?: string) {
  const supabase = createPublicSupabase();
  return queryStudyInfoByIdWith(supabase, id, locale);
}

export async function queryStudyInfos(options?: { category?: StudyInfo["category"]; locale?: string }) {
  const supabase = createPublicSupabase();
  return queryStudyInfosWith(supabase, options);
}
