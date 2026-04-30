"use client";

import Link from "next/link";
import PlatformCard from "@/components/ui/PlatformCard";

export default function MentorApprovedPanel({
  tp,
  locale,
  mentorDoc,
  userRole,
  myLectures,
}: {
  tp: (key: string) => string;
  locale: string;
  mentorDoc: { id: string; title?: string };
  userRole: string;
  myLectures: { id: string; title?: string }[];
}) {
  return (
    <div className="space-y-4">
      <PlatformCard>
        <h3 className="font-semibold text-slate-900">{tp("mentor.mentorRoleTitle")}</h3>
        <p className="text-sm text-slate-600 mt-1">{mentorDoc.title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/mentors/${mentorDoc.id}`}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            {tp("mentor.publicProfile")}
          </Link>
          {(userRole === "mentor" || userRole === "admin") && (
            <Link
              href={`/${locale}/mentor/lectures/new`}
              className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
            >
              {tp("mentor.createCourse")}
            </Link>
          )}
        </div>
        {userRole === "mentee" && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            {tp("mentor.approvedMentee")}
          </p>
        )}
      </PlatformCard>
      {(userRole === "mentor" || userRole === "admin") && (
        <PlatformCard>
          <h3 className="font-semibold text-slate-900 mb-3">{tp("mentor.myCourses")}</h3>
          {myLectures.length === 0 ? (
            <p className="text-sm text-slate-500">{tp("mentor.noCourses")}</p>
          ) : (
            <ul className="space-y-2">
              {myLectures.map((lec) => (
                <li key={lec.id}>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/${locale}/lectures/${lec.id}`}
                      className="text-sm font-medium text-primary-600 hover:underline"
                    >
                      {lec.title}
                    </Link>
                    <Link
                      href={`/${locale}/mentor/lectures/${lec.id}/edit`}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                    >
                      수정
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PlatformCard>
      )}
    </div>
  );
}

