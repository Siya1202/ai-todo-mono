'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DoodleBox from './DoodleBox';
import { api, TodoList } from '../lib/api';

function getProgress(list: TodoList) {
  const total = list.items?.length ?? 0;
  if (total === 0) return { done: 0, total: 0, pct: 0 };
  const done = list.items.filter((i) => i.isCompleted).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userInitial, setUserInitial] = useState('');
  const [lists, setLists] = useState<TodoList[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.name || 'Siya Sinnarkar';
    setUserName(name);
    setUserInitial(name.charAt(0).toUpperCase());

    // ✅ fetch all lists for the sidebar
    api.getAllLists().then((res) => {
      if (res.status === 'success') setLists(res.data);
    });
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  const isDashboard = pathname === '/dashboard' || pathname === '/';

  // derive real counts across all lists
  const totalPending = lists.reduce((acc, l) => {
    const pending = l.counts?.pending ?? l.items?.filter((i) => !i.isCompleted).length ?? 0;
    return acc + pending;
  }, 0);
  const totalCompleted = lists.reduce((acc, l) => {
    const completed = l.counts?.completed ?? l.items?.filter((i) => i.isCompleted).length ?? 0;
    return acc + completed;
  }, 0);

  return (
    <aside
      className="l-sidebar"
      style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-6) var(--space-5)' }}
    >
      {/* Header */}
      <h1
        style={{
          fontFamily: 'inherit',
          fontSize: '22px',
          fontWeight: 800,
          marginBottom: '24px',
          letterSpacing: '-0.5px',
        }}
      >
        AI Todo
      </h1>

      {/* CTA Button */}
      <DoodleBox seed={900} style={{ marginBottom: '32px' }}>
  <button
    className="btn btn-primary"
    onClick={() => router.push('/')}
  >
    New Task List
  </button>
</DoodleBox>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* VIEWS */}
        <div>
          <h2 className="t-label" style={{ marginBottom: '12px' }}>
            VIEWS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                background: isDashboard ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                color: isDashboard ? '#dc2626' : 'var(--ink-muted)',
                fontWeight: isDashboard ? 700 : 600,
                fontSize: 'var(--text-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>⌘</span>
                Dashboard
              </div>
              <span
                style={{
                  background: isDashboard ? 'rgba(0,0,0,0.06)' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--ink-muted)',
                }}
              >
                {lists.length}
              </span>
            </Link>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--grid)', opacity: 0.6 }} />

        {/* YOUR LISTS — ➕ NEW SECTION */}
        <div>
          <h2 className="t-label" style={{ marginBottom: '12px' }}>
            YOUR LISTS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lists.length === 0 && (
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-faint)',
                  padding: '4px 12px',
                }}
              >
                no lists yet — hit "New Task List" to create one
              </p>
            )}
            {lists.map((list, idx) => {
              const { done, total, pct } = getProgress(list);
              const isActive = pathname === `/list/${list.id}`;
              return (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  style={{
                    display: 'block',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(220, 38, 38, 0.07)' : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${isActive ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Goal text */}
                  <p
                    style={
                      {
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: isActive ? '#dc2626' : 'var(--ink)',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                      } as React.CSSProperties
                    }
                  >
                    {list.goal}
                  </p>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '4px',
                        background: 'rgba(0,0,0,0.08)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: pct === 100 ? '#10b981' : '#dc2626',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--ink-faint)',
                        whiteSpace: 'nowrap',
                        minWidth: '36px',
                        textAlign: 'right',
                      }}
                    >
                      {done}/{total}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--grid)', opacity: 0.6 }} />

        {/* STATUS OVERVIEW — real counts now */}
        <div>
          <h2 className="t-label" style={{ marginBottom: '12px' }}>
            OVERVIEW
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-muted)',
                fontWeight: 600,
                padding: '4px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#9ca3af',
                  }}
                />
                Pending
              </div>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{totalPending}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-muted)',
                fontWeight: 600,
                padding: '4px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                  }}
                />
                Completed
              </div>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{totalCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          height: '1px',
          background: 'var(--grid)',
          opacity: 0.6,
          marginTop: '24px',
          marginBottom: '24px',
        }}
      />

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#8c827c',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
            }}
          >
            {userInitial}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-muted)' }}>
            {userName}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ink-muted)',
            fontSize: '14px',
            fontWeight: 600,
            padding: '4px',
            alignSelf: 'flex-start',
          }}
        >
          <span style={{ fontSize: '16px' }}>⎋</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
