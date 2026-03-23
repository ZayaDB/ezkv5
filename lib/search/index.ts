import { Mentor, Lecture, CommunityGroup, FreelancerGroup, StudyInfo } from '@/types';
import {
  queryMentors,
  queryLectures,
  queryCommunityGroups,
  queryFreelancerGroups,
  queryStudyInfos,
} from '@/lib/data/queries';

export interface SearchResult {
  type: 'mentor' | 'lecture' | 'community' | 'freelancer' | 'studyInfo';
  id: string;
  title: string;
  description: string;
  url: string;
}

function match(q: string, ...fields: (string | undefined)[]): boolean {
  const lower = q.toLowerCase();
  return fields.some((f) => (f || '').toLowerCase().includes(lower));
}

export async function searchContent(query: string, locale: string = 'kr'): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const lowerQuery = trimmed.toLowerCase();
  const results: SearchResult[] = [];

  const [{ mentors }, { lectures }, communities, freelancers, studyItems] = await Promise.all([
    queryMentors({ limit: 80 }),
    queryLectures({ limit: 80 }),
    queryCommunityGroups({ limit: 80 }),
    queryFreelancerGroups({ limit: 80 }),
    queryStudyInfos(),
  ]);

  mentors.forEach((mentor: Mentor) => {
    if (
      match(
        lowerQuery,
        mentor.name,
        mentor.title,
        mentor.bio,
        mentor.specialties.join(' '),
        mentor.location
      )
    ) {
      results.push({
        type: 'mentor',
        id: mentor.id,
        title: mentor.name,
        description: mentor.title,
        url: `/${locale}/mentors/${mentor.id}`,
      });
    }
  });

  lectures.forEach((lecture: Lecture) => {
    if (
      match(
        lowerQuery,
        lecture.title,
        lecture.instructor,
        lecture.category,
        lecture.description
      )
    ) {
      results.push({
        type: 'lecture',
        id: lecture.id,
        title: lecture.title,
        description: lecture.instructor,
        url: `/${locale}/lectures/${lecture.id}`,
      });
    }
  });

  communities.forEach((group: CommunityGroup) => {
    if (
      match(lowerQuery, group.name, group.description, group.category, group.tags.join(' '))
    ) {
      results.push({
        type: 'community',
        id: group.id,
        title: group.name,
        description: group.description,
        url: `/${locale}/community/${group.id}`,
      });
    }
  });

  freelancers.forEach((group: FreelancerGroup) => {
    if (match(lowerQuery, group.name, group.description, group.category)) {
      results.push({
        type: 'freelancer',
        id: group.id,
        title: group.name,
        description: group.description,
        url: `/${locale}/freelancers/${group.id}`,
      });
    }
  });

  studyItems.forEach((info: StudyInfo) => {
    if (
      match(
        lowerQuery,
        info.title,
        info.content,
        info.tags.join(' '),
        info.category
      )
    ) {
      results.push({
        type: 'studyInfo',
        id: info.id,
        title: info.title,
        description: info.content.substring(0, 120),
        url: `/${locale}/study-in-korea#article-${info.id}`,
      });
    }
  });

  return results.slice(0, 12);
}
