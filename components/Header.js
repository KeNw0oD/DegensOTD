'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import AuthModal from './AuthModal';
import WaveOverlay from './WaveOverlay';
import { Funnel_Display } from 'next/font/google';
import { logout } from "../lib/logout";
import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ добавили

const funnel = Funnel_Display({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Header({ nickname }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('login');
  const pathname = usePathname(); // ✅ узнаём текущий путь

  const displayName =
    nickname || session?.user?.name || session?.user?.email || null;

  return (
    <>
      <header className="header">
        <div className={`header-inner ${funnel.className}`}>
          <nav className="menu" aria-label="Main">
            {/* Кнопка меняется автоматически */}
            <Link
              href={pathname === '/leaderboard' ? '/' : '/leaderboard'}
              className="menu__link is-active"
            >
              {pathname === '/leaderboard' ? 'Home' : 'Leaderboard'}
            </Link>

            <a href="#" className="menu__link">Stream Schedule</a>
            <a href="#" className="menu__link">Community Pot</a>
            <a href="#" className="menu__link">Big Win Clip</a>
            <a href="#" className="menu__link">Special Events</a>
            <a href="#" className="menu__link">Degens Shop</a>
          </nav>

          <div className="auth">
            {displayName ? (
              <>
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                  />
                )}
                <span style={{ opacity: 0.8 }}>{displayName}</span>
                <span className="dot" />
                <button
                  className="btn btn--ghost"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setTab('login'); setIsOpen(true); }}
                  className="btn btn--ghost"
                >
                  Login
                </button>
                <span className="dot" />
                <button
                  onClick={() => { setTab('register'); setIsOpen(true); }}
                  className="btn btn--primary"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>

        <AuthModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          defaultTab={tab}
        />
      </header>

      <WaveOverlay />
    </>
  );
}
