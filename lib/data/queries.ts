import connectDB from '@/lib/db/mongodb';
import MentorModel from '@/models/Mentor';
import LectureModel from '@/models/Lecture';
import CommunityGroupModel from '@/models/CommunityGroup';
import FreelancerGroupModel from '@/models/FreelancerGroup';
import StudyInfoModel from '@/models/StudyInfo';
import type {
  Mentor as MentorDTO,
  Lecture,
  CommunityGroup,
  FreelancerGroup,
  StudyInfo,
} from '@/types';

function mentorDisplayName(userId: unknown): string {
  if (userId && typeof userId === 'object' && userId !== null && 'name' in userId) {
    const n = (userId as { name?: string }).name;
    if (n) return n;
  }
  return '멘토';
}

function mentorUserIdField(userId: unknown): string | undefined {
  if (!userId) return undefined;
  if (typeof userId === 'object' && userId !== null && '_id' in userId) {
    return String((userId as { _id: unknown })._id);
  }
  return String(userId);
}

export function docToMentor(mentor: Record<string, unknown>): MentorDTO {
  const uid = mentor.userId as Record<string, unknown> | undefined;
  const photo =
    (mentor.photo as string | undefined) ||
    (uid && typeof uid === 'object' && 'avatar' in uid ? (uid.avatar as string | undefined) : undefined);

  return {
    id: String(mentor._id),
    userId: mentorUserIdField(mentor.userId),
    name: mentorDisplayName(uid),
    title: String(mentor.title || ''),
    location: String(mentor.location || ''),
    languages: Array.isArray(mentor.languages) ? (mentor.languages as string[]) : [],
    rating: Number(mentor.rating) || 0,
    reviewCount: Number(mentor.reviewCount) || 0,
    specialties: Array.isArray(mentor.specialties) ? (mentor.specialties as string[]) : [],
    price: mentor.price as number | 'Free',
    availability: (mentor.availability as MentorDTO['availability']) || 'available',
    photo: photo || undefined,
    verified: Boolean(mentor.verified),
    bio: String(mentor.bio || ''),
  };
}

export function docToLecture(
  doc: Record<string, unknown>,
  instructorName: string
): Lecture {
  return {
    id: String(doc._id),
    title: String(doc.title || ''),
    instructor: instructorName,
    type: doc.type as Lecture['type'],
    category: String(doc.category || ''),
    price: Number(doc.price) || 0,
    duration: String(doc.duration || ''),
    rating: Number(doc.rating) || 0,
    students: Number(doc.students) || 0,
    image: String(doc.image || ''),
    description: String(doc.description || ''),
  };
}

export function docToCommunity(doc: Record<string, unknown>): CommunityGroup {
  return {
    id: String(doc._id),
    name: String(doc.name || ''),
    description: String(doc.description || ''),
    members: Number(doc.members) || 0,
    category: String(doc.category || ''),
    image: String(doc.image || ''),
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
  };
}

export function docToFreelancer(doc: Record<string, unknown>): FreelancerGroup {
  return {
    id: String(doc._id),
    name: String(doc.name || ''),
    description: String(doc.description || ''),
    members: Number(doc.members) || 0,
    category: String(doc.category || ''),
    image: String(doc.image || ''),
    jobsPosted: Number(doc.jobsPosted) || 0,
  };
}

export function docToStudyInfo(doc: Record<string, unknown>): StudyInfo {
  return {
    id: String(doc._id),
    category: doc.category as StudyInfo['category'],
    title: String(doc.title || ''),
    content: String(doc.content || ''),
    image: doc.image ? String(doc.image) : undefined,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
  };
}

export async function queryMentors(options?: {
  category?: string | null;
  location?: string;
  specialty?: string;
  page?: number;
  limit?: number;
}): Promise<{ mentors: MentorDTO[]; total: number; page: number; limit: number }> {
  await connectDB();
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 100;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (options?.category) {
    filter.specialties = { $in: [options.category] };
  }
  if (options?.location) {
    filter.location = { $regex: options.location, $options: 'i' };
  }
  if (options?.specialty) {
    filter.specialties = { $in: [options.specialty] };
  }

  const approvedOnly = {
    $or: [
      { approvalStatus: 'approved' },
      { approvalStatus: { $exists: false } },
    ],
  };
  const mergedFilter =
    Object.keys(filter).length > 0 ? { $and: [filter, approvedOnly] } : approvedOnly;

  const raw = await MentorModel.find(mergedFilter)
    .populate('userId', 'name email avatar')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MentorModel.countDocuments(mergedFilter);
  return {
    mentors: raw.map((m) => docToMentor(m as Record<string, unknown>)),
    total,
    page,
    limit,
  };
}

