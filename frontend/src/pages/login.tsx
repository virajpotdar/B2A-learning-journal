import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const location = useLocation();

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
