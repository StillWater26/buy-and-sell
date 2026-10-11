import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInstitutionalEmail, hashPassword, createSessionToken, getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, department, graduationYear, hostelBlock } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, institutional email, and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enforce campus institutional email
    if (!isInstitutionalEmail(cleanEmail)) {
      return NextResponse.json(
        {
          error: "Registration restricted to verified college email domains (.edu, .ac.in, or techuni.ac.in). Please use your campus email address.",
        },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this institutional email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        department: department || "General Engineering",
        graduationYear: graduationYear ? parseInt(graduationYear) : 2026,
        hostelBlock: hostelBlock || "Campus Hostel",
        isEmailVerified: true,
        role: "STUDENT",
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        graduationYear: user.graduationYear,
        hostelBlock: user.hostelBlock,
        role: user.role,
      },
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
