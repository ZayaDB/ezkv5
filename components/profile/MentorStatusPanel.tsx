"use client";

import PlatformCard from "@/components/ui/PlatformCard";

export default function MentorStatusPanel({
  tp,
  mentorStatus,
  mentorSubmitting,
  submitMentorApplication,
  mentorTitle,
  setMentorTitle,
  mentorLocation,
  setMentorLocation,
  mentorBio,
  setMentorBio,
  mentorLangs,
  setMentorLangs,
  mentorSpecs,
  setMentorSpecs,
  mentorPrice,
  setMentorPrice,
  mentorAvail,
  setMentorAvail,
}: {
  tp: (key: string) => string;
  mentorStatus: string | null;
  mentorSubmitting: boolean;
  submitMentorApplication: () => void;
  mentorTitle: string;
  setMentorTitle: (v: string) => void;
  mentorLocation: string;
  setMentorLocation: (v: string) => void;
  mentorBio: string;
  setMentorBio: (v: string) => void;
  mentorLangs: string;
  setMentorLangs: (v: string) => void;
  mentorSpecs: string;
  setMentorSpecs: (v: string) => void;
  mentorPrice: string;
  setMentorPrice: (v: string) => void;
  mentorAvail: "available" | "limited" | "unavailable";
  setMentorAvail: (v: "available" | "limited" | "unavailable") => void;
}) {
  if (mentorStatus === "pending") {
    return (
      <PlatformCard>
        <p className="text-sm text-slate-700 dark:text-snow-muted">{tp("mentor.pending")}</p>
      </PlatformCard>
    );
  }

  if (mentorStatus !== "rejected") return null;

  return (
    <PlatformCard>
      <p className="text-sm text-red-700 mb-4">{tp("mentor.rejected")}</p>
      <h3 className="font-semibold text-slate-900 mb-4 dark:text-snow">{tp("mentor.formTitle")}</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.mentorTitleLabel")}</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorTitle}
            onChange={(e) => setMentorTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.locationLabel")}</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorLocation}
            onChange={(e) => setMentorLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.bioLabel")}</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorBio}
            onChange={(e) => setMentorBio(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.languagesLabel")}</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorLangs}
            onChange={(e) => setMentorLangs(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.specialtiesLabel")}</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorSpecs}
            onChange={(e) => setMentorSpecs(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.priceLabel")}</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorPrice}
            onChange={(e) => setMentorPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-snow-muted">{tp("mentor.avail")}</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-hairline-dark"
            value={mentorAvail}
            onChange={(e) => setMentorAvail(e.target.value as "available" | "limited" | "unavailable")}
          >
            <option value="available">{tp("mentor.availAvailable")}</option>
            <option value="limited">{tp("mentor.availLimited")}</option>
            <option value="unavailable">{tp("mentor.availUnavailable")}</option>
          </select>
        </div>
        <button
          type="button"
          disabled={mentorSubmitting}
          onClick={submitMentorApplication}
          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {tp("mentor.submit")}
        </button>
      </div>
    </PlatformCard>
  );
}

