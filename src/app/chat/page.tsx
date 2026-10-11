"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send,
  MessageSquare,
  MapPin,
  Check,
  Star,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/config/marketplace.config";

interface StudentUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  hostelBlock?: string;
  graduationYear?: number;
  avatarUrl?: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface OfferItem {
  id: string;
  amount: number;
  status: string;
}

interface RoomData {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyer: StudentUser;
  seller: StudentUser;
  listing: {
    id: string;
    title: string;
    price: number;
    meetupLocation: string;
    status: string;
    images?: { url: string }[];
  };
  messages: MessageItem[];
  offers?: OfferItem[];
}

function ChatHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRoomId = searchParams.get("room");

  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId);
  const [activeRoomData, setActiveRoomData] = useState<RoomData | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Offer modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Review modal state (when sold)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isNearBottomRef = useRef(true);
  const previousRoomIdRef = useRef<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) {
        router.push("/auth/login?redirect=/chat");
      } else {
        setCurrentUser(data.user);
      }
    } catch {
      router.push("/auth/login?redirect=/chat");
    }
  }, [router]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
      if (!selectedRoomId && data.rooms && data.rooms.length > 0) {
        setSelectedRoomId(data.rooms[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedRoomId]);

  const fetchRoomMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`);
      const data = await res.json();
      if (res.ok) {
        setActiveRoomData(data.room);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const setupLiveStream = useCallback((roomId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(`/api/chat/${roomId}/stream`);
      es.addEventListener("message", (event) => {
        const newMsg = JSON.parse(event.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.messageType.includes("OFFER")) {
          fetchRoomMessages(roomId);
        }
      });
      eventSourceRef.current = es;
    } catch (err) {
      console.error("SSE stream setup error:", err);
    }
  }, [fetchRoomMessages]);

  useEffect(() => {
    fetchCurrentUser();
    fetchRooms();
  }, [fetchCurrentUser, fetchRooms]);

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomMessages(selectedRoomId);
      setupLiveStream(selectedRoomId);
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedRoomId, fetchRoomMessages, setupLiveStream]);

  // Handle scroll events in chat messages container
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceToBottom < 80;
    isNearBottomRef.current = nearBottom;
    setIsScrolledUp(!nearBottom);
  };

  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (smooth) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      container.scrollTop = container.scrollHeight;
    }
    isNearBottomRef.current = true;
    setIsScrolledUp(false);
  };

  // Auto-scroll management: ONLY auto-scroll to bottom if user is already near bottom or switched rooms
  useEffect(() => {
    const roomChanged = previousRoomIdRef.current !== selectedRoomId;
    if (roomChanged) {
      previousRoomIdRef.current = selectedRoomId;
      // When switching rooms, jump immediately to bottom
      setTimeout(() => scrollToBottom(false), 50);
    } else if (isNearBottomRef.current) {
      // If user was already at the bottom, stay at bottom
      scrollToBottom(true);
    }
    // If user has scrolled upwards to read earlier history, DO NOT FORCE SCROLL DOWN!
  }, [messages, selectedRoomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedRoomId || sending) return;

    setSending(true);
    const content = inputMessage.trim();
    setInputMessage("");

    try {
      const res = await fetch(`/api/chat/${selectedRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        fetchRooms();
        // Since current user sent a message, always scroll down to see it
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch {
      alert("Failed to send message. Please retry.");
    } finally {
      setSending(false);
    }
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomData || !offerAmount) return;

    setOfferSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatRoomId: activeRoomData.id,
          listingId: activeRoomData.listingId,
          amount: parseFloat(offerAmount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOfferModalOpen(false);
        setOfferAmount("");
        fetchRoomMessages(selectedRoomId!);
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        alert(data.error || "Failed to make offer");
      }
    } catch {
      alert("Error proposing offer");
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleOfferResponse = async (offerId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, status }),
      });
      if (res.ok) {
        fetchRoomMessages(selectedRoomId!);
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch {
      alert("Failed to update offer");
    }
  };

  const handleMarkAsSold = async () => {
    if (!activeRoomData) return;
    if (!confirm("Confirm meetup completed and item handed over? This will mark it as SOLD.")) return;

    try {
      await fetch(`/api/listings/${activeRoomData.listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SOLD" }),
      });
      fetchRoomMessages(selectedRoomId!);
      setReviewModalOpen(true);
    } catch {
      alert("Failed to update status");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomData || !currentUser) return;

    const targetId = currentUser.id === activeRoomData.sellerId ? activeRoomData.buyerId : activeRoomData.sellerId;
    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          rating: reviewRating,
          comment: reviewComment,
          tags: "Punctual meetup,Friendly peer",
        }),
      });
      if (res.ok) {
        setReviewModalOpen(false);
        alert("Peer review submitted! Thank you for strengthening campus trust.");
      }
    } catch {
      alert("Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isSeller = currentUser && activeRoomData && currentUser.id === activeRoomData.sellerId;
  const isBuyer = currentUser && activeRoomData && currentUser.id === activeRoomData.buyerId;
  const counterpart = isSeller ? activeRoomData?.buyer : activeRoomData?.seller;
  const latestOffer = activeRoomData?.offers?.[0];

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      <div
        className="sketch-card"
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          height: "calc(100vh - 160px)",
          minHeight: "580px",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        {/* Left Sidebar: Conversations List */}
        <div style={{ borderRight: "2px solid var(--graphite-dark)", display: "flex", flexDirection: "column", background: "var(--paper-bg)", minHeight: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem", borderBottom: "2px solid var(--graphite-dark)", flexShrink: 0 }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--graphite-dark)" }}>Campus Chats</h2>
            <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-sketch-accent)", color: "var(--ink-muted)" }}>
              Direct messages & offer bargaining
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {rooms.length === 0 ? (
              <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "var(--ink-muted)", fontSize: "0.95rem", fontFamily: "var(--font-sketch-accent)" }}>
                No active conversations yet. Reach out to a seller on the marketplace!
              </div>
            ) : (
              rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const otherStudent = currentUser?.id === room.sellerId ? room.buyer : room.seller;
                const lastMsg = room.messages?.[0]?.content || "Started conversation";

                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      router.replace(`/chat?room=${room.id}`);
                    }}
                    style={{
                      padding: "1rem",
                      borderBottom: "1.5px dashed var(--graphite-subtle)",
                      cursor: "pointer",
                      background: isSelected ? "var(--sketch-highlight-yellow)" : "transparent",
                      borderLeft: isSelected ? "4px solid var(--graphite-dark)" : "4px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "var(--wobble-card)",
                          background: "#ffffff",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1.5px solid var(--graphite-dark)",
                          boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
                        }}
                      >
                        {room.listing?.images?.[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={room.listing.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-sketch-display)", color: "var(--graphite-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {otherStudent?.name}
                          </div>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-sketch-display)", color: "var(--graphite-dark)" }}>
                            {CURRENCY_SYMBOL}{room.listing?.price}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.85rem", fontFamily: "var(--font-sketch-accent)", color: "var(--graphite-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {room.listing?.title}
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>
                          {lastMsg}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Conversation View & Bargaining Bar */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden", background: "#ffffff", position: "relative" }}>
          {activeRoomData ? (
            <>
              {/* Active Header: Listing Context & Negotiation Actions */}
              <div
                style={{
                  padding: "0.9rem 1.25rem",
                  borderBottom: "2px solid var(--graphite-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--paper-card)",
                  gap: "1rem",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      border: "2px solid var(--graphite-dark)",
                      background: "var(--sketch-highlight-yellow)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-sketch-display)",
                      boxShadow: "1.5px 1.5px 0px var(--graphite-dark)",
                    }}
                  >
                    {counterpart?.name?.charAt(0)}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.15rem", fontFamily: "var(--font-sketch-display)", color: "var(--graphite-dark)" }}>{counterpart?.name}</span>
                      <span className="badge badge-verified" style={{ fontSize: "0.78rem" }}>Campus Verified</span>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span>Item: <Link href={`/listing/${activeRoomData.listingId}`} style={{ color: "var(--graphite-dark)", textDecoration: "underline", fontWeight: 600 }}>{activeRoomData.listing?.title}</Link></span>
                      <span style={{ fontWeight: 700, fontFamily: "var(--font-sketch-display)" }}>({CURRENCY_SYMBOL}{activeRoomData.listing?.price})</span>
                    </div>
                  </div>
                </div>

                {/* Meetup Spot & Bargaining Action Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div className="badge badge-location" style={{ fontSize: "0.85rem" }}>
                    <MapPin size={12} strokeWidth={2.2} />
                    <span>{activeRoomData.listing?.meetupLocation}</span>
                  </div>

                  {/* Buyer action: Make Offer */}
                  {isBuyer && activeRoomData.listing?.status === "ACTIVE" && (
                    <button
                      onClick={() => setOfferModalOpen(true)}
                      className="btn btn-primary"
                      style={{ padding: "0.45rem 0.85rem", fontSize: "0.95rem" }}
                    >
                      <span>{CURRENCY_SYMBOL} Make Offer</span>
                    </button>
                  )}

                  {/* Seller action: Mark Sold */}
                  {isSeller && activeRoomData.listing?.status === "RESERVED" && (
                    <button
                      onClick={handleMarkAsSold}
                      className="btn btn-primary"
                      style={{ padding: "0.45rem 0.85rem", fontSize: "0.95rem" }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Confirm Handover & Sold</span>
                    </button>
                  )}

                  {activeRoomData.listing?.status === "RESERVED" && (
                    <span className="badge badge-reserved">RESERVED</span>
                  )}

                  {activeRoomData.listing?.status === "SOLD" && (
                    <span className="badge badge-sold">SOLD</span>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area with full upward and downward scrolling */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{
                  flex: "1 1 0%",
                  minHeight: 0,
                  overflowY: "auto",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Safe Meetup Prompt Banner */}
                <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
                  <span style={{ fontSize: "0.82rem", fontFamily: "var(--font-sketch-accent)", background: "var(--sketch-highlight-gray)", border: "1.5px solid var(--graphite-dark)", padding: "0.25rem 0.85rem", borderRadius: "var(--wobble-pill)", color: "var(--graphite-dark)" }}>
                    🔒 Verified Student Conversation • Meet at designated campus zones
                  </span>
                </div>

                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;

                  // Render Offer Card Proposal
                  if (msg.messageType === "OFFER_PROPOSAL") {
                    return (
                      <div
                        key={msg.id}
                        className="sketch-card"
                        style={{
                          margin: "0.5rem auto",
                          maxWidth: "420px",
                          width: "100%",
                          background: "var(--sketch-highlight-yellow)",
                          padding: "1rem",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", color: "var(--graphite-dark)", fontWeight: 700, fontFamily: "var(--font-sketch-display)", fontSize: "1.1rem", marginBottom: "0.3rem" }}>
                          <span>{CURRENCY_SYMBOL} CAMPUS OFFER PROPOSAL</span>
                        </div>
                        <p style={{ fontSize: "1.05rem", color: "var(--graphite-dark)", fontWeight: 700, fontFamily: "var(--font-sketch-display)", marginBottom: "0.5rem" }}>
                          {msg.content}
                        </p>

                        {/* If current user is seller and latest offer is pending, allow accept/decline */}
                        {isSeller && latestOffer && latestOffer.status === "PENDING" && (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
                            <button
                              onClick={() => handleOfferResponse(latestOffer.id, "ACCEPTED")}
                              className="btn btn-primary"
                              style={{ padding: "0.4rem 0.9rem", fontSize: "0.92rem" }}
                            >
                              <Check size={14} /> Accept Offer & Reserve
                            </button>
                            <button
                              onClick={() => handleOfferResponse(latestOffer.id, "DECLINED")}
                              className="btn btn-danger"
                              style={{ padding: "0.4rem 0.9rem", fontSize: "0.92rem" }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Render Offer Accepted banner
                  if (msg.messageType === "OFFER_ACCEPTED") {
                    return (
                      <div
                        key={msg.id}
                        className="sketch-card"
                        style={{
                          margin: "0.5rem auto",
                          maxWidth: "480px",
                          width: "100%",
                          background: "var(--sketch-highlight-green)",
                          padding: "1rem",
                          textAlign: "center",
                          color: "var(--graphite-dark)",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontFamily: "var(--font-sketch-display)", fontSize: "1.15rem", marginBottom: "0.25rem" }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                          Coordinate the exact meeting time and cash or UPI payment directly below.
                        </div>
                      </div>
                    );
                  }

                  // Standard text message bubble
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "68%",
                          padding: "0.75rem 1rem",
                          borderRadius: "var(--wobble-card)",
                          background: isMine ? "var(--graphite-dark)" : "var(--paper-card)",
                          color: isMine ? "#ffffff" : "var(--graphite-dark)",
                          border: "2px solid var(--graphite-dark)",
                          boxShadow: "2px 2px 0px var(--graphite-dark)",
                        }}
                      >
                        <div style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>{msg.content}</div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontFamily: "var(--font-sketch-accent)",
                            color: isMine ? "#cbd5e1" : "var(--ink-muted)",
                            textAlign: "right",
                            marginTop: "4px",
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating "Jump to latest" button when user scrolled up */}
              {isScrolledUp && (
                <button
                  onClick={() => scrollToBottom(true)}
                  style={{
                    position: "absolute",
                    bottom: "75px",
                    right: "25px",
                    background: "var(--graphite-dark)",
                    color: "#ffffff",
                    border: "2px solid var(--graphite-dark)",
                    borderRadius: "var(--wobble-pill)",
                    padding: "0.4rem 0.85rem",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sketch-sm)",
                    zIndex: 10,
                  }}
                >
                  <ArrowDown size={14} />
                  <span>Scroll to latest</span>
                </button>
              )}

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "0.9rem 1.25rem",
                  borderTop: "2px solid var(--graphite-dark)",
                  display: "flex",
                  gap: "0.75rem",
                  background: "var(--paper-card)",
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message or propose a campus meetup time..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: "var(--wobble-pill)" }}
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="btn btn-primary"
                  style={{ borderRadius: "var(--wobble-pill)", width: "42px", height: "42px", padding: 0 }}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ink-muted)", gap: "1rem" }}>
              <MessageSquare size={48} strokeWidth={1.8} />
              <div style={{ fontFamily: "var(--font-sketch-display)", fontSize: "1.2rem" }}>Select a conversation from the left to start bargaining</div>
            </div>
          )}
        </div>
      </div>

      {/* Make Offer Modal */}
      {offerModalOpen && activeRoomData && (
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
          <div className="sketch-card" style={{ width: "100%", maxWidth: "420px", padding: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>Make an Offer</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-secondary)", marginBottom: "1.25rem" }}>
              Original listing price is <strong>{CURRENCY_SYMBOL}{activeRoomData.listing?.price}</strong>. Propose your counter price:
            </p>

            <form onSubmit={handleMakeOffer}>
              <div className="form-group">
                <label className="form-label">Offer Amount ({CURRENCY_SYMBOL} INR) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 450"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerSubmitting}
                  className="btn btn-primary"
                >
                  {offerSubmitting ? "Sending..." : "Send Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
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
          <div className="sketch-card" style={{ width: "100%", maxWidth: "440px", padding: "2rem", background: "#ffffff" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>Rate Your Campus Peer</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-secondary)", marginBottom: "1.25rem" }}>
              How was your handover with {counterpart?.name}? Your review helps maintain trust across the campus.
            </p>

            <form onSubmit={handleSubmitReview}>
              <div className="form-group" style={{ textAlign: "center", margin: "1rem 0" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem" }}
                    >
                      <Star
                        size={28}
                        fill={star <= reviewRating ? "var(--graphite-dark)" : "transparent"}
                        color="var(--graphite-dark)"
                      />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: "1rem", fontFamily: "var(--font-sketch-display)", fontWeight: 700, marginTop: "0.4rem" }}>
                  {reviewRating} out of 5 Stars
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Feedback Comments</label>
                <textarea
                  rows={3}
                  placeholder="e.g. On-time meetup at library foyer, item was in perfect condition!"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn btn-primary"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Peer Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatHubPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading chats...</div>}>
      <ChatHub />
    </Suspense>
  );
}
