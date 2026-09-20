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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
        <p className="text-sm text-gray-600 mb-1">멘토 대기 신청</p>
        <p className="text-3xl font-extrabold text-indigo-700">{mentorPending}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
        <p className="text-sm text-gray-600 mb-1">커뮤니티 대기 신청</p>
        <p className="text-3xl font-extrabold text-purple-700">{communityPending}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
        <p className="text-sm text-gray-600 mb-1">프리랜서 대기 신청</p>
        <p className="text-3xl font-extrabold text-orange-700">{freelancerPending}</p>
      </div>
    </div>
  );
}
