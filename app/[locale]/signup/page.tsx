"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Mail, Lock, User, ArrowRight, Globe, GraduationCap, MapPin, MapPinned } from "lucide-react";
import { AuthShell, AuthField, AuthAlert, authInput, authInputPlain } from "@/components/auth/AuthShell";
import { ui } from "@/components/lnk/ui";

type ResidencyChoice = boolean | null;

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { user, signup } = useAuth();
  const [step, setStep] = useState(1);
  const [residingInKorea, setResidingInKorea] = useState<ResidencyChoice>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    university: "",
    region: "",
    visaType: "",
    visaExpireDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      if (user.role === "admin") {
        router.push(`/${locale}/admin/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    }
  }, [user, loading, router, locale]);

  const isVisaStep = step === 2 && residingInKorea === true;
  const isBasicStep =
    (step === 2 && residingInKorea === false) || (step === 3 && residingInKorea === true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (residingInKorea === null) {
        setError(t("residencyRequired"));
        return;
      }
      setStep(2);
      return;
    }

    if (isVisaStep) {
      if (!formData.visaType.trim() || !formData.visaExpireDate) {
        setError(t("visaRequired"));
        return;
      }
      setStep(3);
      return;
    }

    if (isBasicStep) {
      if (formData.password !== formData.confirmPassword) {
        setError(t("passwordMismatch"));
        return;
      }
      if (formData.password.length < 6) {
        setError(t("passwordTooShort"));
        return;
      }
      await submitSignup();
    }
  };

  const submitSignup = async () => {
    setLoading(true);
    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        locale,
        nationality: formData.nationality,
        university: formData.university,
        region: formData.region,
        residingInKorea: residingInKorea === true,
        visaType: residingInKorea ? formData.visaType : undefined,
        visaExpireDate: residingInKorea ? formData.visaExpireDate : undefined,
      });

      if (!result.success) {
        setError(result.error || t("signupError"));
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace(`/${locale}/login?signup=success&email=${encodeURIComponent(formData.email.trim())}`);
    } catch (err: any) {
      setError(err.message || t("signupError"));
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    if (step === 2) {
      setStep(1);
      return;
    }
    if (step === 3) {
      setStep(2);
    }
  };

  const totalSteps = residingInKorea === true ? 3 : 2;
  const stepTitle = step === 1 ? t("stepResidency") : isVisaStep ? t("stepVisa") : t("stepBasicInfo");

  const choiceClass = (active: boolean) =>
    `rounded-xl border p-4 text-left transition-colors ${
      active
        ? "border-teal bg-primary-50 text-ink dark:border-teal-dark dark:bg-primary-950/40 dark:text-snow"
        : "border-hairline text-ink-muted hover:border-teal/60 dark:border-hairline-dark dark:text-snow-muted"
    }`;

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [key]: e.target.value });

  return (
    <AuthShell
      title={t("signUp")}
      subtitle={t("signupSubtitle")}
      kicker={
        <div className="space-y-2">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: totalSteps }, (_, idx) => (
              <span
                key={idx}
                className={`h-1 flex-1 rounded-full ${idx < step ? "bg-teal dark:bg-teal-dark" : "bg-hairline dark:bg-hairline-dark"}`}
              />
            ))}
          </div>
          <p className={ui.eyebrow}>
            {t("stepOf", { current: step, total: totalSteps })} · {stepTitle}
          </p>
        </div>
      }
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href={`/${locale}/login`} className="font-semibold text-teal hover:underline dark:text-teal-dark">
            {t("login")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-base font-medium text-ink dark:text-snow">{t("residencyQuestion")}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={residingInKorea === true}
                onClick={() => setResidingInKorea(true)}
                className={choiceClass(residingInKorea === true)}
              >
                <MapPinned className="mb-2 h-5 w-5 text-teal dark:text-teal-dark" />
                <div className="font-semibold text-ink dark:text-snow">{t("residingYes")}</div>
                <div className="mt-1 text-xs">{t("residingYesDesc")}</div>
              </button>
              <button
                type="button"
                aria-pressed={residingInKorea === false}
                onClick={() => setResidingInKorea(false)}
                className={choiceClass(residingInKorea === false)}
              >
                <Globe className="mb-2 h-5 w-5 text-teal dark:text-teal-dark" />
                <div className="font-semibold text-ink dark:text-snow">{t("residingNo")}</div>
                <div className="mt-1 text-xs">{t("residingNoDesc")}</div>
              </button>
            </div>
          </div>
        )}

        {isVisaStep && (
          <>
            <AuthField label={t("visaType")}>
              <input type="text" value={formData.visaType} onChange={set("visaType")} required className={authInputPlain} placeholder={t("visaTypePlaceholder")} />
            </AuthField>
            <AuthField label={t("visaExpireDate")}>
              <input type="date" value={formData.visaExpireDate} onChange={set("visaExpireDate")} required className={authInputPlain} />
            </AuthField>
          </>
        )}

        {isBasicStep && (
          <>
            <AuthField label={t("name")} icon={User}>
              <input type="text" autoComplete="name" value={formData.name} onChange={set("name")} required className={authInput} placeholder={t("namePlaceholder")} />
            </AuthField>
            <AuthField label={t("email")} icon={Mail}>
              <input type="email" autoComplete="email" value={formData.email} onChange={set("email")} required className={authInput} placeholder={t("emailPlaceholder")} />
            </AuthField>
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField label={t("password")} icon={Lock}>
                <input type="password" autoComplete="new-password" value={formData.password} onChange={set("password")} required className={authInput} placeholder={t("passwordPlaceholder")} />
              </AuthField>
              <AuthField label={t("confirmPassword")} icon={Lock}>
                <input type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={set("confirmPassword")} required className={authInput} placeholder={t("confirmPasswordPlaceholder")} />
              </AuthField>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField label={t("nationality")} icon={Globe}>
                <input type="text" value={formData.nationality} onChange={set("nationality")} required className={authInput} placeholder={t("nationalityPlaceholder")} />
              </AuthField>
              <AuthField label={t("region")} icon={MapPin}>
                <input type="text" value={formData.region} onChange={set("region")} required className={authInput} placeholder={t("regionPlaceholder")} />
              </AuthField>
            </div>
            <AuthField label={t("university")} icon={GraduationCap}>
              <input type="text" value={formData.university} onChange={set("university")} required className={authInput} placeholder={t("universityPlaceholder")} />
            </AuthField>
          </>
        )}

        <div className="flex gap-3 pt-1">
          {step > 1 && (
            <button type="button" onClick={goBack} className={`${ui.btnOutline} flex-1`}>
              {t("prevStep")}
            </button>
          )}
          <button type="submit" disabled={loading} className={`${ui.btnPrimary} flex-1`}>
            {loading ? (
              t("creatingAccount")
            ) : (
              <>
                {isBasicStep ? t("signUp") : t("nextStep")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
