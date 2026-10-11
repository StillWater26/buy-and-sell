import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { targetId, rating, comment, tags } = body;

    const parsedRating = parseInt(rating);
    if (!targetId || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Valid target user ID and rating between 1 and 5 are required" }, { status: 400 });
    }

    if (targetId === user.id) {
      return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: user.id,
        targetId,
        rating: parsedRating,
        comment: comment?.trim() || null,
        tags: Array.isArray(tags) ? tags.join(",") : tags || null,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) {
      return NextResponse.json({ error: "targetId query param is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { targetId },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            department: true,
            hostelBlock: true,
            avatarUrl: true,
          },
        },
      },
    });

    const averageRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 5.0;

    return NextResponse.json({ reviews, averageRating, totalCount: reviews.length });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
