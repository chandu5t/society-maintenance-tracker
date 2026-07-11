import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { uploadPhoto } from "@/lib/upload";
import {
  getOverdueThresholdDays,
  annotateAndSortByOverdue,
} from "@/lib/overdue";

// GET: List complaints
export async function GET(req: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: {
    residentId?: string;
    category?: string;
    currentStatus?: string;
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  } = {};

  if (user.role === "RESIDENT") {
    where.residentId = user.id;
  }

  if (category) {
    where.category = category;
  }

  if (status) {
    where.currentStatus = status;
  }

  if (from || to) {
    where.createdAt = {};

    if (from) {
      where.createdAt.gte = new Date(from);
    }

    if (to) {
      where.createdAt.lte = new Date(to);
    }
  }

  const complaints = await prisma.complaint.findMany({
    where,
    include: {
      resident: {
        select: {
          name: true,
          email: true,
          flatNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const thresholdDays = await getOverdueThresholdDays();

  const withOverdue =
    user.role === "ADMIN"
      ? annotateAndSortByOverdue(complaints, thresholdDays)
      : complaints.map(
          (
            complaint: (typeof complaints)[number]
          ) => ({
            ...complaint,
            overdue: false,
          })
        );

  return NextResponse.json({
    complaints: withOverdue,
    thresholdDays,
  });
}

// POST: Resident raises a complaint
export async function POST(req: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in." },
      { status: 401 }
    );
  }

  if (user.role !== "RESIDENT") {
    return NextResponse.json(
      { error: "Only residents can raise complaints." },
      { status: 403 }
    );
  }

  const formData = await req.formData();

  const category = formData.get("category") as string | null;
  const description = formData.get("description") as string | null;
  const photo = formData.get("photo") as File | null;

  if (!category || !description) {
    return NextResponse.json(
      {
        error: "Category and description are required.",
      },
      {
        status: 400,
      }
    );
  }

  let photoUrl: string | null = null;

  if (photo && photo.size > 0) {
    photoUrl = await uploadPhoto(photo);
  }

  const complaint = await prisma.complaint.create({
    data: {
      category,
      description,
      photoUrl,
      residentId: user.id,
      history: {
        create: {
          status: "OPEN",
          actorId: user.id,
          note: "Complaint raised.",
        },
      },
    },
  });

  return NextResponse.json({
    complaint,
  });
}