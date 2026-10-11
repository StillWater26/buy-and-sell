import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const urgency = searchParams.get("urgency");

    const where: any = { status: "OPEN" };
    if (category && category !== "All") where.category = category;
    if (urgency && urgency !== "All") where.urgency = urgency;

    const requests = await prisma.wantedRequest.findMany({
      where,
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            graduationYear: true,
            hostelBlock: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Wanted requests fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch wanted requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, targetBudget, urgency } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 });
    }

    const requestItem = await prisma.wantedRequest.create({
      data: {
        title,
        description,
        category,
        targetBudget: targetBudget ? parseFloat(targetBudget) : null,
        urgency: urgency || "NORMAL",
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            hostelBlock: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, request: requestItem }, { status: 201 });
  } catch (error) {
    console.error("Wanted request create error:", error);
    return NextResponse.json({ error: "Failed to create wanted request" }, { status: 500 });
  }
}
