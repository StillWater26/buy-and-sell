import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid campus email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid campus email or password" }, { status: 401 });
    }

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
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 });
  }
}
