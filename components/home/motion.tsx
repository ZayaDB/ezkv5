"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades/slides content in once when it scrolls into view. Content already in the
 *  viewport on load is left visible, so there is no flash on first paint. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add("lnk-reveal");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => el.classList.add("lnk-in"), delay);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Thin teal bar at the top of the viewport showing scroll position. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] pointer-events-none" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-primary-500 to-accent-300"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/** Moves its child slightly slower than the page while the hero scrolls away. */
export function Parallax({ children, speed = 0.06 }: { children: ReactNode; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 700);
      if (ref.current) ref.current.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className="will-change-transform">
      {children}
    </div>
  );
}

export type Step = { marker: string; title: string; body: string };

/** Three steps joined by a line that fills as the section scrolls through the viewport. */
export function StepsTimeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.8 - r.top) / (r.height + vh * 0.25);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-hairline dark:bg-hairline-dark md:block" aria-hidden="true">
        <div
          className="h-full origin-left bg-primary-500 dark:bg-primary-400"
          style={{ transform: `scaleX(${progress})`, transition: "transform 120ms linear" }}
        />
      </div>
      <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
        {steps.map((s, i) => {
          const active = progress >= (i + 0.35) / steps.length || (i === 0 && progress > 0.02);
          return (
            <li key={s.marker} className="relative">
              <span
                className={`relative z-10 mb-4 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  active
                    ? "border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400"
                    : "border-hairline bg-surface dark:border-hairline-dark dark:bg-night"
                }`}
              />
              <p className="mb-2 text-[13px] text-teal dark:text-teal-dark">{s.marker}</p>
              <h3 className="mb-2 text-lg font-semibold text-ink dark:text-snow">{s.title}</h3>
              <p className="text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">{s.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export type Faq = { q: string; a: string };

export function FaqList({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-hairline dark:border-hairline-dark">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-hairline dark:border-hairline-dark">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-ink transition-colors hover:text-teal dark:text-snow dark:hover:text-teal-dark"
              >
                {item.q}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline text-teal transition-transform duration-300 dark:border-hairline-dark dark:text-teal-dark ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
            </h3>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="pb-5 pr-12 leading-[1.6] text-ink-muted dark:text-snow-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
