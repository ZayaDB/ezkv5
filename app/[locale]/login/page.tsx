"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthShell, AuthField, AuthAlert, authInput } from "@/components/auth/AuthShell";
import { ui } from "@/components/lnk/ui";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [remember, setRemember] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  // URL 파라미터에서 signup 성공 여부 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "success") {
      setResetDone(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("signup") === "success") {
      setSignupSuccess(true);
      const signedUpEmail = params.get("email");
      if (signedUpEmail) {
        setEmail(signedUpEmail);
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // 이미 로그인되어 있으면 프로필로 리다이렉트
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push(`/${locale}/admin/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    }
  }, [user, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password, remember);

      if (!result.success) {
        setError(result.error || t("loginError"));
        setLoading(false);
        return;
      }

      // 로그인 성공 즉시 이동하여 체감 지연을 줄인다.
      if (result.user?.role === "admin") {
        router.replace(`/${locale}/admin/dashboard`);
      } else {
        router.replace(`/${locale}/my/dashboard`);
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || t("loginError"));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("login")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href={`/${locale}/signup`} className="font-semibold text-teal hover:underline dark:text-teal-dark">
            {t("signUp")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {signupSuccess && <AuthAlert tone="success">{t("signupCompleteLogin")}</AuthAlert>}
        {resetDone && <AuthAlert tone="success">{t("reset.doneLogin")}</AuthAlert>}
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <AuthField label={t("email")} icon={Mail}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authInput}
            placeholder={t("emailPlaceholder")}
          />
        </AuthField>

        <AuthField label={t("password")} icon={Lock}>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={authInput}
            placeholder={t("passwordPlaceholder")}
          />
        </AuthField>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-ink-muted dark:text-snow-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-hairline text-teal focus:ring-teal dark:border-hairline-dark"
            />
            {t("rememberMe")}
          </label>
          <Link href={`/${locale}/forgot-password`} className="font-medium text-teal hover:underline dark:text-teal-dark">
            {t("forgotPassword")}
          </Link>
        </div>

        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("loggingIn")}
            </>
          ) : (
            <>
              {t("login")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
