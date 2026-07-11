import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendPasswordResetOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Don't reveal whether an email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, an OTP has been sent.",
      });
    }

    // Delete previous OTPs
    await prisma.passwordResetOTP.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const otp = generateOTP();

    await prisma.passwordResetOTP.create({
      data: {
        email: user.email,
        otp,
        userId: user.id,
        expiresAt: getOTPExpiry(),
      },
    });

    await sendPasswordResetOTPEmail(
      user.email,
      user.name,
      otp
    );

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

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