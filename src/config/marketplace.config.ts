/**
 * Central Configuration for Buy & Sell Marketplace
 * Contains all static configurations, categories, campus parameters, safety zones,
 * allowed institutional domains, and business rule definitions.
 */

export interface CampusConfig {
  campusName: string;
  campusShortName: string;
  tagline: string;
  currencySymbol: string;
  currencyCode: string;
  allowedEmailDomains: string[];
  supportEmail: string;
  safeSpots: CampusSafeSpot[];
  categories: CategoryConfig[];
  conditions: string[];
  urgencyLevels: string[];
  listingStatuses: string[];
  reportReasons: string[];
  maxUploadSizeBytes: number;
  allowedImageTypes: string[];
}

export interface CampusSafeSpot {
  id: string;
  name: string;
  description: string;
  recommendedHours: string;
  cctvCovered: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  popularItems: string[];
}

export const MARKETPLACE_CONFIG: CampusConfig = {
  campusName: "TechUni Buy & Sell",
  campusShortName: "TechUni",
  tagline: "Peer-to-Peer Zero-Commission Student Marketplace",
  currencySymbol: "₹",
  currencyCode: "INR",
  
  // Institutional email domain suffixes allowed for student registration
  allowedEmailDomains: [
    "ac.in",
    "edu",
    "techuni.ac.in",
    "campus.edu",
    "student.techuni.ac.in",
  ],

  supportEmail: "support@techuni.ac.in",

  // Designated high-visibility campus meetup zones for safe transactions
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
    {
      id: "cafeteria-central",
      name: "Campus Central Cafeteria",
      description: "Seating courtyard near the Nescafe kiosk.",
      recommendedHours: "8:00 AM – 10:00 PM",
      cctvCovered: true,
    },
    {
      id: "hall-2-cycle",
      name: "Hall 2 Cycle Stand & Gate",
      description: "Convenient for bicycle testing and dorm gear exchange.",
      recommendedHours: "8:00 AM – 8:00 PM",
      cctvCovered: true,
    },
    {
      id: "hall-4-common",
      name: "Hall 4 Common Room Lobby",
      description: "Security desk entrance for male residence cluster.",
      recommendedHours: "9:00 AM – 8:00 PM",
      cctvCovered: true,
    },
    {
      id: "hall-7-reception",
      name: "Hall 7 (Gargi) Reception Desk",
      description: "Visitor reception and front lawn of the residence block.",
      recommendedHours: "9:00 AM – 7:30 PM",
      cctvCovered: true,
    },
    {
      id: "science-complex",
      name: "Science Complex Entrance Quadrangle",
      description: "Main lobby connecting Physics and Computing laboratories.",
      recommendedHours: "9:00 AM – 6:00 PM",
      cctvCovered: true,
    },
    {
      id: "sports-complex",
      name: "Campus Sports Complex / Gymnasium",
      description: "Open pavilion ideal for sports gear and fitness equipment handoffs.",
      recommendedHours: "6:00 AM – 9:00 PM",
      cctvCovered: true,
    },
    {
      id: "admin-quad",
      name: "Admin Building Quadrangle",
      description: "Central campus roundabout with constant campus security patrols.",
      recommendedHours: "9:00 AM – 6:00 PM",
      cctvCovered: true,
    },
  ],

  // Marketplace item categories
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
    {
      id: "Dorm Essentials",
      name: "Dorm Essentials",
      description: "Mattresses, kettles, bed tables, study lamps, storage racks, and mirrors.",
      popularItems: ["Electric Kettle", "Foldable Bed Desk", "LED Study Lamp"],
    },
    {
      id: "Transport",
      name: "Cycles & Transport",
      description: "Geared & non-geared campus cycles, helmets, locks, and accessories.",
      popularItems: ["Hercules Roadeo", "Hero Ranger", "Bicycle U-Lock"],
    },
    {
      id: "Fashion & Sports",
      name: "Fashion & Sports",
      description: "Badminton racquets, cricket gear, lab coats, hoodies, and backpacks.",
      popularItems: ["Yonex Racquet", "Cotton Lab Apron", "Campus Backpack"],
    },
    {
      id: "Free / Giveaway",
      name: "Free / Giveaway",
      description: "Senior donations and free hand-me-downs for campus peers.",
      popularItems: ["First-Year Notes", "Dorm Stationery", "Hangers & Organizers"],
    },
  ],

  // Standard condition ratings
  conditions: ["Brand New", "Like New", "Good", "Fair"],

  // Urgency ratings for Wanted board
  urgencyLevels: ["LOW", "NORMAL", "URGENT"],

  // Listing lifecycle statuses
  listingStatuses: ["ACTIVE", "RESERVED", "SOLD", "ARCHIVED"],

  // Report incident reasons
  reportReasons: [
    "Prohibited Item on Campus",
    "Suspected Counterfeit or Scam",
    "No-show / Fake Listing",
    "Inappropriate or Harassing Content",
    "Duplicate / Spam Listing",
    "Other Campus Policy Violation",
  ],

  // Upload limits
  maxUploadSizeBytes: 8 * 1024 * 1024, // 8MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
};

// Quick helper arrays for selects and UI lists
export const CAMPUS_SAFE_SPOT_NAMES = MARKETPLACE_CONFIG.safeSpots.map((s) => s.name);
export const CATEGORY_NAMES = MARKETPLACE_CONFIG.categories.map((c) => c.name);
export const CURRENCY_SYMBOL = MARKETPLACE_CONFIG.currencySymbol;
