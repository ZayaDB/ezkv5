"use client";

import { Calendar, Mail } from "lucide-react";

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
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b">
            <th className="py-2">사용자</th>
            <th className="py-2">역할</th>
            <th className="py-2">가입일</th>
            <th className="py-2">상세</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-500">
                불러오는 중...
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
                    {u.role === "mentee" ? "학생" : u.role === "mentor" ? "멘토" : "관리자"}
                  </span>
                </td>
                <td className="py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => onOpenUser(u.id)}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    보기
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

