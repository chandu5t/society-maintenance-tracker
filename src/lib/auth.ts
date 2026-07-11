import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-change-me";

export const COOKIE_NAME = "smt_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RESIDENT";
}

export async function hashPassword(
  plain: string
): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(
  token: string
): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (err) {
    console.error("JWT verify failed:");
    console.error(err);
    console.error("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    return null;
  }
}
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();

  const token = store.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}