import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [retryDisabled, setRetryDisabled] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setInfoMessage("");
    setLoading(true);
    if (password !== confirm) {
      setAuthError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await supabase.auth.signUp({ email, password });
      console.log('signUp response', res);
      const { error } = res;
      if (error) {
        const msg = error.message || String(error);
        setAuthError(msg);
        // handle rate limit error by disabling retry for 60s
        if (/rate limit/i.test(msg) || /too many requests/i.test(msg)) {
          setRetryDisabled(true);
          setInfoMessage('Too many signup attempts. Please wait 60 seconds before retrying.');
          setTimeout(() => {
            setRetryDisabled(false);
            setInfoMessage('');
          }, 60000);
        }
      } else {
        // Successful signup — always redirect to login and inform user
        const msg = 'Registration successful — please check your email to confirm your account (if required) and then log in.';
        setInfoMessage(msg);
        navigate('/login', { state: { message: msg } });
      }
    } catch (err) {
      console.error(err);
      setAuthError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreate = async () => {
    setAdminError("");
    setInfoMessage("");
    if (!email || !password) {
      setAdminError('Email and password are required');
      return;
    }
    setAdminLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/admin-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log('admin-create response', res.status, data);
      if (!res.ok) {
        setAdminError(data?.error || JSON.stringify(data));
      } else {
        // created and confirmed server-side
        navigate('/journal');
      }
    } catch (err) {
      console.error(err);
      setAdminError(String(err));
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Register</h1>
        <form onSubmit={handleRegister}>
          <div className="auth-input">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-input">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Toggle password visibility">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="auth-input">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button className="auth-button" type="submit" disabled={loading || retryDisabled}>
            {loading ? 'Creating…' : retryDisabled ? 'Wait…' : 'Register'}
          </button>
          {authError && <p style={{ color: "red", marginTop: 12 }}>{authError}</p>}
          {infoMessage && <p style={{ color: "green", marginTop: 12 }}>{infoMessage}</p>}

          {/* Option: create confirmed user via backend admin endpoint when signup is blocked */}
          {((/rate limit|too many|confirm|verify|unverified|email not verified/i).test(authError) || /check your email/i.test(infoMessage) || retryDisabled) && (
            <div style={{ marginTop: 12 }}>
              <button className="auth-button" type="button" onClick={handleAdminCreate} disabled={adminLoading} style={{ background: '#333' }}>
                {adminLoading ? 'Creating account…' : 'Create account now (bypass confirmation)'}
              </button>
              {adminError && <p style={{ color: 'red', marginTop: 8 }}>{adminError}</p>}
            </div>
          )}

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
