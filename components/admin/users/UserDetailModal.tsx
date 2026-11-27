"use client";

import { Shield, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export default function UserDetailModal({
  isOpen,
  loading,
  detail,
  newPassword,
  onChangePassword,
  onClose,
  onResetPassword,
}: {
  isOpen: boolean;
  loading: boolean;
  detail: any | null;
  newPassword: string;
  onChangePassword: (value: string) => void;
  onClose: () => void;
  onResetPassword: () => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-brand-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-brand-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            {t("userDetail")}
          </h3>
          <button onClick={onClose} className="text-brand-soft">
            {tCommon("close")}
          </button>
        </div>

        {loading || !detail ? (
          <p className="text-brand-soft mt-4">{tCommon("loadingShort")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-brand-mist">
                <p className="text-xs text-brand-soft">{t("name")}</p>
                <p className="font-semibold text-brand-ink">{detail.user.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-mist">
                <p className="text-xs text-brand-soft">{t("email")}</p>
                <p className="font-semibold text-brand-ink">{detail.user.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-mist">
                <p className="text-xs text-brand-soft">{t("colRole")}</p>
                <p className="font-semibold text-brand-ink">{detail.user.role}</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-mist">
                <p className="text-xs text-brand-soft">{t("language")}</p>
                <p className="font-semibold text-brand-ink">{detail.user.locale}</p>
              </div>
            </div>

            {detail.user.role === "mentee" && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                <p className="font-semibold text-blue-900">{t("studentInfo")}</p>
                <p className="text-sm text-blue-800 mt-1">
                  {t("studentStats", { enrollments: detail.stats?.enrollmentCount || 0, sessions: detail.stats?.sessionCount || 0 })}
                </p>
              </div>
            )}

            {detail.user.mentorProfile && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                <p className="font-semibold text-emerald-900">{t("mentorProfile")}</p>
                <p className="text-sm text-emerald-900 mt-1">{detail.user.mentorProfile.title}</p>
                <p className="text-sm text-emerald-800">{detail.user.mentorProfile.location}</p>
              </div>
            )}

            <div className="border rounded-xl p-4">
              <h4 className="font-semibold text-brand-ink flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                {t("resetPasswordTitle")}
              </h4>
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => onChangePassword(e.target.value)}
                  placeholder={t("newPassword")}
                  className="flex-1 rounded-lg border border-brand-line px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold"
                >
                  {t("reset")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

