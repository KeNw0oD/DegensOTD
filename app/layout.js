import '../style/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import { Funnel_Display } from 'next/font/google';

export const metadata = { title: 'DEGENS OTD', description: '' };

/** подключаем шрифт в модульной области */
const funnel = Funnel_Display({
  weight: ['400', '500', '600'], // можно убрать 700, если не нужен
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* применяем класс шрифта ко всему телу */}
      <body className={funnel.className}>
        <Providers>
          <img src="/logo.png" alt="Degens OTD" className="logo-fixed" />
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
