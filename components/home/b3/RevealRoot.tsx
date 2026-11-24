"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 홈 루트. JS가 켜졌을 때만 등장 애니메이션 클래스(is-anim)를 붙이고,
 * [data-reveal] 요소가 화면에 들어오면 is-in을 붙인다. (JS가 없으면 전부 그대로 보임)
 */
export default function RevealRoot({ lang, children }: { lang: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    root.classList.add("is-anim");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="b3" lang={lang}>
      {children}
    </div>
  );
}
