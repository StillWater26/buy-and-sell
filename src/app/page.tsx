"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Laptop,
  Home,
  Bike,
  Shirt,
  Gift,
  Pencil,
} from "lucide-react";

const CATEGORIES = [
  { id: "All", name: "All Items", icon: Tag },
  { id: "Textbooks", name: "Textbooks", icon: BookOpen },
  { id: "Electronics", name: "Electronics", icon: Laptop },
  { id: "Dorm Essentials", name: "Dorm Essentials", icon: Home },
  { id: "Transport", name: "Cycles & Transport", icon: Bike },
  { id: "Fashion & Sports", name: "Fashion & Sports", icon: Shirt },
  { id: "Free / Giveaway", name: "Free / Giveaway", icon: Gift },
];

import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

function MarketplaceFeed() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [onlyGiveaways, setOnlyGiveaways] = useState<boolean>(false);

  // Sync initial query params from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);

    const isGiveaway = searchParams.get("isGiveaway");
    if (isGiveaway === "true") {
      setOnlyGiveaways(true);
      setSelectedCategory("Free / Giveaway");
    }
  }, [searchParams]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedCondition !== "All") params.append("condition", selectedCondition);
      if (sortBy) params.append("sort", sortBy);
      if (onlyGiveaways) params.append("isGiveaway", "true");

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCondition, sortBy, onlyGiveaways]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <div className="container">
      {/* Hero Showcase Section - Sketchbook Page */}
      <section
        style={{
          position: "relative",
          padding: "3rem 2.25rem",
          background: "var(--paper-card)",
          borderRadius: "var(--wobble-card)",
          border: "2px solid var(--graphite-dark)",
          boxShadow: "var(--shadow-sketch-md)",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ maxWidth: "780px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge badge-campus">
              🎓 TechUni Student Marketplace
            </span>
            <span className="badge badge-verified">
              <ShieldCheck size={14} /> Verified Student ID
            </span>
          </div>

          <h1 style={{ fontSize: "2.85rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.75rem", color: "var(--graphite-dark)" }}>
            Buy, Sell & Giveaway on Campus with{" "}
            <span style={{ textDecoration: "underline", textDecorationStyle: "wavy", textUnderlineOffset: "6px" }}>
              Zero Commission
            </span>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--ink-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
            Trade textbooks, calculators, dorm essentials, cycles and gadgets safely with fellow students. Meet up directly at campus safe spots like the Library Foyer or Student Activity Center.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <Link href="/sell" className="btn btn-primary" style={{ fontSize: "1.05rem", padding: "0.65rem 1.6rem" }}>
              <Pencil size={18} />
              <span>+ List an Item for Sale</span>
            </Link>
            <Link
              href="/wanted"
              className="btn btn-secondary"
              style={{ fontSize: "1.05rem", padding: "0.65rem 1.6rem" }}
            >
              <span>Check Wanted Requests</span>
            </Link>
          </div>
        </div>

        {/* Quick Trust Badges Strip */}
        <div style={{
          marginTop: "2.5rem",
          paddingTop: "1.5rem",
          borderTop: "2px dashed var(--graphite-subtle)",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          fontSize: "0.95rem",
          fontFamily: "var(--font-sketch-accent)",
          color: "var(--ink-secondary)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <CheckCircle2 size={16} strokeWidth={2.5} color="var(--graphite-dark)" />
            <span>Institutional Email Verified (.edu / .ac.in)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <MapPin size={16} strokeWidth={2.5} color="var(--graphite-dark)" />
            <span>Designated Safe Campus Meetup Spots</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Sparkles size={16} strokeWidth={2.5} color="var(--graphite-dark)" />
            <span>Senior-to-Junior Free Donations ({CURRENCY_SYMBOL}0)</span>
          </div>
        </div>
      </section>

      {/* Category Filter Chips Bar */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          scrollbarWidth: "none",
        }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id === "Free / Giveaway") {
                    setOnlyGiveaways(true);
                  } else {
                    setOnlyGiveaways(false);
                  }
                }}
                className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                style={{
                  borderRadius: "var(--wobble-pill)",
                  padding: "0.45rem 1.15rem",
                  fontSize: "0.95rem",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search & Filter Toolbar - Sketch Toolbar */}
      <section
        className="glass-panel"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Condition Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.95rem", fontFamily: "var(--font-sketch-display)", fontWeight: 700, color: "var(--graphite-dark)" }}>Condition:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="form-control"
              style={{ width: "auto", padding: "0.35rem 0.8rem", fontSize: "0.92rem", height: "38px" }}
            >
              <option value="All">All Conditions</option>
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          {/* Giveaway Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.95rem", fontFamily: "var(--font-sketch-display)", fontWeight: 700, color: "var(--graphite-dark)" }}>
            <input
              type="checkbox"
              checked={onlyGiveaways}
              onChange={(e) => {
                setOnlyGiveaways(e.target.checked);
                if (e.target.checked) setSelectedCategory("Free / Giveaway");
              }}
              style={{ cursor: "pointer", width: "17px", height: "17px", accentColor: "var(--graphite-dark)" }}
            />
            <span>Freebies Only ({CURRENCY_SYMBOL}0)</span>
          </label>
        </div>

        {/* Sort Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.95rem", fontFamily: "var(--font-sketch-display)", fontWeight: 700, color: "var(--graphite-dark)" }}>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ width: "auto", padding: "0.35rem 0.8rem", fontSize: "0.92rem", height: "38px" }}
          >
            <option value="recent">Recently Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="views">Most Popular</option>
          </select>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
        
        {/* Listings Grid */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.75rem" }}>
              {selectedCategory === "All" ? "Current Campus Listings" : selectedCategory}
              <span style={{ fontSize: "1.05rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)", fontWeight: 400, marginLeft: "0.6rem" }}>
                ({listings.length} items available)
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.25rem" }}>
              Sketching campus listings...
            </div>
          ) : listings.length === 0 ? (
            <div
              className="glass-panel"
              style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "2rem auto" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✏️</div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>No listings found</h3>
              <p style={{ color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
                No active items match your current filter criteria. Be the first student to post in this category!
              </p>
              <Link href="/sell" className="btn btn-primary">
                + Create a Listing
              </Link>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((item) => {
                const coverImage =
                  item.images && item.images.length > 0
                    ? item.images[0].url
                    : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

                return (
                  <Link href={`/listing/${item.id}`} key={item.id} className="listing-card">
                    <div className="listing-image-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt={item.title} className="listing-image" />
                      
                      {/* Price / Giveaway badge */}
                      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                        {item.isGiveaway ? (
                          <span className="badge badge-giveaway">
                            🎁 FREE ({CURRENCY_SYMBOL}0)
                          </span>
                        ) : (
                          <span style={{
                            background: "var(--paper-card)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "var(--wobble-pill)",
                            fontWeight: 700,
                            fontFamily: "var(--font-sketch-display)",
                            fontSize: "1.15rem",
                            border: "2px solid var(--graphite-dark)",
                            boxShadow: "2px 2px 0px var(--graphite-dark)",
                            color: "var(--graphite-dark)",
                          }}>
                            {CURRENCY_SYMBOL}{item.price}
                          </span>
                        )}
                      </div>

                      {/* Status indicator (Reserved / Sold) */}
                      {item.status === "RESERVED" && (
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                          <span className="badge badge-reserved">⏳ RESERVED</span>
                        </div>
                      )}
                      {item.status === "SOLD" && (
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                          <span className="badge badge-sold">✓ SOLD</span>
                        </div>
                      )}
                    </div>

                    <div className="listing-content">
                      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                        <span className="badge badge-condition">{item.category}</span>
                        <span className="badge badge-condition">{item.condition}</span>
                        {item.isNegotiable && !item.isGiveaway && (
                          <span className="badge badge-campus">
                            • Negotiable
                          </span>
                        )}
                      </div>

                      <h3 className="listing-title">{item.title}</h3>

                      <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1.5px dashed var(--graphite-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--graphite-dark)", fontWeight: 600 }}>
                            <MapPin size={13} strokeWidth={2.2} />
                            <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.meetupLocation}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "var(--font-sketch-accent)", fontSize: "0.9rem" }}>
                            <span>{item.seller?.hostelBlock?.split(",")[0] || "Campus"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Wanted Board Spotlight Banner - Sketch Note Box */}
        <section
          style={{
            background: "var(--paper-card)",
            border: "2px solid var(--graphite-dark)",
            borderRadius: "var(--wobble-card)",
            boxShadow: "var(--shadow-sketch-md)",
            padding: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span className="badge badge-campus">
                📢 Campus Request Board
              </span>
            </div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.35rem", color: "var(--graphite-dark)" }}>
              Have something a classmate needs right now?
            </h3>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem" }}>
              Students are looking for scientific calculators, course textbooks, and dorm furniture. Check the Wanted Board or post your own request.
            </p>
          </div>

          <Link href="/wanted" className="btn btn-secondary" style={{ padding: "0.65rem 1.4rem" }}>
            <span>Browse Wanted Board</span>
            <ArrowRight size={16} />
          </Link>
        </section>

      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading marketplace...</div>}>
      <MarketplaceFeed />
    </Suspense>
  );
}
