import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chatRoomId, listingId, amount } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: "A valid positive offer amount is required" }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { listing: true },
    });

    if (!room || room.buyerId !== user.id) {
      return NextResponse.json({ error: "Only the prospective buyer can make an offer" }, { status: 403 });
    }

    const offer = await prisma.offer.create({
      data: {
        chatRoomId,
        listingId,
        buyerId: user.id,
        amount: parsedAmount,
        status: "PENDING",
      },
    });

    // Create proposal notification in chat
    const chatMsg = await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: user.id,
        content: `Made an offer of ₹${parsedAmount.toFixed(0)} (Original Price: ₹${room.listing.price})`,
        messageType: "OFFER_PROPOSAL",
      },
    });

    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ success: true, offer, message: chatMsg });
  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json({ error: "Failed to submit offer" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offerId, status } = body; // "ACCEPTED" | "DECLINED"

    if (!offerId || !["ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Valid offerId and status are required" }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        listing: true,
        chatRoom: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.listing.sellerId !== user.id) {
      return NextResponse.json({ error: "Only the seller can accept or decline offers" }, { status: 403 });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: { status },
    });

    let systemText = "";

    if (status === "ACCEPTED") {
      // Mark listing as RESERVED
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: "RESERVED" },
      });

      systemText = `🎉 Offer of ₹${offer.amount.toFixed(0)} was ACCEPTED! The item is now RESERVED. Please coordinate the campus meetup spot and payment (cash or UPI).`;
    } else {
      systemText = `Offer of ₹${offer.amount.toFixed(0)} was declined by seller.`;
    }

    const chatMsg = await prisma.chatMessage.create({
      data: {
        chatRoomId: offer.chatRoomId,
        senderId: user.id,
        content: systemText,
        messageType: status === "ACCEPTED" ? "OFFER_ACCEPTED" : "SYSTEM",
      },
    });

    await prisma.chatRoom.update({
      where: { id: offer.chatRoomId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ success: true, offer: updatedOffer, message: chatMsg });
  } catch (error) {
    console.error("Offer update error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}
