import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// PATCH: Update overdue threshold (Admin only)
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admins only." },
      { status: 403 }
    );
  }

  const { overdueThresholdDays } = await req.json();

  const value = Number(overdueThresholdDays);

  if (!Number.isFinite(value) || value < 1) {
    return NextResponse.json(
      {
        error: "Threshold must be a positive number of days.",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.setting.upsert({
    where: {
      key: "OVERDUE_THRESHOLD_DAYS",
    },
    update: {
      value: String(value),
    },
    create: {
      key: "OVERDUE_THRESHOLD_DAYS",
      value: String(value),
    },
  });

  return NextResponse.json({
    ok: true,
    overdueThresholdDays: value,
  });
}