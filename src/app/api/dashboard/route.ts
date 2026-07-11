import { NextResponse } from "next/server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getOverdueThresholdDays } from "@/lib/overdue";

// GET: Dashboard statistics (Admin only)
export async function GET() {
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

  const [byStatusRaw, byCategoryRaw, all] = await Promise.all([
    prisma.complaint.groupBy({
      by: ["currentStatus"],
      _count: {
        _all: true,
      },
    }),

    prisma.complaint.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
    }),

    prisma.complaint.findMany({
      select: {
        currentStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const thresholdDays = await getOverdueThresholdDays();

  const overdueCount = all.filter(
  (complaint: (typeof all)[number]) => {
    if (complaint.currentStatus === "RESOLVED") {
      return false;
    }

    const ageDays =
      (Date.now() - new Date(complaint.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);

    return ageDays > thresholdDays;
  }).length;

  const byStatus = Object.fromEntries(
    byStatusRaw.map(
    (row: (typeof byStatusRaw)[number]) => [
      row.currentStatus,
      row._count._all,
    ])
  );

  const byCategory = Object.fromEntries(
    byCategoryRaw.map(
    (row: (typeof byCategoryRaw)[number]) => [
      row.category,
      row._count._all,
    ])
  );

  return NextResponse.json({
    total: all.length,
    byStatus,
    byCategory,
    overdueCount,
    thresholdDays,
  });
}