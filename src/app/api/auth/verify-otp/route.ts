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

    const record = await prisma.passwordResetOTP.findFirst({
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
      await prisma.passwordResetOTP.delete({
        where: {
          id: record.id,
        },
      });

      return NextResponse.json(
        {
          error: "OTP has expired.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}