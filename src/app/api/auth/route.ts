import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET!;
const APP_PASSWORD = process.env.APP_PASSWORD!;

function createToken(): string {
  const payload = Date.now().toString();
  const signature = createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, action } = body;

  if (action === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (!password || password !== APP_PASSWORD) {
    return NextResponse.json(
      { error: "Falsches Passwort" },
      { status: 401 }
    );
  }

  const token = createToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
