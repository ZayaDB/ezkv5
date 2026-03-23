import Link from 'next/link';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 max-w-md mb-6">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-md"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
