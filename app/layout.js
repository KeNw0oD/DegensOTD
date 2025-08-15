// app/layout.js
'use client';

import '../style/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import { Funnel_Display } from 'next/font/google';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AuthModal from '../components/AuthModal';

const funnel = Funnel_Display({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forceUsername, setForceUsername] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    async function checkUserNickname() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        const { data: profile } = await supabase
          .from('users')
          .select('nickname')
          .eq('email', user.email.toLowerCase())
          .maybeSingle();

        if (!profile?.nickname) {
          setForceUsername(true);
          setShowUsernameForm(true); // сразу открываем форму ника
          setIsModalOpen(true);
        } else {
          setNickname(profile.nickname);
        }
      }
    }

    // Если пришли по ссылке после регистрации
    const params = new URLSearchParams(window.location.search);
    if (params.get('usernameRequired') === '1') {
      setForceUsername(true);
      setShowUsernameForm(true); // сразу форма ника
      setIsModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname); // убираем параметр из URL
    }

    checkUserNickname();
  }, []);

  return (
    <html lang="en">
      <body className={funnel.className}>
        <Providers>
          <img src="/logo.png" alt="Degens OTD" className="logo-fixed" />
          <Header nickname={nickname} /> {/* Передаём ник в Header */}
          <main className="main">{children}</main>
          <Footer />
        </Providers>

        {isModalOpen && (
          <AuthModal
            isOpen={isModalOpen}
            onClose={() => {
              if (!forceUsername) setIsModalOpen(false);
            }}
            defaultTab="login"
            forceUsername={forceUsername}
            forceUsernameForm={showUsernameForm} // новый пропс
            onUsernameSaved={(username) => {
              setNickname(username);
              setForceUsername(false);
              setShowUsernameForm(false);
              setIsModalOpen(false);
            }}
          />
        )}
      </body>
    </html>
  );
}
