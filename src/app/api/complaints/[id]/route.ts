import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  getOverdueThresholdDays,
  isOverdue,
} from "@/lib/overdue";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET: Fetch a single complaint with access control.
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: {
      id,
    },
    include: {
      resident: {
        select: {
          id: true,
          name: true,
          email: true,
          flatNumber: true,
        },
      },
      history: {
        include: {
          actor: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!complaint) {
    return NextResponse.json(
      { error: "Complaint not found." },
      { status: 404 }
    );
  }

  // Residents can only view their own complaints.
  if (
    user.role === "RESIDENT" &&
    complaint.residentId !== user.id
  ) {
    return NextResponse.json(
      { error: "Not authorized." },
      { status: 403 }
    );
  }

  const thresholdDays =
    await getOverdueThresholdDays();

  return NextResponse.json({
    complaint: {
      ...complaint,
      overdue: isOverdue(
        complaint,
        thresholdDays
      ),
    },
  });
}