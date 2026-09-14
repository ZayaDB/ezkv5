"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Mail, Lock, User, ArrowRight, Globe, GraduationCap, MapPin, MapPinned } from "lucide-react";

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

  const inputClass =
    "w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

  const progressSteps = residingInKorea === true ? [1, 2, 3] : [1, 2];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[url('/repul_dppaMAIN_bkimg.png')] bg-cover bg-top bg-no-repeat flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/25 dark:bg-slate-950/55" />

      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-[#7375a0] dark:text-white text-center mb-6">
          {t("signUp")}
        </h1>

        <div className="flex justify-center gap-2 mb-6">
          {progressSteps.map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? "w-8 bg-primary-500" : "w-4 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Step 1: 한국 거주 여부 */}
            {step === 1 && (
              <>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">{t("stepResidency")}</p>
                <p className="text-base font-medium text-gray-800 dark:text-slate-100">{t("residencyQuestion")}</p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResidingInKorea(true)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      residingInKorea === true
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                        : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300"
                    }`}
                  >
                    <MapPinned className="w-6 h-6 mb-2" />
                    <div className="font-semibold">{t("residingYes")}</div>
                    <div className="text-xs mt-1 opacity-80">{t("residingYesDesc")}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResidingInKorea(false)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      residingInKorea === false
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                        : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300"
                    }`}
                  >
                    <Globe className="w-6 h-6 mb-2" />
                    <div className="font-semibold">{t("residingNo")}</div>
                    <div className="text-xs mt-1 opacity-80">{t("residingNoDesc")}</div>
                  </button>
                </div>
              </>
            )}

            {/* Step 2 (한국 거주): 비자 정보 */}
            {isVisaStep && (
              <>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">{t("stepVisa")}</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("visaType")}</label>
                  <input
                    type="text"
                    value={formData.visaType}
                    onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900"
                    placeholder={t("visaTypePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("visaExpireDate")}</label>
                  <input
                    type="date"
                    value={formData.visaExpireDate}
                    onChange={(e) => setFormData({ ...formData, visaExpireDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900"
                  />
                </div>
              </>
            )}

            {/* 기본 정보 (한국 미거주: step 2 / 한국 거주: step 3) */}
            {isBasicStep && (
              <>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">{t("stepBasicInfo")}</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("name")}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("namePlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("passwordPlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("confirmPassword")}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("confirmPasswordPlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("nationality")}</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("nationalityPlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("university")}</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("universityPlaceholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{t("region")}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      required
                      className={inputClass}
                      placeholder={t("regionPlaceholder")}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 font-semibold text-gray-600"
                >
                  {t("prevStep")}
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  t("creatingAccount")
                ) : isBasicStep ? (
                  <>
                    {t("signUp")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t("nextStep")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-300">
            {t("haveAccount")}{" "}
            <Link href={`/${locale}/login`} className="text-primary-600 font-semibold">
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
