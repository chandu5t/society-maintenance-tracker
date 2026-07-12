import prisma from "@/lib/db";
import {
  hashPassword,
  signToken,
  COOKIE_NAME,
} from "@/lib/auth";
import { isStrongPassword } from "@/lib/password";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    name,
    email,
    password,
    flatNumber,
  } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      {
        error:
          "Name, email and password are required.",
      },
      {
        status: 400,
      }
    );
  }

  // Strong password validation
  if (!isStrongPassword(password)) {
    return NextResponse.json(
      {
        error:
          "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.",
      },
      {
        status: 400,
      }
    );
  }

  // Email must be verified before registration
  const verification =
    await prisma.emailVerificationOTP.findFirst({
      where: {
        email,
        verified: true,
      },
    });

  if (!verification) {
    return NextResponse.json(
      {
        error:
          "Please verify your email before registering.",
      },
      {
        status: 400,
      }
    );
  }

  // Verification must still be valid
  if (verification.expiresAt < new Date()) {
    return NextResponse.json(
      {
        error:
          "Email verification has expired. Please verify your email again.",
      },
      {
        status: 400,
      }
    );
  }

  // Check if account already exists
  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
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

  const passwordHash =
    await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      flatNumber,
      role: "RESIDENT",
    },
  });

  // Cleanup verification record
  await prisma.emailVerificationOTP.deleteMany({
    where: {
      email,
    },
  });

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}