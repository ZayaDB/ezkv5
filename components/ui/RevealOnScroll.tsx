'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({
  children,
  className = '',
  delayMs = 0,
  requireScroll = true,
  minScrollY = 8,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  requireScroll?: boolean;
  minScrollY?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const canShow =
            entry.isIntersecting &&
            (!requireScroll || window.scrollY > minScrollY);
          setVisible(canShow);
          if (!entry.isIntersecting) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [requireScroll, minScrollY]);

  return (
    <div
      ref={ref}
      style={visible ? { animationDelay: `${delayMs}ms` } : undefined}
      className={`will-change-transform ${
        visible
          ? 'animate-reveal-up opacity-100 translate-y-0 blur-0'
          : 'opacity-0 translate-y-16 blur-[3px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

