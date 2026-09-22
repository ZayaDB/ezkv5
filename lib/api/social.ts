import type { PublicFeedKind } from "./social-types";
import type { ChannelKind } from "@/lib/supabase/channel-feed";

export type { ChannelFeedKind, PublicFeedKind } from "./social-types";

export const publicFeedApi = {
  list: async (feed: PublicFeedKind, opts?: { authorId?: string }) => {
    try {
      const { listPublicFeed } = await import("@/lib/supabase/public-feed");
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await listPublicFeed(feed, {
        viewerUserId: session?.user?.id,
        authorId: opts?.authorId,
      });
      if ("error" in res && res.error) return { error: res.error };
      return { data: { posts: res.posts || [] } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "목록을 불러오지 못했습니다." };
    }
  },
  create: async (feed: PublicFeedKind, payload: { body: string; attachmentUrls?: string[] }) => {
    try {
      const { createPublicFeedPost } = await import("@/lib/supabase/public-feed");
      const res = await createPublicFeedPost(feed, payload.body, payload.attachmentUrls || []);
      if ("error" in res && res.error) return { error: res.error };
      return { data: res };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "등록에 실패했습니다." };
    }
  },
  listComments: async (feed: PublicFeedKind, postId: string) => {
    void feed;
    try {
      const { listPublicFeedComments } = await import("@/lib/supabase/public-feed");
      const res = await listPublicFeedComments(postId);
      if ("error" in res && res.error) return { error: res.error };
      return { data: { comments: res.comments || [] } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "댓글을 불러오지 못했습니다." };
    }
  },
  addComment: async (feed: PublicFeedKind, postId: string, body: string) => {
    void feed;
    try {
      const { addPublicFeedComment } = await import("@/lib/supabase/public-feed");
      const res = await addPublicFeedComment(postId, body);
      if ("error" in res && res.error) return { error: res.error };
      return { data: res };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "댓글 등록에 실패했습니다." };
    }
  },
  toggleLike: async (feed: PublicFeedKind, postId: string) => {
    void feed;
    try {
      const { togglePublicFeedLike } = await import("@/lib/supabase/public-feed");
      const res = await togglePublicFeedLike(postId);
      if ("error" in res && res.error) return { error: res.error };
      return { data: { likeCount: res.likeCount, likedByMe: res.likedByMe } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "처리에 실패했습니다." };
    }
  },
  uploadFile: async (file: File) => {
    const { uploadPublicImage } = await import("@/lib/supabase/storage");
    return uploadPublicImage(file);
  },
};

export const channelFeedApi = {
  listPosts: async (channel: ChannelKind, channelId: string) => {
    try {
      const { listChannelPosts } = await import("@/lib/supabase/channel-feed");
      const posts = await listChannelPosts(channel, channelId);
      return { data: { posts } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "글 목록을 불러오지 못했습니다." };
    }
  },
  createPost: async (channel: ChannelKind, channelId: string, payload: { title: string; body: string }) => {
    try {
      const { createChannelPost } = await import("@/lib/supabase/channel-feed");
      const res = await createChannelPost(channel, channelId, payload.title, payload.body);
      if ("error" in res && res.error) return { error: res.error };
      return { data: res };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "글 등록에 실패했습니다." };
    }
  },
  listComments: async (channel: ChannelKind, channelId: string, postId: string) => {
    void channel;
    void channelId;
    try {
      const { listChannelComments } = await import("@/lib/supabase/channel-feed");
      const comments = await listChannelComments(postId);
      return { data: { comments } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "댓글을 불러오지 못했습니다." };
    }
  },
  addComment: async (channel: ChannelKind, channelId: string, postId: string, body: string) => {
    try {
      const { addChannelComment } = await import("@/lib/supabase/channel-feed");
      const res = await addChannelComment(channel, channelId, postId, body);
      if ("error" in res && res.error) return { error: res.error };
      return { data: res };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "댓글 등록에 실패했습니다." };
    }
  },
};

export const communityApi = {
  getMyMemberships: async () => {
    try {
      const { listMyCommunityMemberships } = await import("@/lib/supabase/catalog");
      const memberships = await listMyCommunityMemberships();
      return { data: { memberships } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "멤버십을 불러오지 못했습니다." };
    }
  },
};

export const freelancerApi = {
  getMyApplications: async () => {
    try {
      const { listMyFreelancerApplications } = await import("@/lib/supabase/catalog");
      const applications = await listMyFreelancerApplications();
      return { data: { applications } };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "신청 목록을 불러오지 못했습니다." };
    }
  },
};
