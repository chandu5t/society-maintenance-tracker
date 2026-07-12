import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendEmailVerificationOTP } from "@/lib/email";

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

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // Delete any previous OTPs for this email
    await prisma.emailVerificationOTP.deleteMany({
      where: {
        email,
      },
    });

    // Generate a new OTP
    const otp = generateOTP();

    // Store OTP
    await prisma.emailVerificationOTP.create({
      data: {
        email,
        otp,
        expiresAt: getOTPExpiry(),
      },
    });

    // Send verification email
    await sendEmailVerificationOTP(email, otp);

    return NextResponse.json({
      success: true,
      message:
        "Verification OTP has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "Send Register OTP Error:",
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