import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            meetupLocation: true,
            images: { take: 1, orderBy: { order: "asc" } },
          },
        },
        buyer: {
          select: { id: true, name: true, avatarUrl: true, hostelBlock: true },
        },
        seller: {
          select: { id: true, name: true, avatarUrl: true, hostelBlock: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        offers: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Chat rooms fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.sellerId === user.id) {
      return NextResponse.json({ error: "You cannot initiate a buyer chat with your own listing" }, { status: 400 });
    }

    // Find existing chat room or create new one
    let room = await prisma.chatRoom.findUnique({
      where: {
        listingId_buyerId: {
          listingId: listing.id,
          buyerId: user.id,
        },
      },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          listingId: listing.id,
          buyerId: user.id,
          sellerId: listing.sellerId,
        },
      });

      // Send initial welcome/inquiry message
      await prisma.chatMessage.create({
        data: {
          chatRoomId: room.id,
          senderId: user.id,
          content: `Hi! I'm interested in "${listing.title}". Is it still available?`,
          messageType: "TEXT",
        },
      });
    }

    return NextResponse.json({ success: true, roomId: room.id });
  } catch (error) {
    console.error("Chat room initiation error:", error);
    return NextResponse.json({ error: "Failed to initiate chat room" }, { status: 500 });
  }
}
