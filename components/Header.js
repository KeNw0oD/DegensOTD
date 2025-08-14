'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import AuthModal from './AuthModal';
import WaveOverlay from './WaveOverlay';
import { Funnel_Display } from 'next/font/google';

/** ⬇️ ДОЛЖНО БЫТЬ СНАРУЖИ (module scope) */
const funnel = Funnel_Display({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Header() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('login');

  return (
    <>
      <header className="header">
        <div className={`header-inner ${funnel.className}`}>
          <nav className="menu" aria-label="Main">
            <a href="#" className="menu__link is-active">Leaderboard</a>
            <a href="#" className="menu__link">Stream Schedule</a>
            <a href="#" className="menu__link">Community Pot</a>
            <a href="#" className="menu__link">Big Win Clip</a>
            <a href="#" className="menu__link">Special Events</a>
            <a href="#" className="menu__link">Degens Shop</a>
          </nav>

          <div className="auth">
            {session?.user ? (
              <>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                  />
                )}
                <span style={{ opacity: 0.8 }}>{session.user.name || session.user.email}</span>
                <span className="dot" />
                <button className="btn btn--ghost" onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setTab('login'); setIsOpen(true); }} className="btn btn--ghost">
                  Login
                </button>
                <span className="dot" />
                <button onClick={() => { setTab('register'); setIsOpen(true); }} className="btn btn--primary">
                  Register
                </button>
              </>
            )}
          </div>
        </div>

        <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} defaultTab={tab} />
      </header>

      <WaveOverlay />
    </>
  );
}
