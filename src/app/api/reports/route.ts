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
    const { listingId, reason, details } = body;

    if (!reason) {
      return NextResponse.json({ error: "Report reason is required" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId: listingId || null,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    console.error("Report creation error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            seller: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Admin reports fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, deleteListing } = body;

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: { listing: true },
    });

    if (deleteListing && report.listingId) {
      await prisma.listing.delete({ where: { id: report.listingId } });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report status update error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
