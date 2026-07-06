import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Rubato.css";
import "./adminAuth.css";

export function AdminAuth() {
  const { login, isAuthenticated } = useAuth();
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
    <main className="rg-auth-wrap">
      <div className="rg-auth-head">
        <div className="rg-eyebrow">Staff Area</div>
        <h1 className="rg-auth-title">Sign in</h1>
        <p className="rg-auth-subtitle">
          Admin access only — accounts are provisioned by the team.
        </p>
      </div>

      <form className="rg-auth-card" onSubmit={handleSubmit}>
        <label className="rg-field">
          <span className="rg-field-label">Email</span>
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
          <span className="rg-field-label">Password</span>
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

        <button
  type="submit"
  className="rg-auth-btn rg-auth-btn-primary rg-auth-submit"
  disabled={busy}
>
  {busy ? "Signing in…" : "Sign in"}
</button>

<button
  type="button"
  className="rg-auth-btn rg-auth-btn-ghost rg-auth-back"
  onClick={() => navigate("/")}
>
  Go back
</button>
      </form>
    </main>
  </div>
);
}

export default AdminAuth;