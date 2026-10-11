import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => null);

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            graduationYear: true,
            hostelBlock: true,
            avatarUrl: true,
            createdAt: true,
            reviewsReceived: {
              select: {
                id: true,
                rating: true,
                comment: true,
                tags: true,
                createdAt: true,
                reviewer: {
                  select: { name: true, avatarUrl: true, hostelBlock: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Calculate seller rating metrics
    const reviews = listing.seller.reviewsReceived || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5.0;

    let isSaved = false;
    if (user) {
      const saved = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: id,
          },
        },
      });
      isSaved = !!saved;
    }

    return NextResponse.json({
      listing: {
        ...listing,
        isSaved,
        seller: {
          ...listing.seller,
          averageRating: Number(avgRating.toFixed(1)),
          totalReviews: reviews.length,
        },
      },
    });
  } catch (error) {
    console.error("Single listing fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You are not the owner of this listing" }, { status: 403 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        status: body.status !== undefined ? body.status : listing.status,
        price: body.price !== undefined ? parseFloat(body.price) : listing.price,
        title: body.title !== undefined ? body.title : listing.title,
        description: body.description !== undefined ? body.description : listing.description,
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Listing update error:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Listing deleted" });
  } catch (error) {
    console.error("Listing delete error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
