'use client';

import { useRef, useEffect, useState, CSSProperties } from 'react';

interface DoodleBoxProps {
  children: React.ReactNode;
  seed?: number;
  /** Extra className on the outer wrapper div */
  className?: string;
  /** Extra inline styles on the outer wrapper div */
  style?: CSSProperties;
}

/** Simple LCG pseudo-random generator seeded by an integer */
function makeRng(seed: number) {
  let s = seed;
  return (): number => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * DoodleBox — draws a hand-drawn sketch border around its children using SVG.
 *
 * IMPORTANT implementation notes:
 * - The SVG is absolutely positioned and `overflow: visible`, so it never
 *   affects layout or document flow.
 * - Children are rendered INSIDE the same wrapper div (no extra wrapping div),
 *   so form elements, inputs, buttons etc. inherit sizing correctly.
 * - The wrapper is always `display: block; width: 100%` so it fills its parent.
 */
export default function DoodleBox({
  children,
  seed = 1,
  className = '',
  style,
}: DoodleBoxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const { offsetWidth: w, offsetHeight: h } = el;
      if (w > 0 && h > 0) setSize({ w, h });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Build the 4 slightly-wobbly lines */
  const lines = size ? (() => {
    const rng = makeRng(seed);
    const j = () => (rng() - 0.5) * 3;   // ±1.5 px jitter
    const ov = 5;                          // overshoot at corners
    const { w, h } = size;
    return [
      // top
      { x1: -ov + j(), y1: j(),      x2: w + ov + j(), y2: j()      },
      // bottom
      { x1: -ov + j(), y1: h + j(),  x2: w + ov + j(), y2: h + j()  },
      // left
      { x1: j(),       y1: -ov + j(), x2: j(),          y2: h + ov + j() },
      // right
      { x1: w + j(),   y1: -ov + j(), x2: w + j(),      y2: h + ov + j() },
    ];
  })() : [];

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        ...style,
      }}
    >
      {/* SVG border — absolutely positioned, never pushes layout */}
      {size && (
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          viewBox={`0 0 ${size.w} ${size.h}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1}
              x2={l.x2} y2={l.y2}
              stroke="#1a1a1a"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}

      {/*
        Children are rendered at z-index 1 to sit above the SVG lines.
        We use a single inner div so the z-index stacking is explicit,
        but we do NOT change width/display — the div is transparent to layout.
      */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
