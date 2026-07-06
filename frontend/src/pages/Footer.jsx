import './Rubato.css';
import './Footer.css';

export function Footer() {
  return (
    <footer className="rg-footer">
      <div className="rg-socials">
        <a
          className="rg-social"
          href="https://instagram.com/rubatogardenlounge"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </a>
        <a
          className="rg-social"
          href="https://facebook.com/rubatogardenlounge"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 22v-8h2.6l.4-3H13V9c0-.9.2-1.5 1.5-1.5H16V5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V11H7.5v3H10v8h3z" />
          </svg>
        </a>
      </div>
      <p className="rg-footer-text">Rubato Garden Lounge · Crafted with care</p>
      <a href="/auth" className="rg-footer-admin">
        Admin LogIn
      </a>
    </footer>
  );
}

export default Footer;