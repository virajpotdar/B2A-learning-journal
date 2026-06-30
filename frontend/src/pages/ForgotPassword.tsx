import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to send OTP");
      } else {
        setMessage("OTP sent to your email");
        setStep('otp');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Invalid OTP");
      } else {
        setMessage("OTP verified. Please enter your new password");
        setStep('reset');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to reset password");
      } else {
        setMessage("Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}</h1>

        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="auth-input">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>

            {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
            {message && <p style={{ color: "green", marginTop: 12 }}>{message}</p>}

            <div className="auth-footer">
              Remember your password? <Link to="/login">Login</Link>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Enter the OTP sent to <strong>{email}</strong>
            </p>

            <div className="auth-input">
              <label>OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                border: 'none',
                borderRadius: '8px',
                background: 'transparent',
                color: '#666',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Change email
            </button>

            {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
            {message && <p style={{ color: "green", marginTop: 12 }}>{message}</p>}
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="auth-input">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-input">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>

            {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
            {message && <p style={{ color: "green", marginTop: 12 }}>{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
