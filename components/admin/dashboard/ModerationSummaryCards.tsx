"use client";

import { useTranslations } from "next-intl";

type Props = {
  mentorPending: number;
  communityPending: number;
  freelancerPending: number;
};

export default function ModerationSummaryCards({
  mentorPending,
  communityPending,
  freelancerPending,
}: Props) {
  const t = useTranslations("admin");
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-brand-line">
        <p className="text-sm text-brand-soft mb-1">{t("pendingMentors")}</p>
        <p className="text-3xl font-extrabold text-indigo-700">{mentorPending}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-brand-line">
        <p className="text-sm text-brand-soft mb-1">{t("pendingCommunity")}</p>
        <p className="text-3xl font-extrabold text-purple-700">{communityPending}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-brand-line">
        <p className="text-sm text-brand-soft mb-1">{t("pendingFreelancer")}</p>
        <p className="text-3xl font-extrabold text-orange-700">{freelancerPending}</p>
      </div>
    </div>
  );
}
