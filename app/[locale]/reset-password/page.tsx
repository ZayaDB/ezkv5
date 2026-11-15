"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Lock, ArrowRight, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearSessionPersistence } from "@/lib/auth/rememberSession";
import { AuthShell, AuthField, AuthAlert, authInput } from "@/components/auth/AuthShell";
import { ui } from "@/components/lnk/ui";

type Phase = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // The browser client exchanges the ?code from the email link on load.
  // Wait briefly for the recovery session to appear.
  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (params.get("error") || hash.get("error")) {
      setPhase("invalid");
      return;
    }

    let done = false;
    const ready = () => {
      if (done) return;
      done = true;
      setPhase("ready");
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) ready();
    });

    let tries = 0;
    const poll = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return ready();
      if (++tries >= 8) {
        if (!done) {
          done = true;
          setPhase("invalid");
        }
        return;
      }
      setTimeout(poll, 500);
    };
    void poll();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError(t("passwordMismatch"));
    if (password.length < 6) return setError(t("passwordTooShort"));

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError((err as { code?: string }).code === "same_password" ? t("reset.samePassword") : t("reset.error"));
        setSaving(false);
        return;
      }
      clearSessionPersistence();
      await supabase.auth.signOut();
      try {
        localStorage.removeItem("auth_user_cache");
      } catch {
        /* ignore */
      }
      router.replace(`/${locale}/login?reset=success`);
    } catch {
      setError(t("reset.error"));
      setSaving(false);
    }
  };

  if (phase === "invalid") {
    return (
      <AuthShell title={t("reset.invalidTitle")}>
        <div className="space-y-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f0df] text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <p className="text-sm leading-relaxed text-ink-muted dark:text-snow-muted">{t("reset.invalidBody")}</p>
          <Link href={`/${locale}/forgot-password`} className={`${ui.btnPrimary} w-full`}>
            {t("reset.requestAgain")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("reset.title")} subtitle={t("reset.subtitle")}>
      {phase === "checking" ? (
        <p className={ui.muted}>{t("reset.checking")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AuthAlert tone="error">{error}</AuthAlert>}
          <AuthField label={t("reset.newPassword")} icon={Lock}>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={authInput}
              placeholder={t("passwordPlaceholder")}
            />
          </AuthField>
          <AuthField label={t("reset.confirm")} icon={Lock}>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className={authInput}
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </AuthField>
          <button type="submit" disabled={saving} className={`${ui.btnPrimary} w-full`}>
            {saving ? t("reset.saving") : (
              <>
                {t("reset.submit")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
