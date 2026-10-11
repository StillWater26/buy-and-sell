"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  MapPin,
  CheckCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [hostelBlock, setHostelBlock] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          graduationYear,
          hostelBlock: hostelBlock.trim() || "Campus Hostel",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to create account");
      }
    } catch {
      setErrorMsg("Network error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "560px", padding: "2rem 1rem" }}>
      <div className="sketch-card" style={{ padding: "2.5rem 2rem", background: "#ffffff" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "var(--wobble-card)",
              border: "2px solid var(--graphite-dark)",
              background: "var(--sketch-highlight-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
            }}
          >
            <ShoppingBag size={28} strokeWidth={2.2} color="var(--graphite-dark)" />
          </div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "0.35rem" }}>Create Student Account</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", fontFamily: "var(--font-sketch-accent)" }}>
            Join your verified campus peer-to-peer network
          </p>
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

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Krishnan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Institutional Email */}
          <div className="form-group">
            <label className="form-label">College / University Email *</label>
            <input
              type="email"
              required
              placeholder="maya.k@techuni.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
            <span className="form-helper" style={{ color: "var(--graphite-dark)", fontFamily: "var(--font-sketch-accent)", fontWeight: 700 }}>
              🔒 Must be an institutional domain (.ac.in, .edu, or @techuni.ac.in)
            </span>
          </div>

          {/* Department & Batch Year */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Department / Major</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-control"
              >
                <option value="Computer Science & Engineering">Computer Science</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Biotechnology & Sciences">Biotechnology & Sciences</option>
                <option value="Management & Commerce">Management & Commerce</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="form-control"
              >
                <option value="2025">Class of 2025</option>
                <option value="2026">Class of 2026</option>
                <option value="2027">Class of 2027</option>
                <option value="2028">Class of 2028</option>
              </select>
            </div>
          </div>

          {/* Hostel Block */}
          <div className="form-group">
            <label className="form-label">Hostel / Dorm Block (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Hall 4, B-Wing or Day Scholar"
              value={hostelBlock}
              onChange={(e) => setHostelBlock(e.target.value)}
              className="form-control"
            />
            <span className="form-helper">Used to help nearby hostel peers coordinate meetups</span>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "1rem", fontSize: "1.15rem" }}
          >
            {loading ? "Creating Verified Account..." : "Join Buy & Sell"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", borderTop: "2px dashed var(--graphite-subtle)", paddingTop: "1.25rem", fontSize: "0.95rem", fontFamily: "var(--font-sketch-accent)" }}>
          <span style={{ color: "var(--ink-secondary)" }}>Already have a campus account? </span>
          <Link href="/auth/login" style={{ color: "var(--graphite-dark)", fontWeight: 700, textDecoration: "underline" }}>
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
