import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const location = useLocation();
  const { loginWithRedirect, error: auth0Error } = useAuth0();

  // show message passed from registration (if any)
  useState(() => {
    // @ts-ignore
    const msg = location?.state?.message;
    if (msg) setInfoMessage(msg);
    return;
  });

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      console.log('signIn response', res);
      const { error } = res;
      if (error) {
        setAuthError(error.message);
      } else {
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

  const handleForgot = async () => {
    setAuthError("");
    setInfoMessage("");
    if (!email) {
      setAuthError('Enter your email address to reset password');
      return;
    }
    setLoading(true);
    try {
      const res = await supabase.auth.resetPasswordForEmail(email);
      console.log('resetPassword response', res);
      // res may include error
      // @ts-ignore
      if (res?.error) {
        // @ts-ignore
        setAuthError(res.error.message || String(res.error));
      } else {
        setInfoMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      console.error(err);
      setAuthError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Requirement 2: Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
        },
      });
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setAuthError('Google login failed. Please try again.');
    }
  };

  // Requirement 2: Display Auth0 errors
  if (auth0Error) {
    setAuthError(auth0Error.message);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <div className="auth-input">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="auth-options">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <button type="button" onClick={handleForgot} style={{ background: 'none', border: 'none', color: '#ff8c00', cursor: 'pointer' }}>
              Forget Password
            </button>
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Log In'}
          </button>

          {/* Requirement 2: Google OAuth button */}
          <button
            className="auth-button"
            type="button"
            onClick={handleGoogleLogin}
            style={{
              marginTop: '12px',
              background: '#4285F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {authError && <p style={{ color: "red", marginTop: 12 }}>{authError}</p>}
          {infoMessage && <p style={{ color: "green", marginTop: 12 }}>{infoMessage}</p>}

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
