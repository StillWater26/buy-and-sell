import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Buy & Sell database...");

  // Clean existing data
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.wantedRequest.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("campus123", 10);

  // 1. Create Campus Users
  const arjun = await prisma.user.create({
    data: {
      name: "Arjun Sharma",
      email: "arjun.sharma@techuni.ac.in",
      passwordHash: defaultPasswordHash,
      department: "Computer Science & Engineering",
      graduationYear: 2026,
      hostelBlock: "Hall 4, Wing-B, Room 302",
      phone: "+91 98765 43210",
      isEmailVerified: true,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya.patel@techuni.ac.in",
      passwordHash: defaultPasswordHash,
      department: "Electrical & Electronics",
      graduationYear: 2027,
      hostelBlock: "Hall 7 (Gargi), Room 114",
      phone: "+91 98765 11223",
      isEmailVerified: true,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    },
  });

  const rohan = await prisma.user.create({
    data: {
      name: "Rohan Verma",
      email: "rohan.verma@techuni.ac.in",
      passwordHash: defaultPasswordHash,
      department: "Mechanical Engineering",
      graduationYear: 2025,
      hostelBlock: "Hall 2 (Aryabhatta), Room 208",
      phone: "+91 98765 88990",
      isEmailVerified: true,
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    },
  });

  const campusAdmin = await prisma.user.create({
    data: {
      name: "Campus Security & Admin",
      email: "admin@techuni.ac.in",
      passwordHash: defaultPasswordHash,
      department: "Student Affairs & Safety",
      graduationYear: 2024,
      hostelBlock: "Admin Block A-12",
      phone: "+91 98765 00000",
      isEmailVerified: true,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    },
  });

  // 2. Create Realistic Campus Listings
  const listing1 = await prisma.listing.create({
    data: {
      title: "Advanced Engineering Mathematics (Erwin Kreyszig, 10th Ed)",
      description: "Must-have for 1st & 2nd year engineering math courses! Crisp condition, zero ink markings, covers differential equations, linear algebra, and Fourier series. Passing it down since I finished the course.",
      category: "Textbooks",
      condition: "Like New",
      price: 450,
      isNegotiable: true,
      isGiveaway: false,
      meetupLocation: "Central Library Foyer",
      status: "ACTIVE",
      sellerId: arjun.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "Texas Instruments TI-84 Plus CE Color Graphing Calculator",
      description: "Rechargeable lithium battery with USB charger cable included. Excellent for calculus, linear algebra, and statistics exams. Screen is pristine, used for 2 semesters only.",
      category: "Electronics",
      condition: "Like New",
      price: 1800,
      isNegotiable: true,
      isGiveaway: false,
      meetupLocation: "Student Activity Center (SAC)",
      status: "ACTIVE",
      sellerId: priya.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "Hercules 21-Speed Gear Bicycle with Combination Lock",
      description: "Fast campus transport between hostels and academic blocks! Dual disc brakes, front suspension, smooth Shimano gears. Heavy-duty steel cable combination lock included for free.",
      category: "Transport",
      condition: "Good",
      price: 2500,
      isNegotiable: true,
      isGiveaway: false,
      meetupLocation: "Hall 2 Cycle Stand",
      status: "ACTIVE",
      sellerId: rohan.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      title: "Dorm Electric Kettle 1.5L + Ceramic Mug Set",
      description: "Perfect for midnight instant noodles, coffee, and tea during exams. Auto-shutoff safety feature, boil-dry protection. Works flawlessly.",
      category: "Dorm Essentials",
      condition: "Good",
      price: 350,
      isNegotiable: false,
      isGiveaway: false,
      meetupLocation: "Campus Central Cafeteria",
      status: "ACTIVE",
      sellerId: arjun.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1594213114663-d94db9299723?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  const listing5 = await prisma.listing.create({
    data: {
      title: "Dell 24-inch 1080p IPS Monitor (HDMI + DisplayPort)",
      description: "Super useful for coding dual-screen setups and CAD work. Has 75Hz refresh rate, tilt-adjustable stand, power adapter and high-speed HDMI cable included.",
      category: "Electronics",
      condition: "Like New",
      price: 4200,
      isNegotiable: true,
      isGiveaway: false,
      meetupLocation: "Hall 4 Common Room",
      status: "ACTIVE",
      sellerId: rohan.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  const listing6 = await prisma.listing.create({
    data: {
      title: "Freshman Chemistry & Biology Lab Coat (Size M) - Free Donation!",
      description: "Passing down my 100% cotton white lab coat to any first-year student. Freshly laundered, button intact, standard campus chemistry lab regulation compliant.",
      category: "Free / Giveaway",
      condition: "Good",
      price: 0,
      isNegotiable: false,
      isGiveaway: true,
      meetupLocation: "Science Complex Entrance",
      status: "ACTIVE",
      sellerId: priya.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  const listing7 = await prisma.listing.create({
    data: {
      title: "Yonex Carbon Badminton Racket Pair with Carrying Bag",
      description: "Two lightweight graphite rackets with grip tape recently replaced. Great for evening matches at the student gym courts. Throwing in 3 Mavis 350 nylon shuttles.",
      category: "Fashion & Sports",
      condition: "Like New",
      price: 600,
      isNegotiable: true,
      isGiveaway: false,
      meetupLocation: "Campus Sports Complex / Gymnasium",
      status: "ACTIVE",
      sellerId: arjun.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80", order: 0 },
        ],
      },
    },
  });

  // 3. Create Wanted Requests
  await prisma.wantedRequest.createMany({
    data: [
      {
        title: "Casio FX-991EX Scientific Calculator needed for Midterms",
        description: "Need non-programmable calculator permitted in exams. Willing to buy immediately or rent for the exam week.",
        category: "Electronics",
        targetBudget: 600,
        urgency: "URGENT",
        status: "OPEN",
        userId: arjun.id,
      },
      {
        title: "Foldable Wooden Bed Table / Study Desk for Dorm Room",
        description: "Looking for a compact study desk that fits next to standard hostel single bed. Any condition is fine as long as legs are steady.",
        category: "Dorm Essentials",
        targetBudget: 400,
        urgency: "NORMAL",
        status: "OPEN",
        userId: priya.id,
      },
      {
        title: "Introduction to Algorithms (CLRS) 4th Edition",
        description: "Need physical copy for CS Algorithm Design course. Can meet at library anytime between 2 PM and 7 PM.",
        category: "Textbooks",
        targetBudget: 500,
        urgency: "NORMAL",
        status: "OPEN",
        userId: rohan.id,
      },
    ],
  });

  // 4. Create Peer Reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Arjun was super punctual and polite at the Library meetup! The engineering textbook was spotless as described.",
      tags: "Punctual meetup,Honest description,Friendly student",
      reviewerId: priya.id,
      targetId: arjun.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Smooth transaction! Agreed on a fair student discount and met right outside the hostel gate.",
      tags: "Fair price,Prompt communication",
      reviewerId: rohan.id,
      targetId: arjun.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Priya is an amazing seller. Gave thorough tips on using the graphing calculator functions. Highly recommended peer!",
      tags: "Helpful peer,Item as described",
      reviewerId: arjun.id,
      targetId: priya.id,
    },
  });

  // 5. Create a Sample Chat Room & Bargaining Offer
  const demoChat = await prisma.chatRoom.create({
    data: {
      listingId: listing1.id,
      buyerId: priya.id,
      sellerId: arjun.id,
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        chatRoomId: demoChat.id,
        senderId: priya.id,
        content: "Hey Arjun! Is this Kreyszig math textbook still available?",
        messageType: "TEXT",
      },
      {
        chatRoomId: demoChat.id,
        senderId: arjun.id,
        content: "Hi Priya! Yes, still available. Are you looking to pick it up today?",
        messageType: "TEXT",
      },
      {
        chatRoomId: demoChat.id,
        senderId: priya.id,
        content: "Would you take ₹400 for it? Can meet at the Library foyer around 5 PM.",
        messageType: "OFFER_PROPOSAL",
      },
    ],
  });

  await prisma.offer.create({
    data: {
      chatRoomId: demoChat.id,
      listingId: listing1.id,
      buyerId: priya.id,
      amount: 400,
      status: "PENDING",
    },
  });

  console.log("Seeding complete! 4 users, 7 listings, 3 requests, reviews & chat thread initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
