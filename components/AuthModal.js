'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { signIn } from 'next-auth/react';

export default function AuthModal({ isOpen, onClose, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const dialogRef = useRef(null);

  // form state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { setActiveTab(defaultTab); setMsg(null); }, [defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const el = dialogRef.current;
    const focusable = el?.querySelectorAll('input, button');
    focusable?.[0]?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null); setLoading(true);
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    setMsg('Logged in'); 
    onClose();
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMsg(null); setLoading(true);
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}` }
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    setMsg('Check your email to confirm.');
    // можно не закрывать модалку, чтобы показать сообщение
  }

  return (
    <div className="modal is-open" aria-modal="true" role="dialog">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__dialog" ref={dialogRef}>
        <button className="modal__close" onClick={onClose} aria-label="Close">&times;</button>

        <div className="tabs">
          <button className={`tabs__btn ${activeTab === 'login' ? 'is-active' : ''}`} onClick={() => { setActiveTab('login'); setMsg(null); }}>Login</button>
          <button className={`tabs__btn ${activeTab === 'register' ? 'is-active' : ''}`} onClick={() => { setActiveTab('register'); setMsg(null); }}>Register</button>
        </div>

        {msg && <div style={{marginBottom:10, color:'#9fd'}}> {msg} </div>}

        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <label className="block" htmlFor="loginEmail">Email</label>
            <input id="loginEmail" name="email" type="email" className="form__input" required />
            <label className="block" htmlFor="loginPass" style={{marginTop:8}}>Password</label>
            <input id="loginPass" name="password" type="password" className="form__input" required />
            <button type="submit" className="btn--primary block" style={{marginTop:10}} disabled={loading}>
              {loading ? '...' : 'Sign in'}
            </button>
          </form>
          
        )}
        <button
          type="button"
          onClick={() => signIn('kick', { callbackUrl: '/' })}
          className="btn--primary block"
          style={{ marginTop: 10, backgroundColor: '#53fc18' }}
        >
          Login with Kick
        </button>
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <label className="block" htmlFor="regEmail">Email</label>
            <input id="regEmail" name="email" type="email" className="form__input" required />
            <label className="block" htmlFor="regPass" style={{marginTop:8}}>Password</label>
            <input id="regPass" name="password" type="password" className="form__input" minLength={6} required />
            <button type="submit" className="btn--primary block" style={{marginTop:10}} disabled={loading}>
              {loading ? '...' : 'Create account'}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => signIn('kick', { callbackUrl: '/' })}
          className="btn--primary block"
          style={{ marginTop: 10, backgroundColor: '#53fc18' }}
        >
          Sign up with Kick
        </button>
      </div>
    </div>
  );
}
