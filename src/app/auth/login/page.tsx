"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Mail,
  ArrowRight,
  Sparkles,
  Pencil,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP mode toggle
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoCode, setDemoCode] = useState("");

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Invalid campus credentials");
      }
    } catch {
      setErrorMsg("Network error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setErrorMsg("Please enter your institutional email");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        if (data.demoOtp) setDemoCode(data.demoOtp);
      } else {
        setErrorMsg(data.error || "Failed to send OTP");
      }
    } catch {
      setErrorMsg("Error dispatching OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, otp: otpCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Invalid OTP code");
      }
    } catch {
      setErrorMsg("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill demo accounts
  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("campus123");
    setErrorMsg("");
  };

  return (
    <div className="container" style={{ maxWidth: "480px", padding: "2rem 1rem" }}>
      <div className="sketch-card" style={{ padding: "2.5rem 2rem", background: "#ffffff" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "var(--wobble-card)",
              border: "2px solid var(--graphite-dark)",
              background: "var(--sketch-highlight-yellow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
            }}
          >
            <ShoppingBag size={28} strokeWidth={2.2} color="var(--graphite-dark)" />
          </div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "0.35rem" }}>Student Sign In</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", fontFamily: "var(--font-sketch-accent)" }}>
            Restricted to verified institutional college email (.edu / .ac.in)
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Strip */}
        <div
          style={{
            background: "var(--paper-bg)",
            border: "2px dashed var(--graphite-dark)",
            borderRadius: "var(--wobble-card)",
            padding: "0.9rem",
            marginBottom: "1.75rem",
            boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
          }}
        >
          <div style={{ fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-sketch-display)", color: "var(--graphite-dark)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Pencil size={15} /> Quick Demo Logins (Click to autofill):
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            <button
              type="button"
              onClick={() => quickFill("arjun.sharma@techuni.ac.in")}
              className="badge badge-campus"
              style={{ cursor: "pointer" }}
            >
              Arjun (Seller)
            </button>
            <button
              type="button"
              onClick={() => quickFill("priya.patel@techuni.ac.in")}
              className="badge badge-campus"
              style={{ cursor: "pointer" }}
            >
              Priya (Buyer)
            </button>
            <button
              type="button"
              onClick={() => quickFill("rohan.verma@techuni.ac.in")}
              className="badge badge-campus"
              style={{ cursor: "pointer" }}
            >
              Rohan (Transport)
            </button>
            <button
              type="button"
              onClick={() => quickFill("admin@techuni.ac.in")}
              className="badge badge-verified"
              style={{ cursor: "pointer" }}
            >
              Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "var(--sketch-highlight-rose)",
              border: "1.5px solid var(--graphite-dark)",
              borderRadius: "var(--wobble-card)",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
              color: "#991b1b",
              fontSize: "0.88rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isOtpMode ? (
          /* Password Form */
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <input
                type="email"
                required
                placeholder="student@techuni.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
              <span className="form-helper">Must end in @*.ac.in, @*.edu, or @techuni.ac.in</span>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem", fontSize: "1.15rem" }}
            >
              {loading ? "Signing in..." : "Sign In to Buy & Sell"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setIsOtpMode(true)}
                style={{ background: "none", border: "none", color: "var(--graphite-dark)", fontFamily: "var(--font-sketch-display)", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", textDecoration: "underline" }}
              >
                Or sign in using 6-Digit Email OTP →
              </button>
            </div>
          </form>
        ) : (
          /* OTP Form */
          <div>
            {!otpSent ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Campus Email for OTP</label>
                  <input
                    type="email"
                    required
                    placeholder="student@techuni.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.8rem", fontSize: "1.1rem" }}
                >
                  {loading ? "Sending OTP..." : "Send 6-Digit OTP Code"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="form-control"
                    style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "0.2em", fontWeight: 700, fontFamily: "var(--font-sketch-display)" }}
                  />
                  {demoCode && (
                    <span className="form-helper" style={{ color: "#15803d", fontWeight: 700 }}>
                      Demo Code received: <strong>{demoCode}</strong>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.8rem", fontSize: "1.15rem" }}
                >
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>
              </form>
            )}

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => {
                  setIsOtpMode(false);
                  setOtpSent(false);
                }}
                style={{ background: "none", border: "none", color: "var(--ink-secondary)", fontSize: "0.9rem", cursor: "pointer", fontFamily: "var(--font-sketch-accent)" }}
              >
                ← Back to Password Login
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem", borderTop: "2px dashed var(--graphite-subtle)", paddingTop: "1.25rem", fontSize: "0.95rem", fontFamily: "var(--font-sketch-accent)" }}>
          <span style={{ color: "var(--ink-secondary)" }}>Don&apos;t have an account yet? </span>
          <Link href="/auth/signup" style={{ color: "var(--graphite-dark)", fontWeight: 700, textDecoration: "underline" }}>
            Register as a Student
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
