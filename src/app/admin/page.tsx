"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  CheckCircle,
  AlertTriangle,
  User,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

export default function AdminModerationPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user || data.user.role !== "ADMIN") {
        router.push("/auth/login?redirect=/admin");
        return;
      }
      setCurrentUser(data.user);
      fetchReports();
    } catch {
      router.push("/auth/login?redirect=/admin");
    } finally {
      setLoading(false);
    }
  }, [router, fetchReports]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const handleResolve = async (reportId: string, deleteListing: boolean) => {
    if (deleteListing && !confirm("Are you sure you want to delete this listing from the campus marketplace?")) return;

    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status: "RESOLVED",
          deleteListing,
        }),
      });
      if (res.ok) {
        fetchReports();
      }
    } catch {
      alert("Failed to process action");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.2rem" }}>
          Verifying administrator credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "1000px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" className="btn btn-ghost" style={{ fontSize: "0.95rem", padding: "0.4rem 0.75rem" }}>
          <ArrowLeft size={16} />
          <span>← Back to Marketplace</span>
        </Link>
      </div>

      <div className="sketch-card" style={{ padding: "2rem", marginBottom: "2rem", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--wobble-card)",
                border: "2px solid var(--graphite-dark)",
                background: "var(--sketch-highlight-rose)",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 0px var(--graphite-dark)",
              }}
            >
              <ShieldAlert size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.85rem", color: "var(--graphite-dark)" }}>Campus Moderation Portal</h1>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", fontFamily: "var(--font-sketch-accent)" }}>
                Review flagged listings, reported scam attempts, and community guidelines violations.
              </p>
            </div>
          </div>

          <button onClick={fetchReports} className="btn btn-secondary" style={{ padding: "0.5rem 0.85rem" }}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <h2 style={{ fontSize: "1.45rem", marginBottom: "1rem", color: "var(--graphite-dark)" }}>Pending Incident Reports ({reports.length})</h2>

      {reports.length === 0 ? (
        <div className="sketch-card" style={{ padding: "3rem", textAlign: "center", background: "#ffffff" }}>
          <CheckCircle size={36} color="var(--graphite-dark)" style={{ margin: "0 auto 0.5rem" }} />
          <h3 style={{ fontSize: "1.25rem", color: "var(--graphite-dark)", marginBottom: "0.25rem" }}>No Pending Reports</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-secondary)" }}>All campus listings are currently in compliance with community standards.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {reports.map((r) => (
            <div key={r.id} className="sketch-card" style={{ padding: "1.5rem", background: "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <span className="badge" style={{ background: "var(--sketch-highlight-rose)", color: "#991b1b" }}>
                    {r.reason}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)", marginLeft: "0.6rem" }}>
                    Reported by {r.reporter?.name} ({r.reporter?.email})
                  </span>
                </div>

                <span className={`badge ${r.status === "PENDING" ? "badge-reserved" : "badge-verified"}`}>
                  {r.status}
                </span>
              </div>

              {r.listing ? (
                <div style={{ background: "var(--paper-bg)", padding: "0.9rem", borderRadius: "var(--wobble-card)", marginBottom: "1rem", border: "1.5px solid var(--graphite-dark)", boxShadow: "1.5px 1.5px 0px var(--graphite-dark)" }}>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-sketch-display)", fontSize: "1.05rem", color: "var(--graphite-dark)" }}>
                    Listing: {r.listing.title} ({CURRENCY_SYMBOL}{r.listing.price})
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", marginTop: "2px" }}>
                    Seller: {r.listing.seller?.name} ({r.listing.seller?.email}) • Status: {r.listing.status}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.88rem", color: "var(--ink-muted)", marginBottom: "1rem", fontStyle: "italic" }}>
                  (Target listing was previously removed)
                </div>
              )}

              {r.details && (
                <p style={{ fontSize: "0.92rem", color: "var(--ink-secondary)", marginBottom: "1rem", fontStyle: "italic" }}>
                  &ldquo;{r.details}&rdquo;
                </p>
              )}

              {r.status === "PENDING" && (
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleResolve(r.id, false)}
                    className="btn btn-secondary"
                    style={{ fontSize: "0.88rem", padding: "0.4rem 0.85rem" }}
                  >
                    Dismiss Report
                  </button>

                  {r.listing && (
                    <button
                      onClick={() => handleResolve(r.id, true)}
                      className="btn btn-danger"
                      style={{ fontSize: "0.88rem", padding: "0.4rem 0.85rem" }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Prohibited Listing</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
