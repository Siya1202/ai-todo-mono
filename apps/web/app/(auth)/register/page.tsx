'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import DoodleBox from '../../components/DoodleBox';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function handleRegister() {
    if (busy) return;
    setError('');

    if (!name.trim())     { setError('Enter your name.');     return; }
    if (!email.trim())    { setError('Enter your email.');    return; }
    if (!password.trim()) { setError('Enter a password.');    return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setBusy(true);
    const res = await api.register(name.trim(), email.trim(), password);
    setBusy(false);

    if (res.status === 'success') {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Try again.');
    }
  }

  return (
    <div className="l-page">
      <img src="/stickies.png" alt="" className="l-decor" />

      <div className="l-center">
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>

          <h1 style={{
            fontSize: '38px',
            fontWeight: 800,
            marginBottom: '6px',
            lineHeight: 1.15,
          }}>
            create account
          </h1>
          <p style={{
            color: 'var(--ink-muted)',
            fontSize: 'var(--text-base)',
            marginBottom: '36px',
          }}>
            start crushing your goals with AI
          </p>

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

          {/* Name */}
          <DoodleBox seed={201} style={{ marginBottom: '14px' }}>
            <input
              id="reg-name"
              className="input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              placeholder="your name"
              autoComplete="name"
            />
          </DoodleBox>

          {/* Email */}
          <DoodleBox seed={202} style={{ marginBottom: '14px' }}>
            <input
              id="reg-email"
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              placeholder="email address"
              autoComplete="email"
            />
          </DoodleBox>

          {/* Password */}
          <DoodleBox seed={203} style={{ marginBottom: '28px' }}>
            <input
              id="reg-password"
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              placeholder="password (min 6 chars)"
              autoComplete="new-password"
            />
          </DoodleBox>

          <DoodleBox seed={204} style={{ marginBottom: '20px' }}>
            <button
              id="reg-submit"
              className="btn btn-primary"
              onClick={handleRegister}
              disabled={busy}
            >
              {busy ? 'creating account...' : 'SIGN UP →'}
            </button>
          </DoodleBox>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: 'var(--ink)',
                fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}