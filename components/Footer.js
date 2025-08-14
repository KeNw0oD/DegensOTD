'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* левая зона — пусто, чтобы центр оставался центром */}
        <div />

        {/* центр: иконки */}
        <nav className="footer-icons" aria-label="Social">
          <a href="#" aria-label="Rainbet"><img src="/r-ico.png" alt="" /></a>
          <a href="#" aria-label="X"><img src="/x-ico.png" alt="" /></a>
          <a href="#" aria-label="Telegram"><img src="/tg-ico.png" alt="" /></a>
        </nav>

        {/* справа: текстовые ссылки */}
        <div className="footer-links">
          <a href="#">About us</a>
          <span className="dot" />
          <a href="#">Disclaimers</a>
          <span className="dot" />
          <a href="#">Gamble Responsibly</a>
        </div>
      </div>
    </footer>
  );
}
