"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  Heart,
  AlertTriangle,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

function ListingDetailView() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);

  // Modals & form state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Prohibited Item on Campus");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Status updating (for seller)
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const fetchListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}`);
      if (!res.ok) {
        setListing(null);
        return;
      }
      const data = await res.json();
      setListing(data.listing);
      setIsSaved(!!data.listing?.isSaved);
    } catch (err) {
      console.error(err);
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing();
    fetchCurrentUser();
  }, [fetchListing, fetchCurrentUser]);

  const handleToggleSave = async () => {
    if (!currentUser) {
      router.push(`/auth/login?redirect=/listing/${listingId}`);
      return;
    }
    setSavingToggle(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/save`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(data.saved);
      }
    } catch {
      alert("Failed to update saved item");
    } finally {
      setSavingToggle(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      router.push(`/auth/login?redirect=/listing/${listingId}`);
      return;
    }

    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (data.roomId) {
        router.push(`/chat?room=${data.roomId}`);
      } else {
        alert(data.error || "Unable to start conversation");
      }
    } catch {
      alert("Error starting chat");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchListing();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      alert("Failed to delete listing");
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
        }, 1800);
      }
    } catch {
      alert("Failed to file report");
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.2rem" }}>
          Sketching listing details...
        </p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>Listing Not Found</h2>
        <p style={{ color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
          This item may have been sold or removed by the student.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to Campus Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === listing.sellerId;
  const images = listing.images?.length > 0 ? listing.images : [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80" }];

  return (
    <div className="container" style={{ maxWidth: "1100px" }}>
      {/* Back button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" className="btn btn-ghost" style={{ fontSize: "0.95rem", padding: "0.4rem 0.75rem" }}>
          <ArrowLeft size={16} />
          <span>← Back to Marketplace</span>
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2.5rem" }}>
        
        {/* Left Column: Photos Gallery */}
        <div>
          <div
            style={{
              borderRadius: "var(--wobble-card)",
              overflow: "hidden",
              background: "#ffffff",
              border: "2px solid var(--graphite-dark)",
              boxShadow: "var(--shadow-sketch-md)",
              height: "420px",
              position: "relative",
            }}
          >
            <img
              src={images[activeImageIndex]?.url}
              alt={listing.title}
              style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f8f8f6" }}
            />

            {listing.status === "RESERVED" && (
              <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                <span className="badge badge-reserved" style={{ fontSize: "0.95rem", padding: "0.4rem 0.85rem" }}>
                  ⏳ RESERVED FOR CAMPUS MEETUP
                </span>
              </div>
            )}

            {listing.status === "SOLD" && (
              <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                <span className="badge badge-sold" style={{ fontSize: "0.95rem", padding: "0.4rem 0.85rem" }}>
                  ✓ ITEM SOLD
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", overflowX: "auto" }}>
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "var(--wobble-card)",
                    overflow: "hidden",
                    border: activeImageIndex === idx ? "2px solid var(--graphite-dark)" : "1.5px solid var(--graphite-subtle)",
                    boxShadow: activeImageIndex === idx ? "2px 2px 0px var(--graphite-dark)" : "none",
                    cursor: "pointer",
                    padding: 0,
                    background: "#ffffff",
                  }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          {/* Designated Campus Safe Zone Alert - Sketch Card */}
          <div
            className="sketch-card"
            style={{
              marginTop: "2rem",
              padding: "1.25rem",
              background: "var(--sketch-highlight-yellow)",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <MapPin size={22} strokeWidth={2.2} color="var(--graphite-dark)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "1.05rem", color: "var(--graphite-dark)", marginBottom: "0.2rem" }}>
                  Suggested Meetup Spot: {listing.meetupLocation}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                  Always meet in daytime or well-lit campus communal areas. Inspect the item thoroughly before paying with UPI or Cash.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Listing Details & Seller Actions */}
        <div>
          {/* Category & Status pills */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <span className="badge badge-campus">{listing.category}</span>
            <span className="badge badge-condition">{listing.condition}</span>
            {listing.isNegotiable && !listing.isGiveaway && (
              <span className="badge badge-verified">Price Negotiable</span>
            )}
          </div>

          <h1 style={{ fontSize: "2.35rem", lineHeight: 1.25, marginBottom: "0.75rem", color: "var(--graphite-dark)" }}>
            {listing.title}
          </h1>

          {/* Price display */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {listing.isGiveaway ? (
              <span className="badge badge-giveaway" style={{ fontSize: "1.35rem", padding: "0.4rem 1rem" }}>
                🎁 FREE GIVEAWAY ({CURRENCY_SYMBOL}0)
              </span>
            ) : (
              <div style={{ fontSize: "2.5rem", fontWeight: 700, fontFamily: "var(--font-sketch-display)", color: "var(--graphite-dark)" }}>
                {CURRENCY_SYMBOL}{listing.price}
              </div>
            )}
            <span style={{ fontSize: "0.9rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)" }}>
              • {listing.viewCount} campus views
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--graphite-dark)", marginBottom: "0.5rem" }}>
              About this item
            </h3>
            <p style={{ fontSize: "0.98rem", color: "var(--ink-primary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {listing.description}
            </p>
          </div>

          {/* Seller Card - Index Card Sketch */}
          <div
            className="sketch-card"
            style={{ padding: "1.25rem", marginBottom: "2rem", background: "var(--paper-card)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "2px solid var(--graphite-dark)",
                    background: "var(--sketch-highlight-yellow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    fontFamily: "var(--font-sketch-display)",
                    fontWeight: 700,
                    overflow: "hidden",
                    boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
                  }}
                >
                  {listing.seller?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.seller.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    listing.seller?.name?.charAt(0)
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.2rem", fontFamily: "var(--font-sketch-display)" }}>{listing.seller?.name}</span>
                    <span title="Verified Campus Student">
                      <ShieldCheck size={16} strokeWidth={2.2} color="var(--graphite-dark)" />
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                    {listing.seller?.department} • Class of {listing.seller?.graduationYear}
                  </div>
                  {listing.seller?.hostelBlock && (
                    <div style={{ fontSize: "0.82rem", fontFamily: "var(--font-sketch-accent)", color: "#b45309", marginTop: "2px" }}>
                      🏠 {listing.seller.hostelBlock}
                    </div>
                  )}
                </div>
              </div>

              {/* Rating pill */}
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--graphite-dark)", fontWeight: 700, fontFamily: "var(--font-sketch-display)", fontSize: "1.1rem" }}>
                  <Star size={16} fill="var(--graphite-dark)" stroke="var(--graphite-dark)" />
                  <span>{listing.seller?.averageRating}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)" }}>
                  {listing.seller?.totalReviews} reviews
                </div>
              </div>
            </div>

            {/* Seller reviews snippets */}
            {listing.seller?.reviewsReceived && listing.seller.reviewsReceived.length > 0 && (
              <div style={{ borderTop: "1.5px dashed var(--graphite-subtle)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Recent Student Review:
                </span>
                <p style={{ fontSize: "0.88rem", fontStyle: "italic", color: "var(--ink-secondary)", marginTop: "0.2rem" }}>
                  &ldquo;{listing.seller.reviewsReceived[0].comment}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div>
            {!isOwner ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={handleStartChat}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: "0.85rem", fontSize: "1.15rem" }}
                    disabled={listing.status === "SOLD"}
                  >
                    <MessageSquare size={20} strokeWidth={2.2} />
                    <span>{listing.status === "SOLD" ? "This Item Has Been Sold" : "Chat with Seller & Make Offer"}</span>
                  </button>

                  <button
                    onClick={handleToggleSave}
                    disabled={savingToggle}
                    className={`btn ${isSaved ? "btn-primary" : "btn-secondary"}`}
                    style={{
                      padding: "0.85rem 1.25rem",
                      fontSize: "1.05rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: isSaved ? "var(--sketch-highlight-rose)" : undefined,
                      borderColor: isSaved ? "#e11d48" : undefined,
                      color: isSaved ? "#be123c" : undefined,
                    }}
                    title={isSaved ? "Saved to your bookmarks" : "Save for later"}
                  >
                    <Heart size={20} fill={isSaved ? "#be123c" : "none"} color={isSaved ? "#be123c" : "currentColor"} />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    style={{ background: "none", border: "none", color: "var(--ink-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontFamily: "var(--font-sketch-accent)" }}
                  >
                    <AlertTriangle size={14} />
                    <span>Report this listing to campus moderators</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Seller's Own Controls */
              <div className="sketch-card" style={{ padding: "1.25rem" }}>
                <h4 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Manage Your Listing</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {listing.status === "ACTIVE" && (
                    <button
                      onClick={() => handleUpdateStatus("RESERVED")}
                      className="btn btn-secondary"
                      disabled={updatingStatus}
                    >
                      Mark as Reserved
                    </button>
                  )}
                  {listing.status === "RESERVED" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus("ACTIVE")}
                        className="btn btn-secondary"
                        disabled={updatingStatus}
                      >
                        Re-activate Listing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("SOLD")}
                        className="btn btn-primary"
                        disabled={updatingStatus}
                      >
                        Mark as Sold (Handover complete)
                      </button>
                    </>
                  )}
                  {listing.status === "SOLD" && (
                    <button
                      onClick={() => handleUpdateStatus("ACTIVE")}
                      className="btn btn-secondary"
                      disabled={updatingStatus}
                    >
                      Relist Item
                    </button>
                  )}
                  <button
                    onClick={handleDeleteListing}
                    className="btn btn-danger"
                    style={{ marginLeft: "auto" }}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Report Modal - Sketch Sheet */}
      {reportModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div className="sketch-card" style={{ width: "100%", maxWidth: "460px", padding: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>Report Listing</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-secondary)", marginBottom: "1.25rem" }}>
              Campus administrators review all reports to keep the marketplace safe and scam-free.
            </p>

            {reportSuccess ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#15803d" }}>
                <CheckCircle size={40} style={{ margin: "0 auto 0.5rem" }} />
                <p style={{ fontWeight: 700, fontFamily: "var(--font-sketch-display)", fontSize: "1.2rem" }}>Report filed successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="form-control"
                  >
                    <option value="Prohibited Item">Prohibited or Hazardous Item</option>
                    <option value="Suspected Scam">Suspected Scam or False Price</option>
                    <option value="Inappropriate Content">Inappropriate Photos or Content</option>
                    <option value="Non-Student User">Suspicious Non-Student Account</option>
                    <option value="Other">Other Community Guidelines Violation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Details</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide any context that will help campus moderators..."
                    className="form-control"
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={reportSubmitting}
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading listing...</div>}>
      <ListingDetailView />
    </Suspense>
  );
}
