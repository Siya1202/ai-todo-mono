'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

const PHRASES = [
  'thinking hard...',
  'judging your life choices...',
  'being brutally honest...',
  'building your list...',
  'almost there...',
];

export default function LoadingPage() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [dots, setDots]           = useState('');
  const router = useRouter();

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIdx(i => (i + 1) % PHRASES.length);
    }, 1800);

    const dotsTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);

    (async () => {
      const goal    = sessionStorage.getItem('pending_goal');
      const dueDate = sessionStorage.getItem('pending_due_date');
      if (!goal) { router.push('/'); return; }

      try {
        const res = await api.generateList(goal, dueDate || undefined);
        if (res.status === 'success') {
          sessionStorage.setItem(
            `brutal_${res.data.todoList.id}`,
            JSON.stringify(res.data.brutalHonesty),
          );
          router.push(`/list/${res.data.todoList.id}`);
        } else {
          router.push('/?error=failed');
        }
      } catch {
        router.push('/?error=failed');
      }
    })();

    return () => {
      clearInterval(phraseTimer);
      clearInterval(dotsTimer);
    };
  }, [router]);

  return (
    <div className="l-page">
      <img src="/stickies.png" alt="" className="l-decor" />

      {/* Full-screen centred loading indicator */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          gap: '24px',
        }}
      >
        {/* Animated sketch cross / scribble */}
        <svg
          viewBox="0 0 80 80"
          width="72"
          height="72"
          aria-hidden="true"
        >
          <style>{`
            @keyframes scribble {
              0%   { stroke-dashoffset: 400; opacity: 0.3; }
              50%  { opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 0.3; }
            }
            .sk {
              fill: none;
              stroke: #1a1a1a;
              stroke-width: 2.8;
              stroke-linecap: round;
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              animation: scribble 1.4s ease-in-out infinite;
            }
          `}</style>
          <path
            className="sk"
            d="M40 10 Q42 38 40 70 M10 40 Q38 42 70 40 M18 18 Q40 40 62 62 M62 18 Q40 40 18 62"
          />
        </svg>

        {/* Rotating phrase with fixed minimum width so text doesn't jump */}
        <p style={{
          fontSize: '18px',
          fontWeight: 600,
          textAlign: 'center',
          minWidth: '260px',
          color: '#1a1a1a',
        }}>
          {PHRASES[phraseIdx]}{dots}
        </p>
      </div>
    </div>
  );
}