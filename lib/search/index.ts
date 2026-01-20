import { Mentor, Lecture, CommunityGroup, FreelancerGroup, StudyInfo } from '@/types';
import { mockMentors, mockLectures, mockCommunityGroups, mockFreelancerGroups, mockStudyInfo } from '@/data/mockData';

export interface SearchResult {
  type: 'mentor' | 'lecture' | 'community' | 'freelancer' | 'studyInfo';
  id: string;
  title: string;
  description: string;
  url: string;
}

export function searchContent(query: string, locale: string = 'kr'): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search mentors
  mockMentors.forEach((mentor) => {
    if (
      mentor.name.toLowerCase().includes(lowerQuery) ||
      mentor.title.toLowerCase().includes(lowerQuery) ||
      mentor.specialties.some((s) => s.toLowerCase().includes(lowerQuery)) ||
      mentor.bio.toLowerCase().includes(lowerQuery)
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

  // Search lectures
  mockLectures.forEach((lecture) => {
    if (
      lecture.title.toLowerCase().includes(lowerQuery) ||
      lecture.instructor.toLowerCase().includes(lowerQuery) ||
      lecture.category.toLowerCase().includes(lowerQuery) ||
      lecture.description.toLowerCase().includes(lowerQuery)
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

  // Search community groups
  mockCommunityGroups.forEach((group) => {
    if (
      group.name.toLowerCase().includes(lowerQuery) ||
      group.description.toLowerCase().includes(lowerQuery) ||
      group.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
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

  // Search freelancer groups
  mockFreelancerGroups.forEach((group) => {
    if (
      group.name.toLowerCase().includes(lowerQuery) ||
      group.description.toLowerCase().includes(lowerQuery) ||
      group.category.toLowerCase().includes(lowerQuery)
    ) {
      results.push({
        type: 'freelancer',
        id: group.id,
        title: group.name,
        description: group.description,
        url: `/${locale}/freelancers/${group.id}`,
      });
    }
  });

  // Search study info
  mockStudyInfo.forEach((info) => {
    if (
      info.title.toLowerCase().includes(lowerQuery) ||
      info.content.toLowerCase().includes(lowerQuery) ||
      info.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    ) {
      results.push({
        type: 'studyInfo',
        id: info.id,
        title: info.title,
        description: info.content.substring(0, 100),
        url: `/${locale}/study-in-korea#${info.category}`,
      });
    }
  });

  return results.slice(0, 10); // Limit to 10 results
}



