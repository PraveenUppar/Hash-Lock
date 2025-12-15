import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Verify User exists AND has a password (OAuth users might not have one)
    if (!user || !user.passwordHash) {
      // Generic error message to prevent enumeration
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const isValid = await verifyPassword(user.passwordHash, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Create Session & Set Cookie
    await createSession(user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
