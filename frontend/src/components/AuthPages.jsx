import React, { useState } from "react";
import { api } from "../api.js";

export function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("admin@staffsync.demo");
  const [password, setPassword] = useState("StaffSync123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { onLogin(await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <main className="login-shell">
    <div className="login-card">
      <div className="brand-mark">S</div>
      <p className="eyebrow">PEOPLE • PROCESSES • PROGRESS</p>
      <h1>Welcome to StaffSync</h1>
      <p className="muted">Sign in to your HR workspace.</p>
      <form onSubmit={submit} className="mt-4">
        <label className="form-label">Email address</label>
        <input className="form-control mb-3" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label className="form-label">Password</label>
        <input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn btn-primary w-100 py-2" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onSignup}
          >
            Sign up
          </button>
        </p>
      </form>
      <div className="demo-note"><strong>Demo administrator</strong><br />admin@staffsync.demo<br />StaffSync123!</div>
    </div>
  </main>;
}
export function Signup({ onLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("General");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, department })
      });
      onLogin(result);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="brand-mark">S</div>
        <p className="eyebrow">PEOPLE • PROCESSES • PROGRESS</p>
        <h1>Create your account</h1>
        <p className="muted">Join your StaffSync workspace.</p>

        <form onSubmit={submit} className="mt-4">
          <label className="form-label">Full name</label>
          <input
            className="form-control mb-3"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <label className="form-label">Email address</label>
          <input
            className="form-control mb-3"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="form-label">Department</label>
          <select
            className="form-select mb-3"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          >
            <option>General</option>
            <option>Engineering</option>
            <option>Human Resources</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>Operations</option>
          </select>

          <label className="form-label">Password (minimum 8 characters)</label>
          <input
            className="form-control mb-3"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label className="form-label">Confirm password</label>
          <input
            className="form-control mb-3"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button
            className="btn btn-primary w-100 py-2"
            disabled={busy}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onBack}
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}

