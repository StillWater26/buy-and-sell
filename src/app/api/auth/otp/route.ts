import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInstitutionalEmail, generateOtp, createSessionToken, getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, otp, name } = body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !isInstitutionalEmail(cleanEmail)) {
      return NextResponse.json(
        { error: "A valid institutional email (.edu / .ac.in / techuni.ac.in) is required" },
        { status: 400 }
      );
    }

    if (action === "send") {
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.otpVerification.create({
        data: {
          email: cleanEmail,
          otp: code,
          expiresAt,
        },
      });

      // In real-world, email is dispatched. In this campus prototype, code is returned for quick testing.
      return NextResponse.json({
        success: true,
        message: `OTP sent to ${cleanEmail}`,
        demoOtp: code, // convenient for immediate testing
      });
    }

    if (action === "verify") {
      if (!otp) {
        return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
      }

      const validRecord = await prisma.otpVerification.findFirst({
        where: {
          email: cleanEmail,
          otp: otp.trim(),
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!validRecord) {
        return NextResponse.json({ error: "Invalid or expired OTP verification code" }, { status: 400 });
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name || cleanEmail.split("@")[0].replace(".", " ").toUpperCase(),
            email: cleanEmail,
            isEmailVerified: true,
            role: "STUDENT",
            department: "General Studies",
            graduationYear: 2026,
            hostelBlock: "Campus Hostel",
          },
        });
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
          role: user.role,
        },
      });

      response.cookies.set(cookieOptions.name, token, cookieOptions);
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("OTP route error:", error);
    return NextResponse.json({ error: "Failed to process OTP verification" }, { status: 500 });
  }
}
