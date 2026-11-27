"use client";

import { Calendar, Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/i18n/dateFormat";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "mentee" | "mentor" | "admin";
  createdAt: string;
};

export default function AdminUserTable({
  users,
  loading,
  onOpenUser,
}: {
  users: UserRow[];
  loading: boolean;
  onOpenUser: (userId: string) => void;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-brand-soft border-b">
            <th className="py-2">{t("colUser")}</th>
            <th className="py-2">{t("colRole")}</th>
            <th className="py-2">{t("colJoined")}</th>
            <th className="py-2">{t("colDetail")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-brand-soft">
                {tCommon("loadingShort")}
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="py-3">
                  <div className="font-medium text-brand-ink">{u.name}</div>
                  <div className="text-brand-soft flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {u.email}
                  </div>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded bg-brand-mist text-brand-ink">
                    {u.role === "mentee" ? t("roleMentee") : u.role === "mentor" ? t("roleMentor") : t("roleAdmin")}
                  </span>
                </td>
                <td className="py-3 text-brand-soft">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(u.createdAt, locale, { dateStyle: "short" })}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => onOpenUser(u.id)}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    {t("view")}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

