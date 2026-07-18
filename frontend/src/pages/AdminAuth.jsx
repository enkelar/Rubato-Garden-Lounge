import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import "./Rubato.css";
import "./adminAuth.css";

export function AdminAuth() {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

 return (
  <div className="rg-app rg-auth-page">
    <div className="rg-auth-lang">
      <LanguageToggle />
    </div>
    <main className="rg-auth-wrap">
      <div className="rg-auth-head">
        <div className="rg-eyebrow">{t("auth.staffArea")}</div>
        <h1 className="rg-auth-title">{t("auth.signIn")}</h1>
        <p className="rg-auth-subtitle">
          {t("auth.subtitle")}
        </p>
      </div>

      <form className="rg-auth-card" onSubmit={handleSubmit}>
        <label className="rg-field">
          <span className="rg-field-label">{t("auth.email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rg-input"
            autoComplete="username"
          />
        </label>

        <label className="rg-field">
          <span className="rg-field-label">{t("auth.password")}</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rg-input"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="rg-auth-error">{error}</p>}

<button type="submit" className="rg-btn rg-btn-primary rg-auth-submit" disabled={busy}>
  {busy ? t("auth.signingIn") : t("auth.signIn")}
</button>

<button type="button" className="rg-btn rg-btn-ghost rg-auth-back" onClick={() => navigate("/")}>
  {t("auth.goBack")}
</button>
      </form>
    </main>
  </div>
);
}

export default AdminAuth;