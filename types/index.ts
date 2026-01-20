export interface Mentor {
  id: string;
  name: string;
  title: string;
  location: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  specialties: string[];
  price: number | 'Free';
  availability: 'available' | 'limited' | 'unavailable';
  photo: string;
  verified: boolean;
  bio: string;
}

export interface Lecture {
  id: string;
  title: string;
  instructor: string;
  type: 'online' | 'offline';
  category: string;
  price: number;
  duration: string;
  rating: number;
  students: number;
  image: string;
  description: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  image: string;
  tags: string[];
}

export interface FreelancerGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  image: string;
  jobsPosted: number;
}

export interface StudyInfo {
  id: string;
  category: 'visa' | 'housing' | 'hospital' | 'lifeTips';
  title: string;
  content: string;
  image?: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}



