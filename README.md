# Buy & Sell — Campus Marketplace

> **Zero-Commission, Verified Student Peer-to-Peer Marketplace** built with Next.js 16 (App Router), React 19, TypeScript, Prisma (SQLite), and Real-Time SSE Chat.

---

## 📖 Complete Application Documentation

This repository includes full, exhaustive specifications for the entire platform:

* 📄 **[SPECIFICATION.md](./SPECIFICATION.md)** — Comprehensive architecture, data models, business rules, REST & SSE API reference, and real-time chat mechanics.
* ⚙️ **[CONFIG_GUIDE.md](./CONFIG_GUIDE.md)** — Guide to institutional configurations (meetup zones, categories, allowed domains, currency, etc.).
* 🛠️ **`src/config/marketplace.config.ts`** — Central configuration file holding all campus parameters.

---

## 🚀 Key Features

* 🎓 **Institutional Email Verification**: Strict domain whitelist (`.edu`, `.ac.in`) with password and instant OTP authentication modes.
* 📍 **Designated Safe Meetup Zones**: Required physical meetup spot selection (Library Foyer, Student Activity Center, Central Cafeteria, etc.) with safety guidance.
* 💬 **Real-Time In-App Bargaining & Chat**: Server-Sent Events (SSE) live chat with upward/downward scroll management and integrated counter-offers.
* 🤝 **Offer & Reservation Flow**: In-chat price proposals that automatically lock and reserve the item upon seller acceptance.
* 🔖 **Saved Wishlist**: Instant bookmarking of items with a dedicated "Saved Wishlist" tab in the student profile.
* 📢 **Campus Wanted Board**: Student request board with urgency ratings (Normal vs. Urgent) and target budgets.
* ⭐ **Peer Reputation & Trust**: 1–5 star ratings, feedback comments, and verifiable campus badges.
* 🛡️ **Moderation Dashboard**: Safety incident reporting and admin dashboard at `/admin` to resolve or remove offending listings.
* 🎨 **Notebook Sketch Aesthetic**: Handcrafted monochromatic graphite paper aesthetic with subtle pencil highlights and offset drop shadows.
* 💰 **Indian Rupee (₹) Currency**: Fully localized campus currency pricing across the whole system.

---

## 🏃 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database & Seed Data
```bash
# Generate Prisma Client & push schema to local SQLite database
npx prisma db push

# Populate realistic campus users, listings, requests, and chats
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Campus Accounts (Pre-Seeded)

All demo accounts share the default password: **`campus123`**

| Role | Name | Email | Hostel Block |
|---|---|---|---|
| **Student (Seller/Buyer)** | Arjun Sharma | `arjun.sharma@techuni.ac.in` | Hall 4, Wing-B, Room 302 |
| **Student (Seller/Buyer)** | Priya Patel | `priya.patel@techuni.ac.in` | Hall 7 (Gargi), Room 114 |
| **Student (Seller/Buyer)** | Rohan Verma | `rohan.verma@techuni.ac.in` | Hall 2 (Aryabhatta), Room 208 |
| **Campus Admin** | Campus Security | `admin@techuni.ac.in` | Admin Block A-12 |

---

## 📁 Repository Structure

```
├── SPECIFICATION.md          # Complete technical & functional system specification
├── CONFIG_GUIDE.md           # Guide to application parameters & customization
├── prisma/
│   ├── schema.prisma         # Prisma ORM relational schema (SQLite)
│   ├── seed.ts               # Database seeder with realistic campus data
│   └── dev.db                # Local SQLite database
├── src/
│   ├── config/
│   │   └── marketplace.config.ts # Central config: categories, spots, allowed domains, currency
│   ├── app/
│   │   ├── page.tsx          # Marketplace feed, filters, search & giveaways
│   │   ├── listing/[id]/     # Listing details, photo gallery, save & offer buttons
│   │   ├── sell/             # New listing creation form
│   │   ├── wanted/           # Campus Wanted request board
│   │   ├── chat/             # Real-time SSE chat & offer negotiation hub
│   │   ├── profile/          # Student profile, my listings, saved wishlist & reviews
│   │   ├── admin/            # Incident report moderation dashboard
│   │   ├── auth/             # Login & registration with password and OTP
│   │   └── api/              # Route handlers (auth, listings, chat, offers, reviews, reports)
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar, search, unread counter & avatar dropdown
│   │   └── Footer.tsx        # Safe campus mission, safe zones & honor code
│   └── lib/
│       ├── auth.ts           # JWT session token management & domain verification
│       ├── prisma.ts         # Singleton Prisma client instance
│       └── storage.ts        # Image upload & disk storage helper
└── package.json
```
