import { NextRequest, NextResponse } from "next/server";
import {
  ComplaintStatus,
  Priority,
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendStatusChangeEmail } from "@/lib/email";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const VALID_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
] as const;

const VALID_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only admins can update complaints." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const body = await req.json();

  const status = body.status as ComplaintStatus | undefined;
  const priority = body.priority as Priority | undefined;
  const note = body.note as string | undefined;

  if (
    status &&
    !VALID_STATUSES.includes(status)
  ) {
    return NextResponse.json(
      { error: "Invalid status." },
      { status: 400 }
    );
  }

  if (
    priority &&
    !VALID_PRIORITIES.includes(priority)
  ) {
    return NextResponse.json(
      { error: "Invalid priority." },
      { status: 400 }
    );
  }

  const complaint = await prisma.complaint.findUnique({
    where: {
      id,
    },
    include: {
      resident: true,
    },
  });

  if (!complaint) {
    return NextResponse.json(
      { error: "Complaint not found." },
      { status: 404 }
    );
  }

  const statusChanged =
    status !== undefined &&
    status !== complaint.currentStatus;

  // Build update object separately to avoid Prisma TS issues
  const updateData: Prisma.ComplaintUpdateInput = {};

  if (status) {
    updateData.currentStatus = status;
  }

  if (priority) {
    updateData.priority = priority;
  }

  if (status === ComplaintStatus.RESOLVED) {
    updateData.resolvedAt = new Date();
  }

  if (statusChanged && status) {
    updateData.history = {
      create: {
        status,
        note: note ?? null,
        actor: {
          connect: {
            id: user.id,
          },
        },
      },
    };
  }

  const updated = await prisma.complaint.update({
    where: {
      id,
    },
    data: updateData,
  });

  // Send email only if status actually changed
  if (statusChanged && status) {
    try {
      console.log("📧 Sending email...");

      const result = await sendStatusChangeEmail(
        complaint.resident,
        complaint,
        status,
        note
      );

      console.log("✅ Email Result:", result);
    } catch (error) {
      console.error("❌ Email Error:", error);
    }
  }

  return NextResponse.json({
    complaint: updated,
  });
}