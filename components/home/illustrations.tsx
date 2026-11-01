/* Vector illustrations for the LNK home page (flat, Illustrator-style SVG).
   All colors come from the Figma palette: #0e1a18 / #101e1c / #1b332f / #3fa393 / #f3f7f5,
   with one warm gold (#e8b86a) used sparingly for lit windows and highlights. */

const GOLD = "#e8b86a";

export function HeroIllustration({ className = "" }: { className?: string }) {
  const stars = [
    [48, 52, 1.6], [120, 30, 1.2], [210, 70, 1.4], [300, 36, 1.2], [372, 78, 1.6],
    [430, 40, 1.2], [560, 62, 1.4], [596, 120, 1.2], [90, 120, 1.2], [260, 118, 1.2],
  ] as const;
  const blocks = [
    // x, y(top), w, h
    [300, 330, 36, 140], [340, 300, 44, 170], [388, 345, 34, 125], [426, 318, 40, 152],
    [470, 352, 30, 118], [504, 296, 46, 174], [554, 336, 36, 134], [92, 372, 32, 98],
    [128, 346, 40, 124], [172, 384, 30, 86],
  ] as const;
  return (
    <svg
      viewBox="0 0 640 520"
      role="img"
      aria-label="서울의 밤 풍경 위로 비자, 일정, 멘토로 이어지는 로드맵"
      className={className}
    >
      <defs>
        <linearGradient id="hi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4a43" />
          <stop offset="0.55" stopColor="#12302b" />
          <stop offset="1" stopColor="#0e1a18" />
        </linearGradient>
        <radialGradient id="hi-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3f7f5" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f3f7f5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hi-path" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#3fa393" stopOpacity="0.2" />
          <stop offset="1" stopColor="#7fe0cf" />
        </linearGradient>
        <clipPath id="hi-clip">
          <rect width="640" height="520" rx="28" />
        </clipPath>
      </defs>

      <g clipPath="url(#hi-clip)">
        <rect width="640" height="520" fill="url(#hi-sky)" />

        {/* stars */}
        {stars.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="#f3f7f5"
            className="lnk-twinkle"
            style={{ animationDelay: `${(i % 5) * 0.6}s` }}
          />
        ))}

        {/* moon */}
        <circle cx="506" cy="104" r="86" fill="url(#hi-moon)" />
        <circle cx="506" cy="104" r="40" fill="#f3f7f5" />
        <circle cx="522" cy="94" r="36" fill="#173a35" opacity="0.18" />

        {/* far mountains */}
        <path d="M0 360 L70 290 L130 340 L210 262 L300 350 L380 300 L470 360 L560 296 L640 350 V520 H0Z" fill="#163430" />
        <path d="M0 400 L90 336 L170 392 L260 330 L360 398 L450 340 L540 396 L640 346 V520 H0Z" fill="#12302b" />

        {/* N Seoul Tower on the hill */}
        <path d="M0 470 C60 420 140 400 230 420 C290 432 320 450 360 470Z" fill="#0f2824" />
        <g fill="#1f4a43">
          <rect x="203" y="300" width="4" height="62" />
          <path d="M193 362 h24 l-4 -22 h-16z" />
          <ellipse cx="205" cy="338" rx="16" ry="7" />
          <rect x="198" y="360" width="14" height="62" rx="2" />
          <rect x="200" y="420" width="10" height="26" />
        </g>
        <circle cx="205" cy="338" r="2.2" fill={GOLD} className="lnk-twinkle" />

        {/* city blocks with lit windows */}
        {blocks.map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={i % 2 ? "#1b3f3b" : "#16332f"} />
            {Array.from({ length: Math.floor(h / 22) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor((w - 8) / 12)) }).map((__, c) => {
                const lit = (i * 7 + r * 3 + c * 5) % 5 === 0;
                const teal = (i * 3 + r + c) % 4 === 0;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 6 + c * 12}
                    y={y + 10 + r * 22}
                    width="6"
                    height="9"
                    rx="1"
                    fill={lit ? GOLD : teal ? "#3fa393" : "#0e1a18"}
                    opacity={lit ? 0.85 : teal ? 0.55 : 0.5}
                  />
                );
              })
            )}
          </g>
        ))}

        {/* hanok roof */}
        <g>
          <rect x="582" y="392" width="58" height="78" fill="#163430" />
          <path d="M566 392 C586 396 600 386 611 372 C622 386 636 396 656 392 C640 400 628 402 611 402 C594 402 582 400 566 392Z" fill="#245a52" />
          <rect x="598" y="414" width="26" height="40" rx="2" fill={GOLD} opacity="0.55" />
          <path d="M611 414 V454 M598 434 H624" stroke="#163430" strokeWidth="2" />
        </g>

        {/* foreground ground */}
        <path d="M0 470 C120 452 220 486 340 470 C460 454 540 486 640 468 V520 H0Z" fill="#0e1a18" />

        {/* roadmap path */}
        <path
          d="M30 480 C130 478 150 392 240 380 C330 368 340 296 410 276 C480 256 500 196 590 182"
          fill="none"
          stroke="url(#hi-path)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 12"
          className="lnk-path-flow"
        />

        {/* milestone pins */}
        {[
          { x: 240, y: 380, label: "visa" },
          { x: 410, y: 276, label: "calendar" },
          { x: 590, y: 182, label: "mentor" },
        ].map((p, i) => (
          <g key={p.label} transform={`translate(${p.x} ${p.y})`}>
            <circle r="22" fill="#3fa393" opacity="0.35" className="lnk-pulse-ring" style={{ animationDelay: `${i * 0.8}s` }} />
            <circle r="22" fill="#101e1c" stroke="#3fa393" strokeWidth="2.5" />
            <g fill="none" stroke="#f3f7f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {p.label === "visa" && (
                <>
                  <rect x="-8" y="-10" width="16" height="20" rx="2.5" />
                  <path d="M-4 0 l3 3 l5 -6" stroke="#7fe0cf" />
                </>
              )}
              {p.label === "calendar" && (
                <>
                  <rect x="-9" y="-8" width="18" height="17" rx="3" />
                  <path d="M-9 -2 H9 M-4 -11 V-6 M4 -11 V-6" />
                  <circle cx="0" cy="4" r="1.6" fill="#7fe0cf" stroke="none" />
                </>
              )}
              {p.label === "mentor" && (
                <path d="M-9 -7 h18 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-8 l-5 4 v-4 h-5 a2 2 0 0 1 -2 -2 v-8 a2 2 0 0 1 2 -2z" />
              )}
            </g>
          </g>
        ))}

        {/* floating cards */}
        <g className="lnk-float" style={{ animationDelay: "0s" }}>
          <g transform="translate(34 150)">
            <rect width="132" height="82" rx="12" fill="#101e1c" stroke="#2a3b38" />
            <circle cx="30" cy="34" r="14" fill="#1b332f" stroke="#3fa393" />
            <circle cx="30" cy="30" r="5" fill="#3fa393" />
            <path d="M19 46 C22 38 38 38 41 46" fill="#3fa393" />
            <rect x="54" y="22" width="60" height="6" rx="3" fill="#f3f7f5" opacity="0.85" />
            <rect x="54" y="36" width="44" height="5" rx="2.5" fill="#9fb0ac" opacity="0.7" />
            <rect x="14" y="60" width="104" height="5" rx="2.5" fill="#3fa393" opacity="0.6" />
          </g>
        </g>
        <g className="lnk-float" style={{ animationDelay: "1.4s" }}>
          <g transform="translate(300 118)">
            <rect width="112" height="70" rx="12" fill="#101e1c" stroke="#2a3b38" />
            <rect width="112" height="20" rx="12" fill="#1b332f" />
            <rect y="10" width="112" height="10" fill="#1b332f" />
            <circle cx="22" cy="10" r="3" fill="#3fa393" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={14 + (i % 3) * 32} y={30 + Math.floor(i / 3) * 18} width="22" height="10" rx="3" fill={i === 4 ? "#3fa393" : "#1b332f"} />
            ))}
          </g>
        </g>
        <g className="lnk-float" style={{ animationDelay: "0.7s" }}>
          <g transform="translate(436 232)">
            <rect width="150" height="58" rx="14" fill="#f3f7f5" />
            <path d="M22 58 l-8 14 l22 -14z" fill="#f3f7f5" />
            <circle cx="24" cy="29" r="11" fill="#3fa393" />
            <rect x="44" y="20" width="80" height="6" rx="3" fill="#101e1c" opacity="0.85" />
            <rect x="44" y="33" width="56" height="5" rx="2.5" fill="#101e1c" opacity="0.45" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ---------- Course cover illustrations (411 x 184) ---------- */

