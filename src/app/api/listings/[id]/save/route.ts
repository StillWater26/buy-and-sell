import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { id: listingId } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const existingSave = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    if (existingSave) {
      // Toggle off / Unsave
      await prisma.savedListing.delete({
        where: { id: existingSave.id },
      });
      return NextResponse.json({ saved: false, message: "Removed from saved listings" });
    } else {
      // Save item
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          listingId,
        },
      });
      return NextResponse.json({ saved: true, message: "Added to saved listings" });
    }
  } catch (error) {
    console.error("Toggle save listing error:", error);
    return NextResponse.json({ error: "Failed to update saved listing" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ saved: false });
    }

    const { id: listingId } = await params;

    const saved = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    return NextResponse.json({ saved: !!saved });
  } catch (error) {
    console.error("Check saved status error:", error);
    return NextResponse.json({ saved: false }, { status: 500 });
  }
}
