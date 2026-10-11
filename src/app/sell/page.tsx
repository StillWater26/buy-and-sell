"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  X,
  MapPin,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Pencil,
} from "lucide-react";
import {
  CAMPUS_SAFE_SPOT_NAMES,
  CATEGORY_NAMES,
  CURRENCY_SYMBOL,
  MARKETPLACE_CONFIG,
} from "@/config/marketplace.config";

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_NAMES[0]);
  const [condition, setCondition] = useState(MARKETPLACE_CONFIG.conditions[1]); // "Like New"
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isGiveaway, setIsGiveaway] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState(CAMPUS_SAFE_SPOT_NAMES[0]);

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const checkUser = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        router.push("/auth/login?redirect=/sell");
      }
    } catch {
      router.push("/auth/login?redirect=/sell");
    } finally {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setImageUrls((prev) => [...prev, data.url]);
        } else {
          setErrorMsg(data.error || "Failed to upload image");
        }
      }
    } catch {
      setErrorMsg("Network error during file upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter an item title");
      return;
    }

    if (!isGiveaway && (!price || parseFloat(price) <= 0)) {
      setErrorMsg("Please enter a valid price, or toggle Free Giveaway");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: isGiveaway ? 0 : parseFloat(price),
        isNegotiable: isGiveaway ? false : isNegotiable,
        isGiveaway,
        meetupLocation,
        images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.listing) {
        router.push(`/listing/${data.listing.id}`);
      } else {
        setErrorMsg(data.error || "Failed to post listing");
      }
    } catch {
      setErrorMsg("Something went wrong while publishing the listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--ink-muted)", fontFamily: "var(--font-sketch-accent)", fontSize: "1.2rem" }}>
          Checking campus authentication...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "780px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" className="btn btn-ghost" style={{ fontSize: "0.95rem", padding: "0.4rem 0.75rem" }}>
          <ArrowLeft size={16} />
          <span>← Back to Marketplace</span>
        </Link>
      </div>

      <div className="sketch-card" style={{ padding: "2.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <Pencil size={24} strokeWidth={2.2} color="var(--graphite-dark)" />
            <h1 style={{ fontSize: "2.2rem" }}>List an Item on Campus</h1>
          </div>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem" }}>
            Reach thousands of students across hostels and academic departments. 100% free with zero commission fees.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "0.9rem 1.25rem",
              background: "var(--sketch-highlight-rose)",
              border: "2px solid var(--graphite-dark)",
              borderRadius: "var(--wobble-card)",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
              color: "#991b1b",
              fontSize: "0.92rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Images Upload - Pencil-dashed dropzone */}
          <div className="form-group" style={{ marginBottom: "1.75rem" }}>
            <label className="form-label">Product Photos (Up to 6)</label>
            <div
              style={{
                border: "2px dashed var(--graphite-dark)",
                borderRadius: "var(--wobble-card)",
                padding: "2rem",
                textAlign: "center",
                background: "var(--paper-bg)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "2px 2px 0px var(--graphite-dark)",
              }}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <UploadCloud size={38} strokeWidth={2} color="var(--graphite-dark)" style={{ margin: "0 auto 0.5rem" }} />
              <div style={{ fontWeight: 700, fontFamily: "var(--font-sketch-display)", fontSize: "1.1rem", color: "var(--graphite-dark)" }}>
                {uploadingImage ? "Uploading photos..." : "Click or drag photos here to sketch/upload"}
              </div>
              <div style={{ fontSize: "0.85rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)", marginTop: "0.3rem" }}>
                Supports PNG, JPG, WebP up to 8MB
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* Uploaded thumbnails */}
            {imageUrls.length > 0 && (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                      borderRadius: "var(--wobble-card)",
                      overflow: "hidden",
                      border: "2px solid var(--graphite-dark)",
                      boxShadow: "2px 2px 0px var(--graphite-dark)",
                    }}
                  >
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "var(--graphite-dark)",
                        border: "none",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Engineering Mathematics 10th Ed (Kreyszig) or Hercules Gear Cycle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Category & Condition */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === "Free / Giveaway") {
                    setIsGiveaway(true);
                  }
                }}
                className="form-control"
              >
                {CATEGORY_NAMES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="form-control"
              >
                {MARKETPLACE_CONFIG.conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Free Giveaway Switch & Price */}
          <div
            style={{
              padding: "1rem",
              background: "var(--paper-bg)",
              border: "2px solid var(--graphite-dark)",
              borderRadius: "var(--wobble-card)",
              boxShadow: "2px 2px 0px var(--graphite-dark)",
              marginBottom: "1.25rem",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginBottom: isGiveaway ? 0 : "1rem" }}>
              <input
                type="checkbox"
                checked={isGiveaway}
                onChange={(e) => {
                  setIsGiveaway(e.target.checked);
                  if (e.target.checked) {
                    setCategory("Free / Giveaway");
                    setPrice("0");
                  }
                }}
                style={{ width: "18px", height: "18px", accentColor: "var(--graphite-dark)", cursor: "pointer" }}
              />
              <span style={{ fontWeight: 700, fontFamily: "var(--font-sketch-display)", color: "var(--graphite-dark)", fontSize: "1.1rem" }}>
                🎁 List as Free Giveaway ({CURRENCY_SYMBOL}0) — Pass down to a junior!
              </span>
            </label>

            {!isGiveaway && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price ({CURRENCY_SYMBOL} INR) *</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g., 450"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-control"
                    required={!isGiveaway}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1.5rem" }}>
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    style={{ width: "17px", height: "17px", accentColor: "var(--graphite-dark)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.95rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-secondary)" }}>
                    Open to reasonable counter-offers
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Campus Meetup Location */}
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={16} strokeWidth={2.2} color="var(--graphite-dark)" />
              <span>Campus Meetup Spot *</span>
            </label>
            <select
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              className="form-control"
            >
              {CAMPUS_SAFE_SPOT_NAMES.map((spot) => (
                <option key={spot} value={spot}>{spot}</option>
              ))}
            </select>
            <span className="form-helper">
              Pick a convenient, well-trafficked campus landmark for daytime handover.
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Item Description</label>
            <textarea
              rows={4}
              placeholder="Mention semester used, edition, cosmetic wear, included cables/accessories, or reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Submit CTA */}
          <div style={{ marginTop: "2rem" }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1.2rem" }}
            >
              {submitting ? "Publishing Listing..." : "Publish Item to Campus Marketplace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
