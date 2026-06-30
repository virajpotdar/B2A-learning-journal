import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { setAuthUser } from "../utils/auth";
import { useAuth0 } from "@auth0/auth0-react";

function Login() {
  const { loginWithPopup } = useAuth0();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const location = useLocation();

  // show message passed from registration (if any)
  useEffect(() => {
    const msg = location?.state?.message;
    if (msg) setInfoMessage(msg);
  }, [location]);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.error || "Login failed");
      } else {
        setAuthUser(data.user);
        navigate('/journal');
      }
    } catch (err) {
      console.error(err);
      setAuthError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => setShowPassword((s) => !s);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <div className="auth-input">
            <label>Email or Username</label>
            <input
              type="text"
              placeholder="Enter your email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="auth-input" style={{ position: 'relative' }}>
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={handleTogglePassword} style={{ position: 'absolute', right: 8, top: 36, background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Toggle password visibility">
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Log In'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            <span style={{ padding: '0 1rem', color: '#666', fontSize: '0.9rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          </div>

          <button
            type="button"
            onClick={() => loginWithPopup({ authorizationParams: { connection: 'google-oauth2' } })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              color: '#333',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {authError && <p style={{ color: "red", marginTop: 12 }}>{authError}</p>}
          {infoMessage && <p style={{ color: "green", marginTop: 12 }}>{infoMessage}</p>}

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/forgot-password" style={{ color: '#666', fontSize: '0.9rem' }}>Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
