"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Flame,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

interface WantedItem {
  id: string;
  title: string;
  description: string;
  category: string;
  targetBudget?: number | null;
  urgency: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    hostelBlock?: string;
  };
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function WantedBoardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<WantedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // New Request Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newBudget, setNewBudget] = useState("");
  const [newUrgency, setNewUrgency] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wanted");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchCurrentUser();
  }, [fetchRequests, fetchCurrentUser]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/auth/login?redirect=/wanted");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/wanted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          targetBudget: newBudget ? parseFloat(newBudget) : null,
          urgency: newUrgency,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewBudget("");
        fetchRequests();
      } else {
        setErrorMsg(data.error || "Failed to submit request");
      }
    } catch {
      setErrorMsg("Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      {/* Header bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        marginBottom: "2.5rem",
        paddingBottom: "1.5rem",
        borderBottom: "2px dashed var(--graphite-subtle)",
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span className="badge badge-campus">
              📢 Student Request Board
            </span>
          </div>
          <h1 style={{ fontSize: "2.6rem", letterSpacing: "-0.01em", color: "var(--graphite-dark)" }}>Campus Wanted Board</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "1rem", maxWidth: "600px", marginTop: "0.25rem" }}>
            Can&apos;t find what you need on the marketplace? Post a request here so classmates holding spare items can reach out to you directly.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              router.push("/auth/login?redirect=/wanted");
            } else {
              setModalOpen(true);
            }
          }}
          className="btn btn-primary"
          style={{ padding: "0.65rem 1.4rem", fontSize: "1.05rem" }}
        >
          <PlusCircle size={18} />
          <span>Post a Wanted Request</span>
        </button>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.25rem" }}>
          Reading student requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="sketch-card" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "550px", margin: "2rem auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>No Open Requests</h3>
          <p style={{ color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
            Be the first student to post an item request on the campus board.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            + Post Request
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.75rem" }}>
          {requests.map((item) => (
            <div
              key={item.id}
              className="sketch-card"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                background: item.urgency === "URGENT" ? "var(--sketch-highlight-rose)" : "var(--paper-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span className="badge badge-condition">{item.category}</span>
                {item.urgency === "URGENT" ? (
                  <span className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>
                    <Flame size={12} /> URGENT
                  </span>
                ) : (
                  <span className="badge badge-campus">NORMAL</span>
                )}
              </div>

              <h3 style={{ fontSize: "1.3rem", marginBottom: "0.6rem", lineHeight: 1.3, color: "var(--graphite-dark)" }}>
                {item.title}
              </h3>

              <p style={{ fontSize: "0.92rem", color: "var(--ink-secondary)", marginBottom: "1.25rem", flex: 1 }}>
                {item.description}
              </p>

              {/* Target Budget */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginBottom: "1rem", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.05rem" }}>Target Budget:</span>
                <span style={{ fontWeight: 700, color: "var(--graphite-dark)", fontSize: "1.25rem", fontFamily: "var(--font-sketch-display)" }}>
                  {item.targetBudget ? `${CURRENCY_SYMBOL}${item.targetBudget}` : "Flexible / Open"}
                </span>
              </div>

              {/* Poster info footer */}
              <div style={{
                borderTop: "1.5px dashed var(--graphite-subtle)",
                paddingTop: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "1.5px solid var(--graphite-dark)",
                    background: "var(--sketch-highlight-yellow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sketch-display)",
                    fontWeight: 700,
                  }}
                  >
                    {item.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-sketch-display)" }}>{item.user?.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#b45309", fontFamily: "var(--font-sketch-accent)" }}>{item.user?.hostelBlock}</div>
                  </div>
                </div>

                <Link
                  href={`/sell?category=${encodeURIComponent(item.category)}&title=${encodeURIComponent(item.title)}`}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "0.3rem 0.75rem" }}
                >
                  I Have This
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Request Modal - Sketch Card */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(3px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
        }}>
          <div className="sketch-card" style={{ width: "100%", maxWidth: "520px", padding: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>Post a Wanted Item Request</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-secondary)", marginBottom: "1.25rem" }}>
              Let campus peers know what you are looking to purchase or borrow.
            </p>

            {errorMsg && (
              <div style={{ padding: "0.75rem", background: "var(--sketch-highlight-rose)", border: "1.5px solid var(--graphite-dark)", color: "#991b1b", borderRadius: "var(--wobble-card)", marginBottom: "1rem", fontSize: "0.88rem" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label className="form-label">Item Needed *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Casio FX-991EX Scientific Calculator or Bed Laptop Table"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="form-control"
                  >
                    <option value="Textbooks">Textbooks</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Dorm Essentials">Dorm Essentials</option>
                    <option value="Transport">Transport</option>
                    <option value="Fashion & Sports">Fashion & Sports</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value)}
                    className="form-control"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="URGENT">Urgent (Needed this week)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Budget ({CURRENCY_SYMBOL} INR, optional)</label>
                <input
                  type="number"
                  placeholder="e.g., 500 (leave empty if flexible)"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Details / Requirements *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain course requirements, preferred edition, hostel delivery or pickup availability..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? "Posting..." : "Post to Wanted Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
