# Buy & Sell Configuration Guide

All application configurations, campus parameters, safety zones, allowed email domains, categories, and currency settings are defined in a centralized, type-safe configuration file:

> 📁 **`src/config/marketplace.config.ts`**

This document details each configurable section and how to adapt the marketplace for any educational institution.

---

## 1. Campus Identity & Currency

```typescript
export const MARKETPLACE_CONFIG = {
  campusName: "TechUni Buy & Sell",       // Displayed across headers and metadata
  campusShortName: "TechUni",             // Used in badges and pills
  tagline: "Peer-to-Peer Zero-Commission Student Marketplace",
  currencySymbol: "₹",                    // Active currency symbol (Rupees)
  currencyCode: "INR",                    // Standard currency code
  supportEmail: "support@techuni.ac.in",  // Displayed in footer & contact prompts
  // ...
};
```

* **To change currency**: Update `currencySymbol` and `currencyCode`. The entire platform (listings, feeds, chat offers, wanted requests, profile) dynamically reads from this value.
* **To change college name**: Update `campusName` and `campusShortName`.

---

## 2. Institutional Email Whitelist

The marketplace enforces student-only registration by validating email domains on signup and OTP verification:

```typescript
allowedEmailDomains: [
  "ac.in",                     // Indian academic institutions (.ac.in suffix)
  "edu",                       // International educational institutions (.edu suffix)
  "techuni.ac.in",             // Specific university primary domain
  "campus.edu",                // Associated campus domain
  "student.techuni.ac.in",     // Student subdomain
],
```

* Any email ending with one of these domain suffixes will pass verification.
* Can also be overridden at runtime via the `CAMPUS_ALLOWED_DOMAINS` environment variable in `.env`.

---

## 3. Campus Safe Meetup Zones

Every listing posted on the marketplace requires selecting a designated campus meetup spot. This encourages peer transactions in visible, well-lit areas during daylight hours:

```typescript
safeSpots: [
  {
    id: "lib-foyer",
    name: "Central Library Foyer",
    description: "Well-lit reception foyer right by the turnstiles and security desk.",
    recommendedHours: "9:00 AM – 9:00 PM",
    cctvCovered: true,
  },
  {
    id: "sac-lobby",
    name: "Student Activity Center (SAC)",
    description: "High-traffic student hub near the indoor sports cafeteria.",
    recommendedHours: "10:00 AM – 8:00 PM",
    cctvCovered: true,
  },
  // Add additional landmarks or hostel gates as needed
]
```

* **Adding a new safe spot**: Simply append an object with `id`, `name`, `description`, `recommendedHours`, and `cctvCovered`. It will automatically appear in the listing creation dropdown and safety notice cards.

---

## 4. Item Categories & Popular Suggestions

```typescript
categories: [
  {
    id: "Textbooks",
    name: "Textbooks",
    description: "Coursebooks, reference materials, lab manuals, and syllabus notes.",
    popularItems: ["Engineering Mathematics", "Data Structures", "Organic Chemistry"],
  },
  {
    id: "Electronics",
    name: "Electronics",
    description: "Calculators, monitors, headphones, keyboards, adapters, and chargers.",
    popularItems: ["Casio Scientific Calculator", "Mechanical Keyboard", "USB-C Hub"],
  },
  // ...
]
```

---

## 5. Item Conditions & Urgency Tiers

* **Item Conditions**: `["Brand New", "Like New", "Good", "Fair"]`
* **Urgency Levels for Wanted Board**: `["LOW", "NORMAL", "URGENT"]`
* **Listing Lifecycles**: `["ACTIVE", "RESERVED", "SOLD", "ARCHIVED"]`

---

## 6. Safety & Incident Reporting Categories

When a user flags a listing, the modal presents predefined reasons:
```typescript
reportReasons: [
  "Prohibited Item on Campus",
  "Suspected Counterfeit or Scam",
  "No-show / Fake Listing",
  "Inappropriate or Harassing Content",
  "Duplicate / Spam Listing",
  "Other Campus Policy Violation",
]
```

---

## 7. File Upload & Media Limits

```typescript
maxUploadSizeBytes: 8 * 1024 * 1024, // 8MB limit per file
allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
```

---

## 8. Environment Variables (`.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | SQLite file connection string | `file:./dev.db` |
| `CAMPUS_ALLOWED_DOMAINS` | Comma-separated domain suffixes | `ac.in,edu,techuni.ac.in,campus.edu` |
| `JWT_SECRET` | Secret key for HS256 session token generation | (32+ character secure random string) |
| `NEXT_PUBLIC_APP_URL` | Application root web URL | `http://localhost:3000` |
| `NEXT_PUBLIC_CAMPUS_NAME` | Client-accessible campus branding | `TechUni Buy & Sell` |
