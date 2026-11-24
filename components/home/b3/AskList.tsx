"use client";

import { useTranslations } from "next-intl";
import { openAssistant } from "@/components/chatbot/Chatbot";

/** 예시 질문: 누르면 AI 비서가 열리고 질문이 입력창에 채워짐 */
export default function AskList() {
  const t = useTranslations("homeB");
  const qs = t.raw("askQs") as string[];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] font-bold text-[#3d3510]">{t("askLabel")}</p>
      <ul className="flex flex-col gap-3">
        {qs.map((q) => (
          <li key={q}>
            <button type="button" onClick={() => openAssistant(q)} className="b3-ask-q">
              <span lang={/[А-Яа-яӨөҮүЁё]/.test(q) ? "mn" : undefined} className="min-w-0 flex-[1_1_260px] text-[17px] font-extrabold leading-[1.45]">
                {q}
              </span>
              <span className="b3-ask-badge">{t("askBadge")}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AskButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => openAssistant()} className="b3-btn b3-btn-ink">
      {label}
    </button>
  );
}
