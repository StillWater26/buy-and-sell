import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-campus-jwt-key-2026-development-token"
);

const COOKIE_NAME = "buy_and_sell_session";
const LEGACY_COOKIE_NAME = "campusmart_session";

// Validate if email matches allowed institutional domains
export function isInstitutionalEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();

  const allowedDomainsEnv = process.env.CAMPUS_ALLOWED_DOMAINS || "ac.in,edu,techuni.ac.in,campus.edu";
  const allowedList = allowedDomainsEnv.split(",").map((d) => d.trim().toLowerCase());

  // Matches either exact domain or suffix (e.g. iitb.ac.in ends with ac.in, or mit.edu ends with edu)
  return allowedList.some((allowed) => domain === allowed || domain.endsWith("." + allowed));
}

// Password helpers
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session Token Management
export async function createSessionToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

// Get the authenticated user from cookies
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value || cookieStore.get(LEGACY_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        graduationYear: true,
        hostelBlock: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

// Helper to set cookie in Route Handlers
export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  };
}

// Generate 6 digit numeric OTP
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
