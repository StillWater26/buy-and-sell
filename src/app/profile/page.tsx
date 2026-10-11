"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Star,
  MapPin,
  Package,
  Heart,
  GraduationCap,
  Pencil,
  Trash2,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  department?: string;
  graduationYear?: number;
  hostelBlock?: string;
  avatarUrl?: string;
}

interface ListingItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  status: string;
  meetupLocation: string;
  images?: { url: string }[];
  sellerId?: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  tags?: string;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    department?: string;
    hostelBlock?: string;
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "saved" | "reviews">("listings");
  const [userListings, setUserListings] = useState<ListingItem[]>([]);
  const [savedListings, setSavedListings] = useState<ListingItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) {
        router.push("/auth/login?redirect=/profile");
        return;
      }
      setUser(data.user);

      // 1. Fetch user's listings
      const listRes = await fetch(`/api/listings?status=ALL`);
      const listData = await listRes.json();
      const myItems = (listData.listings || []).filter((l: ListingItem) => l.sellerId === data.user.id);
      setUserListings(myItems);

      // 2. Fetch saved wishlist items
      const savedRes = await fetch(`/api/listings/saved`);
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedListings(savedData.listings || []);
      }

      // 3. Fetch user reviews directly
      const reviewsRes = await fetch(`/api/reviews?targetId=${data.user.id}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch {
      router.push("/auth/login?redirect=/profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUnsave = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/listings/${listingId}/save`, { method: "POST" });
      if (res.ok) {
        setSavedListings((prev) => prev.filter((item) => item.id !== listingId));
      }
    } catch {
      alert("Failed to remove saved item");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.2rem" }}>
          Opening student notebook...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "980px" }}>
      {/* Profile Header Card */}
      <div
        className="sketch-card"
        style={{
          padding: "2.5rem 2rem",
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "2px solid var(--graphite-dark)",
              background: "var(--sketch-highlight-yellow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              fontWeight: 700,
              fontFamily: "var(--font-sketch-display)",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
              overflow: "hidden",
            }}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1 style={{ fontSize: "2rem", color: "var(--graphite-dark)" }}>{user?.name}</h1>
              <span className="badge badge-verified">
                <ShieldCheck size={14} /> Verified Student ID
              </span>
            </div>

            <div style={{ fontSize: "0.95rem", color: "var(--ink-secondary)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <GraduationCap size={16} />
              <span>{user?.department || "Student"} • Class of {user?.graduationYear || 2026}</span>
            </div>

            <div style={{ fontSize: "0.88rem", fontFamily: "var(--font-sketch-accent)", color: "#b45309", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={15} />
              <span>Hostel: {user?.hostelBlock || "Campus Residence"}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/sell" className="btn btn-primary">
            <Pencil size={16} />
            <span>+ Post New Item</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "2px dashed var(--graphite-subtle)", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("listings")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "listings" ? "var(--graphite-dark)" : "var(--ink-muted)",
            borderBottom: activeTab === "listings" ? "3px solid var(--graphite-dark)" : "3px solid transparent",
            padding: "0.75rem 1rem",
            fontFamily: "var(--font-sketch-display)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Package size={18} />
          <span>My Listings ({userListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "saved" ? "var(--graphite-dark)" : "var(--ink-muted)",
            borderBottom: activeTab === "saved" ? "3px solid var(--graphite-dark)" : "3px solid transparent",
            padding: "0.75rem 1rem",
            fontFamily: "var(--font-sketch-display)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Heart size={18} fill={activeTab === "saved" ? "currentColor" : "none"} />
          <span>Saved Wishlist ({savedListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "reviews" ? "var(--graphite-dark)" : "var(--ink-muted)",
            borderBottom: activeTab === "reviews" ? "3px solid var(--graphite-dark)" : "3px solid transparent",
            padding: "0.75rem 1rem",
            fontFamily: "var(--font-sketch-display)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Star size={18} />
          <span>Peer Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* Tab Content: My Listings */}
      {activeTab === "listings" && (
        <div>
          {userListings.length === 0 ? (
            <div className="sketch-card" style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--ink-secondary)", marginBottom: "1rem" }}>
                You have not posted any items for sale yet.
              </p>
              <Link href="/sell" className="btn btn-primary">
                + Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="listings-grid">
              {userListings.map((item) => (
                <Link href={`/listing/${item.id}`} key={item.id} className="listing-card">
                  <div className="listing-image-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"}
                      alt=""
                      className="listing-image"
                    />
                    <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                      <span className="badge badge-campus">{CURRENCY_SYMBOL}{item.price}</span>
                    </div>
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <span className={`badge ${item.status === "ACTIVE" ? "badge-verified" : item.status === "RESERVED" ? "badge-reserved" : "badge-sold"}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="listing-content">
                    <span className="badge badge-condition" style={{ width: "fit-content", marginBottom: "0.3rem" }}>
                      {item.category}
                    </span>
                    <h3 className="listing-title">{item.title}</h3>
                    <div style={{ marginTop: "auto", fontSize: "0.85rem", color: "var(--ink-secondary)", fontFamily: "var(--font-sketch-accent)" }}>
                      Spot: {item.meetupLocation}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Saved Wishlist */}
      {activeTab === "saved" && (
        <div>
          {savedListings.length === 0 ? (
            <div className="sketch-card" style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔖</div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>Your wishlist is empty</h3>
              <p style={{ color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
                Tap the &quot;Save&quot; button on any listing to bookmark items you want to keep an eye on.
              </p>
              <Link href="/" className="btn btn-secondary">
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="listings-grid">
              {savedListings.map((item) => (
                <div key={item.id} style={{ position: "relative" }}>
                  <Link href={`/listing/${item.id}`} className="listing-card">
                    <div className="listing-image-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"}
                        alt=""
                        className="listing-image"
                      />
                      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                        <span className="badge badge-campus">{CURRENCY_SYMBOL}{item.price}</span>
                      </div>
                      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <span className={`badge ${item.status === "ACTIVE" ? "badge-verified" : item.status === "RESERVED" ? "badge-reserved" : "badge-sold"}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="listing-content">
                      <span className="badge badge-condition" style={{ width: "fit-content", marginBottom: "0.3rem" }}>
                        {item.category}
                      </span>
                      <h3 className="listing-title">{item.title}</h3>
                      <div style={{ marginTop: "auto", fontSize: "0.85rem", color: "var(--ink-secondary)", fontFamily: "var(--font-sketch-accent)" }}>
                        Spot: {item.meetupLocation}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleUnsave(item.id, e)}
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      right: "16px",
                      background: "#ffffff",
                      border: "1.5px solid var(--graphite-dark)",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "var(--shadow-sketch-sm)",
                      zIndex: 5,
                    }}
                    title="Remove from saved"
                  >
                    <Trash2 size={15} color="#e11d48" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Peer Reviews */}
      {activeTab === "reviews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="sketch-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Campus Trust Badges</h3>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge badge-verified" style={{ padding: "0.4rem 0.8rem" }}>
                ✓ Official College Email Verified
              </span>
              <span className="badge badge-campus" style={{ padding: "0.4rem 0.8rem" }}>
                ✓ Hostel Resident Confirmed
              </span>
              <span className="badge badge-condition" style={{ padding: "0.4rem 0.8rem" }}>
                ⭐ Campus Meetup Participant
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: "1.35rem", marginTop: "1rem" }}>Reviews Received ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <div className="sketch-card" style={{ padding: "2.5rem", textAlign: "center" }}>
              <p style={{ color: "var(--ink-secondary)" }}>
                No peer reviews yet. Once you complete item handovers on campus, buyers and sellers will leave feedback here!
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="sketch-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex", color: "var(--graphite-dark)" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < rev.rating ? "var(--graphite-dark)" : "none"}
                          stroke="var(--graphite-dark)"
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "1.05rem", fontFamily: "var(--font-sketch-display)" }}>
                      {rev.reviewer?.name} ({rev.reviewer?.hostelBlock || "Campus"})
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)" }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rev.comment && (
                  <p style={{ fontSize: "0.92rem", color: "var(--ink-secondary)", fontStyle: "italic" }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
                {rev.tags && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {rev.tags.split(",").map((t, idx) => (
                      <span key={idx} className="badge badge-campus" style={{ fontSize: "0.78rem" }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
