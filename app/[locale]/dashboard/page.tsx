"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { storage } from "@/lib/storage";
import { mockMentors } from "@/data/mockData";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import MentorCard from "@/components/cards/MentorCard";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState(storage.getSessions());
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user) {
      setMessages(storage.getMessages(user.id));
    }
  }, [user, authLoading, router, locale]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const upcomingSessions = sessions
    .filter(
      (s) =>
        s.status === "upcoming" &&
        (s.menteeId === user.id || s.mentorId === user.id)
    )
    .slice(0, 3);

  const recentMessages = messages.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            {t("welcome")}, {user.name}! 👋
          </h1>
          <p className="text-xl text-white/90">
            {user.role === "mentee" ? t("menteeGreeting") : t("mentorGreeting")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary-500" />
                  {t("upcomingSessions")}
                </h2>
                <Link
                  href={`/${locale}/sessions`}
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                >
                  {t("viewAll")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {session.type}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-accent-100 text-accent-700 text-sm font-semibold rounded-full">
                          {session.duration}분
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{t("noSessions")}</p>
                  <Link
                    href={`/${locale}/mentors`}
                    className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {t("bookSession")}
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary-500" />
                  {t("recentMessages")}
                </h2>
                <Link
                  href={`/${locale}/messages`}
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                >
                  {t("viewAll")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {message.from.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleString(
                              "ko-KR"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">{t("noMessages")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">통계</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-gray-600">총 세션</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {sessions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-accent-600" />
                    </div>
                    <span className="text-gray-600">메시지</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {messages.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Mentors */}
            {user.role === "mentee" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t("recommended")}
                </h3>
                <div className="space-y-4">
                  {mockMentors.slice(0, 2).map((mentor) => (
                    <Link
                      key={mentor.id}
                      href={`/${locale}/mentors/${mentor.id}`}
                      className="block p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {mentor.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {mentor.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {mentor.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
