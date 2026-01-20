"use client";

import Link from "next/link";
import { CommunityGroup } from "@/types";
import { Users, ArrowRight, Hash } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface CommunityCardProps {
  group: CommunityGroup;
}

export default function CommunityCard({ group }: CommunityCardProps) {
  const locale = useLocale();
  const t = useTranslations("community");

  return (
    <Link href={`/${locale}/community/${group.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative">
        {/* Gradient Image Header */}
        <div className="relative h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-lg">
              {group.category}
            </span>
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {group.name}
          </h3>
          <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
            {group.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {group.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-5 h-5 text-primary-500" />
              <span className="font-semibold">
                {group.members.toLocaleString()}명
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
              <span>{t("join")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
