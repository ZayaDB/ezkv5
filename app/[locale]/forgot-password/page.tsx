"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, ArrowRight, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, AuthField, AuthAlert, authInput } from "@/components/auth/AuthShell";
import { ui } from "@/components/lnk/ui";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const target = email.trim();
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });
      if (err) throw err;
      setSentTo(target);
    } catch (err) {
      console.error("resetPasswordForEmail failed:", err);
      setError(t("forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  const backLink = (
    <Link href={`/${locale}/login`} className="font-semibold text-teal hover:underline dark:text-teal-dark">
      {t("forgot.backToLogin")}
    </Link>
  );

  if (sentTo) {
    return (
      <AuthShell title={t("forgot.sentTitle")} footer={backLink}>
        <div className="space-y-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark">
            <MailCheck className="h-6 w-6" />
          </span>
          <p className="text-sm leading-relaxed text-ink-muted dark:text-snow-muted">
            {t("forgot.sentBody", { email: sentTo })}
          </p>
          <button type="button" onClick={() => setSentTo(null)} className={`${ui.btnOutline} w-full`}>
            {t("forgot.resend")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("forgot.title")} subtitle={t("forgot.subtitle")} footer={backLink}>
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
          {loading ? t("forgot.sending") : (
            <>
              {t("forgot.submit")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
