'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, TodoList } from '../../lib/api';
import DoodleBox from '../../components/DoodleBox';

function getProgress(list: TodoList) {
  const total = list.items.length;
  if (total === 0) return { done: 0, total: 0, pct: 0 };
  const done = list.items.filter(i => i.isCompleted).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export default function DashboardPage() {
  const router = useRouter();
  const [lists, setLists]       = useState<TodoList[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || 'there');

    api.getAllLists().then(res => {
      if (res.status === 'success') setLists(res.data);
      setLoading(false);
    });
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  if (loading) return null;

  return (
    <div className="l-page">
      <img src="/stickies.png" alt="" className="l-decor" />

      <div className="l-scroll">
        <div className="l-col" style={{ maxWidth: 'var(--max-content)' }}>

          {/* ── Page header ── */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '6px',
              }}>
                hey, {userName}! 
              </h1>
              <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-base)' }}>
                here are all your goal lists
              </p>
            </div>

            <button
              className="btn btn-ghost"
              onClick={handleLogout}
              style={{ marginTop: '6px', flexShrink: 0 }}
            >
              log out
            </button>
          </div>

          {/* ── Empty state ── */}
          {lists.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
              color: 'var(--ink-muted)',
            }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>✏️</p>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: '8px' }}>
                no goal lists yet
              </p>
              <p style={{ fontSize: 'var(--text-base)' }}>
                hit the <strong>+</strong> button to create your first one!
              </p>
            </div>
          )}

          {/* ── Goal list ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {lists.map((list, idx) => {
              const { done, total, pct } = getProgress(list);
              return (
                <DoodleBox key={list.id} seed={idx + 100}>
                  <Link href={`/list/${list.id}`} className="goal-link">

                    {/* Top row: goal text + date */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      <span style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 700,
                        lineHeight: 1.4,
                        flex: 1,
                        minWidth: 0,
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}>
                        {list.goal}
                      </span>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--ink-muted)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        paddingTop: '3px',
                        letterSpacing: '0.03em',
                      }}>
                        {new Date(list.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Progress row */}
                    <div className="progress-row">
                      <span className="progress-label">{done}/{total} done</span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="progress-pct">{pct}%</span>
                    </div>

                  </Link>
                </DoodleBox>
              );
            })}
          </div>

        </div>
      </div>

      {/* Floating action button */}
      <Link href="/" className="fab" title="Create new goal list" aria-label="Create new goal">
        +
      </Link>
    </div>
  );
}
