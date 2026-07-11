import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { sendImportantNoticeEmail } from "@/lib/email";

// GET: Anyone logged in can view notices.
// Important notices appear first.
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    const notices = await prisma.notice.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          important: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      notices,
    });
  } catch (error) {
    console.error("GET /api/notices failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load notices.",
      },
      {
        status: 500,
      }
    );
  }
}

// POST: Admin creates a notice.
// Important notices trigger an email to all residents.
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can post notices." },
        { status: 403 }
      );
    }

    const { title, body, important } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        {
          error: "Title and body are required.",
        },
        {
          status: 400,
        }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        body,
        important: Boolean(important),
        createdById: user.id,
      },
    });

    if (notice.important) {
      const residents = await prisma.user.findMany({
        where: {
          role: "RESIDENT",
        },
      });

      console.log("📢 Important notice posted");
      console.log("Residents:", residents.length);

      try {
        const result =
          await sendImportantNoticeEmail(
            residents,
            notice
          );

        console.log(
          "✅ Notice email result:",
          result
        );
      } catch (emailError) {
        console.error(
          "❌ Failed to send notice emails:",
          emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error("POST /api/notices failed:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}