import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./AuthForm.css";

type AuthMode = "signIn" | "signUp";

export type AuthFormProps = {
  /** Called when the user has a session (sign-in ok, or sign-up with immediate session). */
  onAuthSuccess?: () => void;
};

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const resetFeedback = () => {
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }
    if (mode === "signUp" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        onAuthSuccess?.();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        if (data.user && !data.session) {
          setInfoMessage("Check your email to confirm your account, then sign in.");
        } else if (data.session) {
          onAuthSuccess?.();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-panel">
      <h1 className="auth-title">The Progress Pomodoro</h1>
      <p className="auth-subtitle">Sign in to track sessions, or create an account.</p>

      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signIn"}
          className={`auth-tab${mode === "signIn" ? " auth-tab--active" : ""}`}
          onClick={() => {
            setMode("signIn");
            setConfirmPassword("");
            resetFeedback();
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signUp"}
          className={`auth-tab${mode === "signUp" ? " auth-tab--active" : ""}`}
          onClick={() => {
            setMode("signUp");
            setConfirmPassword("");
            resetFeedback();
          }}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)}>
        {errorMessage ? (
          <p className="auth-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {infoMessage ? (
          <p className="auth-info" role="status">
            {infoMessage}
          </p>
        ) : null}

        <div className="auth-field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
            minLength={6}
          />
        </div>
        {mode === "signUp" ? (
          <div className="auth-field">
            <label htmlFor="auth-confirm-password">Confirm password</label>
            <input
              id="auth-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={submitting}
              required
              minLength={6}
            />
          </div>
        ) : null}

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
