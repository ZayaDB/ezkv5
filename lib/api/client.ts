/** @deprecated 도메인 모듈(`@/lib/api/*`) 또는 `@/lib/api` barrel을 사용하세요. */
export { contentApi } from "./content";
export { mentorsApi } from "./mentors";
export { lecturesApi, lectureWishlistApi } from "./lectures";
export { enrollmentApi } from "./enrollment";
export { sessionApi } from "./sessions";
export { inquiryApi } from "./inquiries";
export { adminApi } from "./admin";
export {
  publicFeedApi,
  channelFeedApi,
  communityApi,
  freelancerApi,
  lifePlanApi,
  roadmapsApi,
  assistantApi,
  type ChannelFeedKind,
  type PublicFeedKind,
  type LifeBudgetKind,
  type LifeRecurrence,
  type LifeEventCategory,
  type LifeEventStatus,
  type LifeBudgetLine,
  type LifeBudgetOccurrence,
  type LifeEvent,
  type LifeRecurrenceType,
} from "./mongo-routes";
