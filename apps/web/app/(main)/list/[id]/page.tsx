'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, TodoList, TodoItem, BrutalHonesty } from '../../../lib/api';
import DoodleBox from '../../../components/DoodleBox';

/* ─── Priority colour map ─── */
const PRIORITY_BG: Record<TodoItem['priority'], string> = {
  LOW: '#b8f0c8',
  MEDIUM: '#fff0a0',
  HIGH: '#ffb3c1',
};

/* ─── Reusable small components ─── */

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
      style={{
        width: '22px',
        height: '22px',
        minWidth: '22px',
        border: '2px solid #1a1a1a',
        background: checked ? '#1a1a1a' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: 800,
        fontSize: '13px',
        color: '#fff',
        flexShrink: 0,
        transition: 'background 0.12s',
        padding: 0,
      }}
    >
      {checked ? '✓' : ''}
    </button>
  );
}

function PriorityBadge({ priority }: { priority: TodoItem['priority'] }) {
  return (
    <span
      style={{
        background: PRIORITY_BG[priority],
        fontSize: '11px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '3px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        lineHeight: '1.6',
        letterSpacing: '0.04em',
      }}
    >
      {priority}
    </span>
  );
}

/* ─── Main page ─── */

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const router = useRouter();

  const [list, setList] = useState<TodoList | null>(null);
  const [brutalHonesty, setBrutalHonesty] = useState<BrutalHonesty | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [warningId, setWarningId] = useState<string | null>(null);

  /* ── Data loading ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await api.getList(listId);
        if (cancelled) return;
        if (res.status === 'success') {
          setList(res.data);
          const stored = sessionStorage.getItem(`brutal_${listId}`);
          if (stored) setBrutalHonesty(JSON.parse(stored));
        } else {
          router.push('/dashboard');
        }
      } catch {
        if (cancelled) return;
        router.push('/dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listId, router]);

  /* ── Handlers ── */
  async function handleToggle(itemId: string) {
    const item = list!.items.find((i) => i.id === itemId);
    if (!item) return;

    const blockedBy = list!.items.find((i) => i.order < item.order && !i.isCompleted);
    if (blockedBy && !item.isCompleted) {
      setWarningId(itemId);
      setTimeout(() => setWarningId(null), 3000);
      return;
    }

    const res = await api.toggleItem(itemId);
    if (res.status === 'success') {
      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === itemId ? { ...i, isCompleted: res.data.isCompleted } : i,
              ),
            }
          : prev,
      );
      window.dispatchEvent(new Event('todo-updated'));
    }
  }

  async function handleToggleAnyway(itemId: string) {
    setWarningId(null);
    const res = await api.toggleItem(itemId);
    if (res.status === 'success') {
      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.id === itemId ? { ...i, isCompleted: res.data.isCompleted } : i,
              ),
            }
          : prev,
      );
      window.dispatchEvent(new Event('todo-updated'));
    }
  }

  async function handlePriorityChange(itemId: string, priority: TodoItem['priority']) {
    await api.updateItem(itemId, { priority });
    setList((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) => (i.id === itemId ? { ...i, priority } : i)),
          }
        : prev,
    );
  }

  async function handleDueDateChange(itemId: string, dueDate: string) {
    await api.updateItem(itemId, { dueDate });
    setList((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) => (i.id === itemId ? { ...i, dueDate } : i)),
          }
        : prev,
    );
  }

  async function handleDelete(itemId: string) {
    await api.deleteItem(itemId);
    setList((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((i) => i.id !== itemId),
          }
        : prev,
    );
  }

  async function handleAddTask() {
    const trimmed = newTask.trim();
    if (!trimmed || !list) return;
    const res = await api.addItem(list.id, trimmed);
    if (res.status === 'success') {
      setList((prev) => (prev ? { ...prev, items: [...prev.items, res.data] } : prev));
      setNewTask('');
    }
  }

  async function handleDeleteList() {
    if (!confirm('Delete this whole goal list? This cannot be undone.')) return;
    await api.deleteList(listId);
    router.push('/dashboard');
  }

  /* ── Guard states ── */
  if (loading) return null;
  if (!list) return null;

  const counts = list.counts ?? {
    pending: list.items.filter((item) => !item.isCompleted).length,
    completed: list.items.filter((item) => item.isCompleted).length,
    total: list.items.length,
  };
  const completed = counts.completed;
  const pending = counts.pending;
  const total = counts.total;
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="l-page">
      <img src="/stickies.png" alt="" className="l-decor" />

      <div className="l-scroll">
  <div className="l-col" style={{ maxWidth: '820px' }}>
            <div style={{ marginBottom: '32px' }}>
              <button
                className="btn btn-ghost"
                onClick={() => router.push('/dashboard')}
                style={{
                  marginBottom: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ← back
              </button>

              <h1
                style={{
                  fontSize: 'clamp(22px, 4vw, 30px)',
                  fontWeight: 800,
                  lineHeight: 1.25,
                  marginBottom: '18px',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {list.goal}
              </h1>

              <div className="progress-row">
                <span className="progress-label">
                  {completed}/{total} done
                </span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="progress-pct">{progressPct}%</span>
              </div>
            </div>

            {brutalHonesty && (
              <div className="sticky-note" style={{ marginBottom: '32px' }}>
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    opacity: 0.55,
                    marginBottom: '8px',
                  }}
                >
                  Brutal Honesty
                </p>

                <p
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: '10px',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  &ldquo;{brutalHonesty.verdict}&rdquo;
                </p>

                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.75,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    marginBottom: '14px',
                  }}
                >
                  {brutalHonesty.reasoning}
                </p>

                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {brutalHonesty.isAchievable ? (
                    <>
                      <span>✓</span> Achievable
                    </>
                  ) : (
                    <>
                      <span>✗</span> Probably not happening
                    </>
                  )}
                </p>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {list.items.length === 0 && (
                <p
                  style={{
                    textAlign: 'center',
                    color: 'var(--ink-muted)',
                    fontSize: 'var(--text-sm)',
                    padding: '32px 0',
                  }}
                >
                  no tasks yet — add one below!
                </p>
              )}

              {list.items.map((item, idx) => (
                <DoodleBox key={item.id} seed={idx + 10}>
                  <div
                    style={{
                      padding: '14px 16px',
                      background: item.isCompleted
                        ? 'rgba(187,247,208,0.35)'
                        : 'rgba(255,255,255,0.82)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        minWidth: 0,
                      }}
                    >
                      <Checkbox checked={item.isCompleted} onClick={() => handleToggle(item.id)} />

                      <span
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          lineHeight: 1.5,
                          cursor: 'pointer',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          paddingTop: '1px',
                          textDecoration: item.isCompleted ? 'line-through' : 'none',
                          opacity: item.isCompleted ? 0.45 : 1,
                        }}
                      >
                        {item.task}
                      </span>

                      <PriorityBadge priority={item.priority} />

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete task"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '15px',
                          color: '#ef4444',
                          padding: '0 2px',
                          lineHeight: 1,
                          flexShrink: 0,
                          marginTop: '2px',
                          opacity: 0.7,
                          transition: 'opacity 0.12s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                      >
                        ✕
                      </button>
                    </div>

                    {warningId === item.id && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          background: '#fff0a0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontSize: 'var(--text-sm)' }}>
                          ⚠️ Previous tasks aren&apos;t done yet!
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleAnyway(item.id)}
                          style={{
                            background: '#1a1a1a',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 12px',
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0,
                            letterSpacing: '0.04em',
                          }}
                        >
                          do it anyway
                        </button>
                      </div>
                    )}

                    {expandedId === item.id && (
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px dashed #ccc',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--ink-muted)',
                            fontWeight: 600,
                          }}
                        >
                          Priority:
                        </span>
                        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePriorityChange(item.id, p)}
                            style={{
                              fontSize: 'var(--text-xs)',
                              fontFamily: 'inherit',
                              padding: '3px 10px',
                              border: '1.5px solid #1a1a1a',
                              cursor: 'pointer',
                              background: item.priority === p ? PRIORITY_BG[p] : 'transparent',
                              fontWeight: item.priority === p ? 800 : 500,
                              borderRadius: '3px',
                              transition: 'background 0.12s',
                            }}
                          >
                            {p}
                          </button>
                        ))}

                        <span
                          style={{
                            display: 'inline-block',
                            width: '1px',
                            height: '16px',
                            background: '#ddd',
                            margin: '0 4px',
                          }}
                        />

                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--ink-muted)',
                            fontWeight: 600,
                          }}
                        >
                          Due:
                        </span>
                        <input
                          type="date"
                          value={item.dueDate ? item.dueDate.slice(0, 10) : ''}
                          onChange={(e) => handleDueDateChange(item.id, e.target.value)}
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'inherit',
                            border: '1.5px solid #1a1a1a',
                            background: 'transparent',
                            padding: '3px 8px',
                            outline: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </DoodleBox>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '40px',
                alignItems: 'stretch',
              }}
            >
              <DoodleBox seed={401} style={{ flex: 1, minWidth: 0 }}>
                <input
                  id="add-task-input"
                  className="input"
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="add another task..."
                />
              </DoodleBox>

              <DoodleBox seed={402} style={{ width: '52px', flexShrink: 0 }}>
                <button
                  id="add-task-btn"
                  type="button"
                  onClick={handleAddTask}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '52px',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '24px',
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </DoodleBox>
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
              <button className="btn btn-danger" onClick={handleDeleteList}>
                delete this list
              </button>
           </div>
          </div>
        </div>
      </div>
  );
}
