"use client";

import { Calendar, Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { intlLocale } from "@/lib/i18n/config";

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
          <tr className="text-left text-slate-500 border-b">
            <th className="py-2">{t("colUser")}</th>
            <th className="py-2">{t("colRole")}</th>
            <th className="py-2">{t("colJoined")}</th>
            <th className="py-2">{t("colDetail")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-500">
                {tCommon("loadingShort")}
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="py-3">
                  <div className="font-medium text-slate-900">{u.name}</div>
                  <div className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {u.email}
                  </div>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">
                    {u.role === "mentee" ? t("roleMentee") : u.role === "mentor" ? t("roleMentor") : t("roleAdmin")}
                  </span>
                </td>
                <td className="py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(u.createdAt).toLocaleDateString(intlLocale(locale))}
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

