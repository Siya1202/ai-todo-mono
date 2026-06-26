'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import DoodleBox from '../../components/DoodleBox';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function handleLogin() {
    if (busy) return;
    setError('');

    if (!email.trim())    { setError('Enter your email.');    return; }
    if (!password.trim()) { setError('Enter your password.'); return; }

    setBusy(true);
    const res = await api.login(email.trim(), password);
    setBusy(false);

    if (res.status === 'success') {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } else {
      setError(res.message || 'Login failed. Try again.');
    }
  }

  return (
    <div className="l-page">
      {/* Decorative stickies background */}
      <img src="/stickies.png" alt="" className="l-decor" />

      {/* Vertically + horizontally centred */}
      <div className="l-center">
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>

          {/* Heading */}
          <h1 style={{
            fontSize: '38px',
            fontWeight: 800,
            marginBottom: '6px',
            lineHeight: 1.15,
          }}>
            welcome back!
          </h1>
          <p style={{
            color: 'var(--ink-muted)',
            fontSize: 'var(--text-base)',
            marginBottom: '36px',
          }}>
            log in to see your goal lists
          </p>

          {/* Error banner */}
          {error && (
            <p style={{
              color: '#b91c1c',
              fontSize: 'var(--text-sm)',
              marginBottom: '16px',
              padding: '10px 14px',
              background: '#fee2e2',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
            }}>
              {error}
            </p>
          )}

          {/* Email */}
          <DoodleBox seed={101} style={{ marginBottom: '14px' }}>
            <input
              id="login-email"
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="email address"
              autoComplete="email"
            />
          </DoodleBox>

          {/* Password */}
          <DoodleBox seed={102} style={{ marginBottom: '28px' }}>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="password"
              autoComplete="current-password"
            />
          </DoodleBox>

          {/* Submit */}
          <DoodleBox seed={103} style={{ marginBottom: '20px' }}>
            <button
              id="login-submit"
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={busy}
            >
              {busy ? 'logging in...' : 'LOG IN →'}
            </button>
          </DoodleBox>

          {/* Link to register */}
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            don&apos;t have an account?{' '}
            <Link
              href="/register"
              style={{
                color: 'var(--ink)',
                fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}