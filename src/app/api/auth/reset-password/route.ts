import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { isStrongPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        {
          error: "Email, OTP and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password does not meet the security requirements.",
        },
        {
          status: 400,
        }
      );
    }

    const record =
      await prisma.passwordResetOTP.findFirst({
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
      await prisma.passwordResetOTP.deleteMany({
        where: {
          userId: record.userId,
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

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: {
        id: record.userId,
      },
      data: {
        passwordHash,
      },
    });

    // Delete every OTP after successful reset
    await prisma.passwordResetOTP.deleteMany({
      where: {
        userId: record.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Password has been reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

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