import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isGiveaway = searchParams.get("isGiveaway");
    const status = searchParams.get("status") || "ACTIVE";
    const sort = searchParams.get("sort") || "recent";

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (condition && condition !== "All") {
      where.condition = condition;
    }

    if (isGiveaway === "true") {
      where.isGiveaway = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "views") orderBy = { viewCount: "desc" };

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        images: { orderBy: { order: "asc" } },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            hostelBlock: true,
            graduationYear: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Listings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      condition,
      price,
      isNegotiable,
      isGiveaway,
      meetupLocation,
      images,
    } = body;

    if (!title || !category || !condition || !meetupLocation) {
      return NextResponse.json({ error: "Please provide all required listing details" }, { status: 400 });
    }

    const numericPrice = isGiveaway ? 0 : parseFloat(price) || 0;

    const listing = await prisma.listing.create({
      data: {
        title,
        description: description || "",
        category,
        condition,
        price: numericPrice,
        isNegotiable: isGiveaway ? false : Boolean(isNegotiable),
        isGiveaway: Boolean(isGiveaway),
        meetupLocation,
        sellerId: user.id,
        status: "ACTIVE",
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error("Listing creation error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
