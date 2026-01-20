"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Settings,
  User as UserIcon,
  Mail,
  MapPin,
  Globe,
  Save,
  Edit2,
  Calendar,
  BookOpen,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  Award,
  MessageSquare,
  Users,
  FileText,
  Bell,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  BookMarked,
  GraduationCap,
  Briefcase,
  Activity,
} from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    languages: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        location: user.location || "",
        languages: user.languages || [],
      });
    }
  }, [user, authLoading, router, locale]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: API로 사용자 정보 업데이트
    setIsEditing(false);
    setSaving(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Mock 데이터 (나중에 API로 교체)
  const stats = {
    totalLectures: 12,
    completedLectures: 8,
    inProgressLectures: 3,
    upcomingSessions: 5,
    completedSessions: 23,
    studyHours: 156,
    weeklyGoal: 20,
    currentWeekHours: 15,
    achievements: 7,
    communityGroups: 3,
    freelancerProjects: 2,
  };

  const recentLectures = [
    {
      id: "1",
      title: "한국어 기초 문법",
      progress: 75,
      status: "in-progress",
      category: "언어",
      enrolledDate: "2024-01-15",
    },
    {
      id: "2",
      title: "TOPIK 시험 준비",
      progress: 100,
      status: "completed",
      category: "시험",
      enrolledDate: "2024-01-10",
    },
    {
      id: "3",
      title: "비즈니스 한국어",
      progress: 30,
      status: "in-progress",
      category: "비즈니스",
      enrolledDate: "2024-01-20",
    },
  ];

  const upcomingSessions = [
    {
      id: "1",
      mentorName: "김멘토",
      topic: "비자 연장 상담",
      date: "2024-01-25T14:00:00",
      type: "online",
    },
    {
      id: "2",
      mentorName: "이멘토",
      topic: "취업 준비",
      date: "2024-01-26T16:00:00",
      type: "offline",
    },
  ];

  const achievements = [
    { id: "1", title: "첫 강의 완료", icon: "🎓", date: "2024-01-12" },
    { id: "2", title: "10시간 학습 달성", icon: "⏰", date: "2024-01-18" },
    { id: "3", title: "멘토링 10회 완료", icon: "🤝", date: "2024-01-20" },
  ];

  const tabs = [
    { id: "overview", label: t("tabs.overview"), icon: BarChart3 },
    { id: "lectures", label: t("tabs.lectures"), icon: BookOpen },
    { id: "schedule", label: t("tabs.schedule"), icon: Calendar },
    { id: "statistics", label: t("tabs.statistics"), icon: TrendingUp },
    { id: "growth", label: t("tabs.growth"), icon: Target },
    { id: "info", label: t("tabs.info"), icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {t("title")}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-500">{user.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{user.email}</span>
                <span className="text-gray-300">•</span>
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold">
                  {t(`roles.${user.role}`)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Edit2 className="w-5 h-5" />
              {isEditing ? t("cancel") : t("edit")}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.totalLectures}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">{t("stats.totalLectures")}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.completedLectures}{t("stats.completedLectures")}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.upcomingSessions}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">{t("stats.upcomingSessions")}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.completedSessions}{t("stats.completedSessions")}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.studyHours}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">{t("stats.totalStudyHours")}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {t("stats.currentWeekHours")} {stats.currentWeekHours}{t("statistics.hours")}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.achievements}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">{t("stats.achievements")}</p>
                <p className="text-sm text-gray-500 mt-1">{t("stats.keepGoing")}</p>
              </div>
            </div>

            {/* Weekly Goal Progress */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t("weeklyGoal.title")}</h2>
                <span className="text-sm text-gray-500">
                  {stats.currentWeekHours} / {stats.weeklyGoal} {t("statistics.hours")}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${(stats.currentWeekHours / stats.weeklyGoal) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {t("weeklyGoal.hoursLeft")} {stats.weeklyGoal - stats.currentWeekHours}{t("weeklyGoal.hoursRemaining")}
              </p>
            </div>

            {/* Recent Lectures */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary-500" />
                  {t("recentLectures.title")}
                </h2>
                <button
                  onClick={() => setActiveTab("lectures")}
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                >
                  {t("recentLectures.viewAll")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {recentLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/${locale}/lectures/${lecture.id}`)}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        lecture.status === "completed"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {lecture.status === "completed" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <PlayCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{lecture.category}</span>
                        <span className="text-sm text-gray-500">
                          {lecture.progress}% {t("recentLectures.progress")}
                        </span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            lecture.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${lecture.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary-500" />
                  {t("upcomingSessions.title")}
                </h2>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                >
                  {t("upcomingSessions.viewAll")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{session.mentorName}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            session.type === "online"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {session.type === "online" ? "온라인" : "오프라인"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary-500" />
                  {t("achievements.title")}
                </h2>
                <button
                  onClick={() => setActiveTab("growth")}
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                >
                  {t("achievements.viewAll")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100"
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-500">{achievement.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lectures Tab */}
        {activeTab === "lectures" && (
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
              <button className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold">
                {t("lectures.all")} ({stats.totalLectures})
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold">
                {t("lectures.inProgress")} ({stats.inProgressLectures})
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold">
                {t("lectures.completed")} ({stats.completedLectures})
              </button>
            </div>

            {/* Lecture Analysis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-500" />
                {t("lectures.analysis.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">{t("lectures.analysis.avgCompletion")}</div>
                  <div className="text-3xl font-bold text-blue-600">78%</div>
                  <div className="text-xs text-gray-500 mt-1">{t("lectures.analysis.lecturesCount")}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">{t("lectures.analysis.monthlyHours")}</div>
                  <div className="text-3xl font-bold text-green-600">42{t("statistics.hours")}</div>
                  <div className="text-xs text-gray-500 mt-1">{t("lectures.analysis.goalProgress")} 120%</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">{t("lectures.analysis.topCategory")}</div>
                  <div className="text-2xl font-bold text-purple-600">언어</div>
                  <div className="text-xs text-gray-500 mt-1">8{t("lectures.analysis.lecturesCount")}</div>
                </div>
              </div>
            </div>

            {/* Lecture List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="space-y-4">
                {recentLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/${locale}/lectures/${lecture.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          lecture.status === "completed"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {lecture.status === "completed" ? (
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : (
                          <PlayCircle className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {lecture.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{lecture.category}</span>
                              <span>•</span>
                              <span>등록일: {lecture.enrolledDate}</span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              lecture.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {lecture.status === "completed" ? t("recentLectures.completed") : t("recentLectures.inProgress")}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{t("lectures.progress")}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {lecture.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
                                lecture.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${lecture.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            {/* Calendar View */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-500" />
                {t("schedule.title")}
              </h2>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {t.raw("schedule.days").map((day: string) => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
                {/* 간단한 캘린더 그리드 (실제로는 날짜별 세션 표시) */}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="text-sm text-gray-600">{i + 1}</div>
                    {i === 24 && (
                      <div className="mt-1">
                        <div className="w-full h-1 bg-primary-500 rounded mb-1"></div>
                        <div className="text-xs text-primary-600 font-semibold">
                          멘토링
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t("schedule.upcoming")}</h2>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{session.topic}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.mentorName}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(session.date).toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            session.type === "online"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {session.type === "online" ? "온라인" : "오프라인"}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold">
                      {t("upcomingSessions.viewDetails")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-2">{t("statistics.totalHours")}</div>
                <div className="text-4xl font-bold mb-1">{stats.studyHours}{t("statistics.hours")}</div>
                <div className="text-sm opacity-75">{t("statistics.hoursThisMonth")} +12{t("statistics.hours")}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-2">{t("statistics.completedLectures")}</div>
                <div className="text-4xl font-bold mb-1">{stats.completedLectures}</div>
                <div className="text-sm opacity-75">{t("statistics.completionRate")} 67%</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-2">{t("statistics.mentoringSessions")}</div>
                <div className="text-4xl font-bold mb-1">{stats.completedSessions}</div>
                <div className="text-sm opacity-75">{t("statistics.avgSatisfaction")} 4.8/5</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="text-sm opacity-90 mb-2">{t("statistics.streak")}</div>
                <div className="text-4xl font-bold mb-1">15</div>
                <div className="text-sm opacity-75">{t("statistics.bestStreak")} 28</div>
              </div>
            </div>

            {/* Learning Progress Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t("statistics.learningProgress")}</h2>
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 72, 68, 80, 75, 85, 78].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">
                      {["월", "화", "수", "목", "금", "토", "일"][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t("statistics.categoryBreakdown")}</h2>
              <div className="space-y-4">
                {[
                  { category: "언어", hours: 45, percentage: 35 },
                  { category: "시험 준비", hours: 32, percentage: 25 },
                  { category: "비즈니스", hours: 28, percentage: 22 },
                  { category: "일상 생활", hours: 23, percentage: 18 },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{item.category}</span>
                      <span className="text-sm text-gray-600">
                        {item.hours}{t("statistics.hours")} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Growth Tab */}
        {activeTab === "growth" && (
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary-500" />
                  {t("growth.goals.title")}
                </h2>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold">
                  + {t("growth.goals.newGoal")}
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "이번 달 50시간 학습하기",
                    progress: 84,
                    deadline: "2024-01-31",
                    status: "in-progress",
                  },
                  {
                    title: "TOPIK 4급 취득",
                    progress: 100,
                    deadline: "2024-01-20",
                    status: "completed",
                  },
                  {
                    title: "멘토링 20회 완료",
                    progress: 65,
                    deadline: "2024-02-15",
                    status: "in-progress",
                  },
                ].map((goal, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{t("growth.goals.deadline")}: {goal.deadline}</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              goal.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {goal.status === "completed" ? t("growth.goals.completed") : t("growth.goals.inProgress")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          goal.status === "completed" ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {goal.progress}% {t("growth.goals.progress")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-500" />
                {t("growth.achievements.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border-2 border-primary-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-500">{achievement.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary-500" />
                {t("growth.streak.title")}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary-600">15</div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {t("growth.streak.current")} 15{t("growth.streak.days")} 🔥
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("growth.streak.best")}: 28{t("growth.streak.daysStreak")}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg ${
                      i < 15 ? "bg-green-500" : "bg-gray-200"
                    }`}
                    title={`${i + 1}일차`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-primary-500" />
                {t("info.basicInfo.title")}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("name")}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">{user.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이메일
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">{user.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    자기소개
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t("info.basicInfo.bioPlaceholder")}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl min-h-[100px]">
                      {formData.bio || t("info.basicInfo.bioEmpty")}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("location")}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t("info.basicInfo.locationPlaceholder")}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      {formData.location || t("info.basicInfo.locationEmpty")}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t("saving")}
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          저장하기
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary-500" />
                {t("info.accountSettings.title")}
              </h2>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-gray-900">{t("info.accountSettings.emailNotifications")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-gray-900">{t("info.accountSettings.notifications")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-gray-900">{t("info.accountSettings.language")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-gray-900">{t("info.accountSettings.privacy")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
