import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setInfoMessage("");

    if (password !== confirm) {
      setAuthError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.error || "Registration failed");
      } else {
        setInfoMessage("Registration successful. Please log in.");
        navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
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
            <label>Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              <button type="button" onClick={() => setShowPassword((s) => !s)} style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Toggle password visibility">
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

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>

          {authError && <p style={{ color: "red", marginTop: 12 }}>{authError}</p>}
          {infoMessage && <p style={{ color: "green", marginTop: 12 }}>{infoMessage}</p>}

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