export function CampusCover({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 411 184" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a6a5f" />
          <stop offset="1" stopColor="#12302b" />
        </linearGradient>
      </defs>
      <rect width="411" height="184" fill="url(#cc-sky)" />
      <circle cx="338" cy="46" r="22" fill={GOLD} opacity="0.9" />
      <circle cx="338" cy="46" r="38" fill={GOLD} opacity="0.12" />
      <path d="M0 132 C80 112 160 128 240 116 C320 104 370 120 411 112 V184 H0Z" fill="#0f2824" />
      {/* main hall */}
      <rect x="92" y="62" width="150" height="82" fill="#d9ece7" />
      <path d="M84 62 H250 L167 34Z" fill="#245a52" />
      <rect x="150" y="14" width="34" height="48" fill="#cfe6e0" />
      <path d="M146 14 H188 L167 0Z" fill="#245a52" />
      <circle cx="167" cy="30" r="9" fill="#101e1c" />
      <path d="M167 24 V30 H172" stroke="#f3f7f5" strokeWidth="2" strokeLinecap="round" fill="none" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={104 + i * 28} y="82" width="14" height="28" rx="7" fill="#2a6a5f" />
      ))}
      <rect x="152" y="112" width="30" height="32" rx="3" fill="#245a52" />
      {/* steps and path */}
      <path d="M130 144 H204 V152 H120Z" fill="#bcd9d2" />
      <path d="M100 184 L150 152 H190 L240 184Z" fill="#cfe6e0" opacity="0.9" />
      {/* trees */}
      {[[40, 112], [64, 124], [288, 118], [326, 126], [372, 114]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y} width="4" height="26" fill="#12302b" />
          <circle cx={x} cy={y - 6} r={i % 2 ? 17 : 21} fill={i % 2 ? "#3fa393" : "#2f8a7b"} />
        </g>
      ))}
      {/* book */}
      <g transform="translate(262 120)">
        <path d="M0 6 C14 0 22 2 28 8 V34 C22 28 14 26 0 32Z" fill="#f3f7f5" />
        <path d="M56 6 C42 0 34 2 28 8 V34 C34 28 42 26 56 32Z" fill="#cfe6e0" />
      </g>
    </svg>
  );
}

