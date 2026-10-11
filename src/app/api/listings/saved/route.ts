import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const savedRecords = await prisma.savedListing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: "asc" } },
            seller: {
              select: {
                id: true,
                name: true,
                department: true,
                hostelBlock: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const listings = savedRecords.map((record) => ({
      ...record.listing,
      savedAt: record.createdAt,
    }));

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Fetch saved listings error:", error);
    return NextResponse.json({ error: "Failed to fetch saved listings" }, { status: 500 });
  }
}
