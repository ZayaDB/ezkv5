import "server-only";
import manual from "@/data/visa-manual-2026-11.json";
import { extractVisaCodes } from "./match";

/**
 * 「외국인체류 안내매뉴얼」(2026.11) 본문 검색
 * 한국어는 띄어쓰기·조사 때문에 단어 검색이 잘 안 맞아서 글자 2개 단위(바이그램)로 점수를 매김
 */
type Chunk = { s: string; t: string };
const CHUNKS = (manual as { chunks: Chunk[] }).chunks;
const NORMALIZED = CHUNKS.map((c) => (c.s + "\n" + c.t).toLowerCase().replace(/\s+/g, ""));

function tokens(query: string): string[] {
  const q = query.toLowerCase();
  const out = new Set<string>();
  // 한글 바이그램
  for (const word of q.match(/[가-힣]+/g) ?? []) {
    if (word.length === 1) continue;
    for (let i = 0; i < word.length - 1; i++) out.add(word.slice(i, i + 2));
  }
  // 영문·숫자 단어 (topik, kiip, gni …)
  for (const w of q.match(/[a-z]{3,}|\d{2,}/g) ?? []) out.add(w);
  return [...out];
}

function count(hay: string, needle: string): number {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i !== -1 && n < 20) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

export type ManualHit = { section: string; text: string; score: number };

const AVG_LEN = NORMALIZED.reduce((a, h) => a + h.length, 0) / NORMALIZED.length;
const DF_CACHE = new Map<string, number>();
function idf(token: string): number {
  let df = DF_CACHE.get(token);
  if (df == null) {
    df = NORMALIZED.reduce((n, h) => (h.includes(token) ? n + 1 : n), 0);
    DF_CACHE.set(token, df);
  }
  return df ? Math.log(1 + (NORMALIZED.length - df + 0.5) / (df + 0.5)) : 0;
}

/** BM25 비슷한 점수: 드문 글자조합일수록, 짧은 조각에 많이 나올수록 높게 */
export function searchManual(query: string, limit = 4): ManualHit[] {
  const codes = extractVisaCodes(query).map((c) => c.toLowerCase());
  const toks = [...new Set([...tokens(query), ...codes])];
  if (!toks.length) return [];
  const weights = toks.map((t) => idf(t) * (codes.includes(t) ? 2 : 1));
  const k1 = 1.2;
  const b = 0.75;

  const scored = NORMALIZED.map((hay, i) => {
    const norm = k1 * (1 - b + (b * hay.length) / AVG_LEN);
    let score = 0;
    toks.forEach((t, j) => {
      const tf = count(hay, t);
      if (tf) score += (weights[j] * tf * (k1 + 1)) / (tf + norm);
    });
    // 질문한 비자의 장(章)이면 조금 가산
    for (const c of codes) if (CHUNKS[i].s.toLowerCase().includes(c.split("-").slice(0, 2).join("-"))) score *= 1.15;
    return { i, score };
  });

  // 표가 조각 사이에서 잘리는 경우가 많아, 같은 장의 다음 조각을 붙여서 돌려줌
  const picked: number[] = [];
  for (const x of scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score)) {
    if (picked.some((p) => Math.abs(p - x.i) <= 1)) continue;
    picked.push(x.i);
    if (picked.length >= limit) break;
  }
  return picked.map((i) => {
    const next = CHUNKS[i + 1]?.s === CHUNKS[i].s ? `\n${CHUNKS[i + 1].t}` : "";
    return { section: CHUNKS[i].s, text: (CHUNKS[i].t + next).slice(0, 2600), score: scored[i].score };
  });
}

export const MANUAL_SOURCE = "법무부 「외국인체류 안내매뉴얼」 2026. 11.";