export function KoreanCover({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 411 184" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="kc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b4a43" />
          <stop offset="1" stopColor="#0f2824" />
        </linearGradient>
      </defs>
      <rect width="411" height="184" fill="url(#kc-bg)" />
      {[[30, 24], [370, 150], [330, 30], [60, 160]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#3fa393" opacity="0.6" />
      ))}
      <g>
        <rect x="28" y="30" width="170" height="54" rx="20" fill="#f3f7f5" />
        <path d="M60 84 l-4 16 l24 -16z" fill="#f3f7f5" />
        <text x="113" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill="#101e1c" fontFamily="Pretendard, sans-serif">안녕하세요</text>
      </g>
      <g>
        <rect x="190" y="74" width="190" height="54" rx="20" fill="#3fa393" />
        <path d="M350 128 l4 16 l-24 -16z" fill="#3fa393" />
        <text x="285" y="108" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0e1a18" fontFamily="Pretendard, sans-serif">반갑습니다</text>
      </g>
      <g>
        <rect x="60" y="120" width="124" height="42" rx="16" fill="#1b332f" stroke="#3fa393" />
        <text x="122" y="148" textAnchor="middle" fontSize="18" fontWeight="600" fill="#f3f7f5" fontFamily="Pretendard, sans-serif">얼마예요?</text>
      </g>
      {/* cup */}
      <g transform="translate(332 138)">
        <path d="M0 0 H34 V18 C34 28 26 34 17 34 C8 34 0 28 0 18Z" fill={GOLD} />
        <path d="M34 6 C46 6 46 24 34 24" stroke={GOLD} strokeWidth="4" fill="none" />
        <path d="M10 -6 C6 -12 14 -14 10 -22 M22 -6 C18 -12 26 -14 22 -22" stroke="#f3f7f5" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      </g>
    </svg>
  );
}

export function SettleCover({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 411 184" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#173a35" />
          <stop offset="1" stopColor="#0e1a18" />
        </linearGradient>
      </defs>
      <rect width="411" height="184" fill="url(#sc-sky)" />
      <circle cx="62" cy="40" r="16" fill="#f3f7f5" />
      <circle cx="70" cy="35" r="14" fill="#173a35" opacity="0.2" />
      {[[210, 22], [250, 46], [300, 18], [360, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#f3f7f5" className="lnk-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      {/* apartment blocks */}
      {[[40, 70, 70, 114], [118, 44, 86, 140], [212, 82, 64, 102], [284, 56, 80, 128]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill={i % 2 ? "#1b3f3b" : "#16332f"} />
          {Array.from({ length: Math.floor(h / 24) }).map((_, r) =>
            Array.from({ length: Math.floor((w - 10) / 16) }).map((__, c) => {
              const lit = (i * 5 + r * 3 + c * 2) % 3 === 0;
              return (
                <rect key={`${r}-${c}`} x={x + 8 + c * 16} y={y + 10 + r * 24} width="9" height="12" rx="1.5" fill={lit ? GOLD : "#0e1a18"} opacity={lit ? 0.85 : 0.5} />
              );
            })
          )}
        </g>
      ))}
      <rect x="0" y="160" width="411" height="24" fill="#0b1513" />
      {/* subway sign */}
      <g transform="translate(350 128)">
        <circle r="22" fill="#101e1c" stroke="#3fa393" strokeWidth="3" />
        <text textAnchor="middle" y="7" fontSize="20" fontWeight="800" fill="#f3f7f5" fontFamily="Pretendard, sans-serif">2</text>
      </g>
      {/* key */}
      <g transform="translate(20 134)" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M21 12 H46 M38 12 V20 M46 12 V18" />
      </g>
    </svg>
  );
}

/* ---------- small decorative mark used on section headers ---------- */
export function PathDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden="true">
      <path d="M2 6 C20 -2 36 14 58 6 S100 -2 118 6" fill="none" stroke="#3fa393" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" className="lnk-path-flow" />
    </svg>
  );
}
