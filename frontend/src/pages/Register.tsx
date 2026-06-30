import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Requirement 1 & 10: Validation
    if (!username) return setError("Username is required");
    if (password !== confirm) return setError("Passwords do not match");
    if (username.length < 3 || username.length > 30) return setError("Username must be 3-30 characters");
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return setError("Username can only contain alphanumeric, hyphens, and underscores");

    setLoading(true);

  const handleAdminCreate = async () => {
    setAdminError("");
    setInfoMessage("");
    if (!email || !password) {
      setAdminError("Email and password are required");
      return;
    }
    setAdminLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to login with success message
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
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
            <label>Username</label>
            <input type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="auth-input">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-input">
            <label>Password</label>
            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="auth-input">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}