import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          error: "Email and OTP are required.",
        },
        {
          status: 400,
        }
      );
    }

    const record =
      await prisma.emailVerificationOTP.findFirst({
        where: {
          email,
          otp,
        },
      });

    if (!record) {
      return NextResponse.json(
        {
          error: "Invalid OTP.",
        },
        {
          status: 400,
        }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "OTP has expired.",
        },
        {
          status: 400,
        }
      );
    }

    if (record.verified) {
      return NextResponse.json({
        success: true,
        message: "Email already verified.",
      });
    }

    await prisma.emailVerificationOTP.update({
      where: {
        id: record.id,
      },
      data: {
        verified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(
      "Verify Register OTP Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}