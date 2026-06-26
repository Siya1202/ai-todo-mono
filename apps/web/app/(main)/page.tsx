'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import DoodleBox from '../components/DoodleBox';

export default function CreateGoalPage() {
  const router = useRouter();
  const [goal, setGoal]     = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  async function handleSubmit() {
    const trimmed = goal.trim();
    if (!trimmed) { setError('Write your goal first!');   return; }
    if (!dueDate) { setError('Pick a deadline date!');   return; }
    setError('');
    sessionStorage.setItem('pending_goal', trimmed);
    sessionStorage.setItem('pending_due_date', dueDate);
    router.push('/loading');
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="l-page">
      <img src="/stickies.png" alt="" className="l-decor" />

      <div className="l-center">
        <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>

          {/* Heading */}
          <h1 style={{
            fontSize: '42px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            marginBottom: '10px',
            lineHeight: 1.1,
          }}>
            WHAT&apos;S YOUR GOAL?
          </h1>
          <p style={{
            color: 'var(--ink-muted)',
            fontSize: 'var(--text-base)',
            marginBottom: '40px',
          }}>
            be specific — the AI will be brutally honest about it
          </p>

          {/* Goal input */}
          <DoodleBox seed={301} style={{ marginBottom: '16px' }}>
            <input
              id="goal-input"
              className="input"
              style={{ fontSize: 'var(--text-lg)', padding: '18px 20px' }}
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. prepare for a job interview"
            />
          </DoodleBox>

          {/* Due date */}
          <DoodleBox seed={302} style={{ marginBottom: '8px' }}>
            <input
              id="goal-due-date"
              className="input"
              style={{ fontSize: 'var(--text-lg)', padding: '18px 20px' }}
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              min={today}
            />
          </DoodleBox>

          {/* Helper text */}
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-faint)',
            marginBottom: '24px',
            letterSpacing: '0.04em',
          }}>
            by when do you want to achieve this?
          </p>

          {/* Error */}
          {error && (
            <p style={{
              color: '#b91c1c',
              fontSize: 'var(--text-sm)',
              marginBottom: '14px',
              padding: '10px 14px',
              background: '#fee2e2',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <DoodleBox seed={303} style={{ marginBottom: '24px' }}>
            <button
              id="goal-submit"
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-xl)', padding: '20px 24px', letterSpacing: '0.14em' }}
              onClick={handleSubmit}
            >
              LET&apos;S GO →
            </button>
          </DoodleBox>

          {/* Back link */}
          <button
            className="btn btn-ghost"
            onClick={() => router.push('/dashboard')}
          >
            ← back to my lists
          </button>

        </div>
      </div>
    </div>
  );
}