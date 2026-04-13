interface StatusBadgeProps {
  label: string;
  tone?: "blue" | "green" | "red" | "gray" | "purple";
  className?: string;
}

const toneMap: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function StatusBadge({ label, tone = "gray", className = "" }: StatusBadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${toneMap[tone]} ${className}`.trim()}>
      {label}
    </span>
  );
}
