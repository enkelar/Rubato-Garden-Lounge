import './Rubato.css';
import './Footer.css';
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const PHONE_DISPLAY = "+383 43 508 502";
const PHONE_TEL = "+38343508502";
const ADDRESS = "18 Hyzri Talla, Prishtinë";
const MAPS_URL = "https://maps.google.com/?q=Rubato+Garden+Lounge+Prishtina";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="rg-footer">
      <div className="rg-footer-brand">Rubato Garden Lounge</div>
      <p className="rg-footer-text">{t("footer.tagline")}</p>

      <div className="rg-footer-contact">
        <a href={`tel:${PHONE_TEL}`} className="rg-footer-contact-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {PHONE_DISPLAY}
        </a>
        <a href={MAPS_URL} target="_blank" rel="noreferrer" className="rg-footer-contact-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {ADDRESS}
        </a>
      </div>

      <div className="rg-socials">
        <a className="rg-social" href="https://instagram.com/rubatogardenlounge" target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </a>
        <a className="rg-social" href="https://facebook.com/rubatogardenlounge" target="_blank" rel="noreferrer" aria-label="Facebook">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 22v-8h2.6l.4-3H13V9c0-.9.2-1.5 1.5-1.5H16V5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V11H7.5v3H10v8h3z" />
          </svg>
        </a>
      </div>

      <div className="rg-footer-divider" />

      <div className="rg-footer-bottom">
        <LanguageToggle />
        <a href="/auth" className="rg-footer-admin">
          {t("footer.adminLogin")}
        </a>
      </div>
    </footer>
  );
}

export default Footer;