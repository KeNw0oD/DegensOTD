'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { signIn } from 'next-auth/react';

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
  forceUsername = false,
  forceUsernameForm = false,
  onUsernameSaved
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showUsernameForm, setShowUsernameForm] = useState(forceUsernameForm);
  const dialogRef = useRef(null);

  // При открытии модалки сбрасываем состояние на то, что пришло в пропсах
  useEffect(() => {
    if (isOpen) {
      setShowUsernameForm(forceUsernameForm);
      setActiveTab(defaultTab);
    }
  }, [isOpen, forceUsernameForm, defaultTab]);

  // Ловим ошибку из URL (например, после Kick)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');

  if (err === 'EMAIL_EXISTS') {
    setActiveTab('login');
    setMsg('This email is already registered. Please log in.');
    window.history.replaceState({}, '', window.location.pathname);
  }
}, []);

  // Блокировка скролла
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Фокус на первом элементе
  useEffect(() => {
    if (!isOpen) return;
    const el = dialogRef.current;
    const focusable = el?.querySelectorAll('input, button');
    focusable?.[0]?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  // Логин
  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const email = e.currentTarget.email.value.trim().toLowerCase();
    const password = e.currentTarget.password.value;

    const { data: existing } = await supabase
      .from('users')
      .select('nickname')
      .eq('email', email)
      .maybeSingle();

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setLoading(false);
      return setMsg(loginError.message || 'Invalid email or password.');
    }

    setLoading(false);

    if (!existing?.nickname) {
      setShowUsernameForm(true); // показываем форму ника
    } else {
      onClose();
    }
  }

  // Регистрация
  async function handleRegister(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const email = e.currentTarget.email.value.trim().toLowerCase();
    const password = e.currentTarget.password.value;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}?usernameRequired=1` }
    });

    if (signUpError) {
      setLoading(false);
      return setMsg(signUpError.message || 'Registration failed.');
    }

    await supabase
      .from('users')
      .upsert({ email, is_verified: false }, { onConflict: 'email' });

    setLoading(false);
    setMsg('Check your email to confirm your account.');
  }

  // Сохранение ника
  async function saveUsername(e) {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value.trim();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return setMsg('You must be logged in to set a username.');
    }

    const { error } = await supabase
      .from('users')
      .update({ nickname: username })
      .eq('email', user.email.toLowerCase());

    setLoading(false);

    if (error) {
      return setMsg('Failed to save username. Try again.');
    }

    if (onUsernameSaved) onUsernameSaved(username);
  }

  return (
    <div className="modal is-open" aria-modal="true" role="dialog">
      <div
        className="modal__backdrop"
        onClick={() => { if (!forceUsername) onClose(); }}
      />
      <div className="modal__dialog" ref={dialogRef}>
        {!showUsernameForm && (
          <>
            <div className="tabs">
              <button
                className={`tabs__btn ${activeTab === 'login' ? 'is-active' : ''}`}
                onClick={() => { setActiveTab('login'); setMsg(null); }}
              >
                Login
              </button>
              <button
                className={`tabs__btn ${activeTab === 'register' ? 'is-active' : ''}`}
                onClick={() => { setActiveTab('register'); setMsg(null); }}
              >
                Register
              </button>
            </div>

            {msg && <div style={{ marginBottom: 10, color: '#9fd' }}>{msg}</div>}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin}>
                <label>Email</label>
                <input name="email" type="email" className="form__input" required />
                <label style={{ marginTop: 8 }}>Password</label>
                <input name="password" type="password" className="form__input" required />
                <button type="submit" className="btn--primary block" disabled={loading}>
                  {loading ? '...' : 'Sign in'}
                </button>
                <button type="button" onClick={() => signIn('kick', { callbackUrl: '/' })} className="btn--kick">
                  Login with Kick
                </button>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister}>
                <label>Email</label>
                <input name="email" type="email" className="form__input" required />
                <label style={{ marginTop: 8 }}>Password</label>
                <input name="password" type="password" className="form__input" minLength={6} required />
                <button type="submit" className="btn--primary block" disabled={loading}>
                  {loading ? '...' : 'Create account'}
                </button>
                <button type="button" onClick={() => signIn('kick', { callbackUrl: '/' })} className="btn--kick">
                  Sign up with Kick
                </button>
              </form>
            )}
          </>
        )}

        {showUsernameForm && (
          <form onSubmit={saveUsername}>
            <label>Choose your username</label>
            <input name="username" type="text" className="form__input" required />
            <button type="submit" className="btn--primary block" disabled={loading}>
              {loading ? '...' : 'Save username'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
