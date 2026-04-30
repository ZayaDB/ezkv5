"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { user, signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "mentee" as "mentee" | "mentor",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push(`/${locale}/admin/dashboard`);
      } else {
        router.push(`/${locale}/my/dashboard`);
      }
    }
  }, [user, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        locale,
      });

      if (!result.success) {
        setError(result.error || t("signupError"));
        setLoading(false);
        return;
      }

      // 회원가입 성공 - 로그인 페이지로 이동
      setLoading(false);
      router.push(`/${locale}/login?signup=success`);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || t("signupError"));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[url('/repul_dppaMAIN_bkimg.png')] bg-cover bg-top bg-no-repeat flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-white/25 dark:bg-slate-950/55" />
      </div>

      <div className="relative z-10 w-full max-w-md left-[-20%] top-[-40px]">
        {/* Logo */}
        <h1 className=" absolute top-0 left-[180%] w-full text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#7375a0] dark:text-white text-left mb-6 leading-tight">
          {t("signUp")}
        </h1>
        {/* Signup Form */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                {t("name")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t("namePlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("role")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "mentee" })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "mentee"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="font-semibold">{t("mentee")}</div>
                  <div className="text-xs mt-1">{t("menteeDesc")}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "mentor" })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "mentor"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="font-semibold">{t("mentor")}</div>
                  <div className="text-xs mt-1">{t("mentorDesc")}</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t("passwordPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t("confirmPasswordPlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("creatingAccount")}
                </>
              ) : (
                <>
                  {t("signUp")}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-300">
              {t("haveAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
