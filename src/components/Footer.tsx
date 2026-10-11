"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, HeartHandshake } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--paper-card)",
      borderTop: "2px solid var(--graphite-dark)",
      boxShadow: "0 -3px 0px rgba(30, 41, 59, 0.05)",
      padding: "3.5rem 0 2rem",
      marginTop: "auto",
    }}>
      <div className="container">
        {/* Campus Trust Features Highlight */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          paddingBottom: "2.5rem",
          borderBottom: "2px dashed var(--graphite-subtle)",
          marginBottom: "2.5rem",
        }}>
          <div
            className="sketch-card"
            style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}
          >
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--wobble-card)",
              border: "1.5px solid var(--graphite-dark)",
              background: "var(--sketch-highlight-blue)",
              color: "var(--graphite-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
            }}>
              <ShieldCheck size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Verified Student Community</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                Restricted to official college email accounts. Zero external spammers or fake profiles.
              </p>
            </div>
          </div>

          <div
            className="sketch-card"
            style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}
          >
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--wobble-card)",
              border: "1.5px solid var(--graphite-dark)",
              background: "var(--sketch-highlight-yellow)",
              color: "var(--graphite-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
            }}>
              <MapPin size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Safe Campus Meetup Zones</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                Trade comfortably at well-lit campus landmarks like the Central Library, SAC, and hostel gates.
              </p>
            </div>
          </div>

          <div
            className="sketch-card"
            style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}
          >
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--wobble-card)",
              border: "1.5px solid var(--graphite-dark)",
              background: "var(--sketch-highlight-green)",
              color: "var(--graphite-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
            }}>
              <HeartHandshake size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>0% Fees & Freebies</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                Keep 100% of your earnings via cash or UPI. Pass items to juniors in the Giveaway section.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          fontSize: "0.92rem",
          fontFamily: "var(--font-sketch-accent)",
          color: "var(--ink-muted)",
        }}>
          <div>
            © 2026 <strong>Buy & Sell</strong> • Handcrafted for University Students
          </div>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--graphite-dark)", fontWeight: 700 }}>Marketplace</Link>
            <Link href="/wanted" style={{ color: "var(--graphite-dark)", fontWeight: 700 }}>Wanted Board</Link>
            <Link href="/?isGiveaway=true" style={{ color: "var(--graphite-dark)", fontWeight: 700 }}>Giveaways ({CURRENCY_SYMBOL}0)</Link>
            <Link href="/sell" style={{ color: "var(--graphite-dark)", fontWeight: 700 }}>Sell an Item</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
