import type { GuideTopic } from "@/types";

export const GUIDE_TOPICS: GuideTopic[] = ["arrival", "study", "housing", "hospital", "lifeTips", "work", "visa"];

export type GuideSection = {
  id: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  checklist: string[];
};

export type ParsedGuide = { intro: string[]; sections: GuideSection[] };

/**
 * 가이드 본문 형식 (간단한 마크다운):
 *   첫 문단들 = 도입부
 *   "## 단계명 | 섹션 제목" = 새 섹션 (| 가 없으면 전체가 제목)
 *   "- [ ] 항목" = 체크리스트
 *   빈 줄 = 문단 구분
 */
export function parseGuide(content: string): ParsedGuide {
  const intro: string[] = [];
  const sections: GuideSection[] = [];
  let buf: string[] = [];

  const flush = () => {
    const text = buf.join(" ").trim();
    buf = [];
    if (!text) return;
    const cur = sections[sections.length - 1];
    if (cur) cur.paragraphs.push(text);
    else intro.push(text);
  };

  for (const raw of (content || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flush();
      const body = line.slice(3).trim();
      const [a, b] = body.includes("|") ? body.split("|").map((s) => s.trim()) : ["", body];
      sections.push({ id: `section-${sections.length + 1}`, eyebrow: a, heading: b, paragraphs: [], checklist: [] });
    } else if (/^- \[[ xX]?\]\s+/.test(line)) {
      flush();
      const item = line.replace(/^- \[[ xX]?\]\s+/, "");
      const cur = sections[sections.length - 1];
      if (cur) cur.checklist.push(item);
      else intro.push(item);
    } else if (!line) {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return { intro, sections };
}

/** 본문 글자 수로 대략적인 읽기 시간(분) */
export function estimateReadMinutes(content: string): number {
  const chars = (content || "").replace(/\s+/g, "").length;
  return Math.max(1, Math.round(chars / 500));
}
