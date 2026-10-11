import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        listing: {
          include: { images: true },
        },
        buyer: true,
        seller: true,
        offers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!room || (room.buyerId !== user.id && room.sellerId !== user.id)) {
      return NextResponse.json({ error: "Room not found or access denied" }, { status: 404 });
    }

    // Mark messages from other user as read
    await prisma.chatMessage.updateMany({
      where: {
        chatRoomId: roomId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      room,
      messages,
      currentUserRole: room.sellerId === user.id ? "SELLER" : "BUYER",
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const body = await req.json();
    const { content, messageType = "TEXT" } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || (room.buyerId !== user.id && room.sellerId !== user.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId: roomId,
        senderId: user.id,
        content: content.trim(),
        messageType,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Update room's lastMessageAt
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