export async function queryMentorById(id: string): Promise<MentorDTO | null> {
  await connectDB();
  const mentor = await MentorModel.findById(id).populate('userId', 'name email avatar').lean();
  if (!mentor) return null;
  const row = mentor as Record<string, unknown>;
  const st = row.approvalStatus as string | undefined;
  if (st && st !== 'approved') return null;
  return docToMentor(row);
}

export async function queryLectures(options?: {
  type?: 'online' | 'offline' | null;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ lectures: Lecture[]; total: number }> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (options?.type) filter.type = options.type;
  if (options?.category) filter.category = options.category;

  const page = options?.page ?? 1;
  const limit = options?.limit ?? 100;
  const skip = (page - 1) * limit;

  const raw = await LectureModel.find(filter)
    .populate('instructorId', 'name')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await LectureModel.countDocuments(filter);
  const lectures = raw.map((row) => {
    const r = row as Record<string, unknown>;
    const ins = r.instructorId as { name?: string } | undefined;
    return docToLecture(r, ins?.name || '강사');
  });
  return { lectures, total };
}

export async function queryLectureById(id: string): Promise<Lecture | null> {
  await connectDB();
  const row = await LectureModel.findById(id).populate('instructorId', 'name').lean();
  if (!row) return null;
  const r = row as Record<string, unknown>;
  const ins = r.instructorId as { name?: string } | undefined;
  return docToLecture(r, ins?.name || '강사');
}

export async function queryCommunityGroups(options?: {
  category?: string;
  limit?: number;
}): Promise<CommunityGroup[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (options?.category) filter.category = options.category;
  const raw = await CommunityGroupModel.find(filter)
    .sort({ members: -1 })
    .limit(options?.limit ?? 200)
    .lean();
  return raw.map((d) => docToCommunity(d as Record<string, unknown>));
}

export async function queryCommunityById(id: string): Promise<CommunityGroup | null> {
  await connectDB();
  const doc = await CommunityGroupModel.findById(id).lean();
  if (!doc) return null;
  return docToCommunity(doc as Record<string, unknown>);
}

export async function queryFreelancerGroups(options?: {
  category?: string;
  limit?: number;
}): Promise<FreelancerGroup[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (options?.category) filter.category = options.category;
  const raw = await FreelancerGroupModel.find(filter)
    .sort({ members: -1 })
    .limit(options?.limit ?? 200)
    .lean();
  return raw.map((d) => docToFreelancer(d as Record<string, unknown>));
}

export async function queryFreelancerById(id: string): Promise<FreelancerGroup | null> {
  await connectDB();
  const doc = await FreelancerGroupModel.findById(id).lean();
  if (!doc) return null;
  return docToFreelancer(doc as Record<string, unknown>);
}

export async function queryStudyInfos(options?: {
  category?: StudyInfo['category'];
}): Promise<StudyInfo[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (options?.category) filter.category = options.category;
  const raw = await StudyInfoModel.find(filter).sort({ createdAt: -1 }).lean();
  return raw.map((d) => docToStudyInfo(d as Record<string, unknown>));
}

export async function queryStudyInfoById(id: string): Promise<StudyInfo | null> {
  await connectDB();
  const doc = await StudyInfoModel.findById(id).lean();
  if (!doc) return null;
  return docToStudyInfo(doc as Record<string, unknown>);
}

/** 클라이언트 필터용: UI 카테고리 키 → 멘토 전문분야·소개 텍스트 키워드 매칭 */
export function mentorMatchesCategoryKey(mentor: MentorDTO, key: string | null): boolean {
  if (!key) return true;
  const text = [
    mentor.name,
    mentor.title,
    mentor.bio,
    ...mentor.specialties,
    ...mentor.languages,
  ]
    .join(' ')
    .toLowerCase();

  const patterns: Record<string, RegExp> = {
    visa: /비자|visa|출입국|immigration|체류|d-2|서류|법률/i,
    housing: /주거|housing|기숙사|자취|원룸|전세|월세|부동산/i,
    healthcare: /의료|health|병원|보험|건강|hospital|clinic/i,
    academic: /학업|academic|대학|수업|학교|논문|topik|장학/i,
    career: /커리어|career|취업|이력서|면접|인턴|it|개발|스타트업/i,
    dailyLife: /생활|daily|문화|교통|은행|쇼핑|적응|생활팁/i,
  };
  const re = patterns[key];
  return re ? re.test(text) : true;
}
