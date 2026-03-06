import React from "react";
import "../css/AuthScreen.css";

export default function AuthScreen({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  handleAuth,
}) {
  return (
    <div className="card auth-container">
      {/* Tab Navigation */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${authMode === "login" ? "active" : ""}`}
          onClick={() => setAuthMode("login")}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
          onClick={() => setAuthMode("signup")}
        >
          Create Account
        </button>
      </div>

      {/* Authentication Form */}
      <form onSubmit={handleAuth} className="auth-form">
        {authMode === "signup" && (
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              value={authForm.name || ""}
              onChange={(e) =>
                setAuthForm({ ...authForm, name: e.target.value })
              }
              className="form-input"
              placeholder="John Doe"
            />
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            required
            value={authForm.email || ""}
            onChange={(e) =>
              setAuthForm({ ...authForm, email: e.target.value })
            }
            className="form-input"
            placeholder="john@example.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          {/* UPDATED: Now captures the password and enforces the 6-character minimum */}
          <input
            type="password"
            required
            minLength="6"
            value={authForm.password || ""}
            onChange={(e) =>
              setAuthForm({ ...authForm, password: e.target.value })
            }
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn-primary auth-submit-btn">
          {authMode === "login" ? "Sign In to Bid Versus" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
