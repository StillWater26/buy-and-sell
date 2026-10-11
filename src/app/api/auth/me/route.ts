import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Fetch unread messages count
  const unreadCount = await prisma.chatMessage.count({
    where: {
      chatRoom: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      senderId: { not: user.id },
      isRead: false,
    },
  });

  return NextResponse.json({
    user: {
      ...user,
      unreadCount,
    },
  });
}
