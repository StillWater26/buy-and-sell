"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  User,
  LogOut,
  HelpCircle,
  ShieldCheck,
  Search,
  Sparkles,
  Pencil,
} from "lucide-react";

import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  department?: string;
  hostelBlock?: string;
  role: string;
  avatarUrl?: string;
  unreadCount?: number;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [pathname, fetchUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="glass-nav">
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "74px", gap: "1.5rem" }}>
        
        {/* Brand Logo & Campus Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--wobble-card)",
              border: "2px solid var(--graphite-dark)",
              background: "var(--paper-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--graphite-dark)",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
            }}>
              <ShoppingBag size={20} strokeWidth={2.2} />
            </div>
            <div>
              <span style={{ fontSize: "1.45rem", fontWeight: 700, fontFamily: "var(--font-sketch-display)", letterSpacing: "-0.01em", color: "var(--graphite-dark)" }}>
                Buy<span style={{ textDecoration: "underline", textDecorationStyle: "wavy" }}>&</span>Sell
              </span>
              <span style={{ display: "block", fontSize: "0.78rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "-4px" }}>
                TechUni Campus Notes
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: "420px", display: "flex", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--graphite-medium)" }} />
          <input
            type="text"
            placeholder="Search textbooks, cycles, calculators, dorm gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{
              paddingLeft: "2.6rem",
              borderRadius: "var(--wobble-pill)",
              fontSize: "0.95rem",
              background: "#ffffff",
              height: "42px",
            }}
          />
        </form>

        {/* Navigation Links & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/wanted"
            className={`btn btn-ghost ${pathname === "/wanted" ? "active" : ""}`}
            style={{ fontSize: "0.95rem", padding: "0.45rem 0.85rem" }}
          >
            <HelpCircle size={16} />
            <span style={{ display: "inline-block" }}>Wanted Board</span>
          </Link>

          <Link
            href="/?isGiveaway=true"
            className="btn btn-ghost"
            style={{ fontSize: "0.95rem", padding: "0.45rem 0.85rem", color: "#854d0e" }}
          >
            <Sparkles size={16} />
            <span>Freebies ({CURRENCY_SYMBOL}0)</span>
          </Link>

          {/* Sell Button */}
          <Link href="/sell" className="btn btn-primary" style={{ padding: "0.5rem 1.1rem" }}>
            <Pencil size={16} />
            <span>+ Sell Item</span>
          </Link>

          {/* Chat Inbox Button */}
          {user && (
            <Link
              href="/chat"
              className="btn btn-secondary"
              style={{ padding: "0.5rem 0.85rem", position: "relative" }}
              title="Campus Chats & Offers"
            >
              <MessageSquare size={18} />
              {(user.unreadCount || 0) > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "1.5px solid var(--graphite-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "1px 1px 0px var(--graphite-dark)",
                }}>
                  {user.unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile / Login Button */}
          {!loading && (
            <>
              {user ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      background: "var(--paper-card)",
                      border: "2px solid var(--graphite-dark)",
                      borderRadius: "var(--wobble-pill)",
                      boxShadow: "2px 2px 0px var(--graphite-dark)",
                      padding: "0.3rem 0.75rem 0.3rem 0.35rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      color: "var(--graphite-dark)",
                    }}
                  >
                    <div style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "1.5px solid var(--graphite-dark)",
                      background: "var(--sketch-highlight-yellow)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-sketch-display)",
                      fontWeight: 700,
                    }}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <span style={{ fontSize: "0.95rem", fontFamily: "var(--font-sketch-display)", fontWeight: 700, maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name.split(" ")[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="glass-panel"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: "230px",
                        padding: "0.6rem",
                        zIndex: 100,
                        background: "#ffffff",
                        boxShadow: "4px 4px 0px var(--graphite-dark)",
                      }}
                    >
                      <div style={{ padding: "0.5rem 0.75rem", borderBottom: "2px dashed var(--graphite-subtle)", marginBottom: "0.4rem" }}>
                        <div style={{ fontFamily: "var(--font-sketch-display)", fontWeight: 700, fontSize: "1.05rem" }}>{user.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.email}
                        </div>
                        {user.hostelBlock && (
                          <div style={{ fontSize: "0.78rem", fontFamily: "var(--font-sketch-accent)", color: "#b45309", marginTop: "2px" }}>
                            🏠 {user.hostelBlock}
                          </div>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="btn btn-ghost"
                        style={{ width: "100%", justifyContent: "flex-start", padding: "0.5rem 0.75rem", fontSize: "0.92rem" }}
                      >
                        <User size={16} />
                        My Profile & Listings
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="btn btn-ghost"
                          style={{ width: "100%", justifyContent: "flex-start", padding: "0.5rem 0.75rem", fontSize: "0.92rem" }}
                        >
                          <ShieldCheck size={16} />
                          Campus Moderation
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="btn btn-ghost"
                        style={{ width: "100%", justifyContent: "flex-start", padding: "0.5rem 0.75rem", fontSize: "0.92rem", color: "#dc2626" }}
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href="/auth/login" className="btn btn-secondary" style={{ fontSize: "0.92rem", padding: "0.45rem 0.95rem" }}>
                    Log In
                  </Link>
                  <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: "0.92rem", padding: "0.45rem 0.95rem" }}>
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </header>
  );
}
