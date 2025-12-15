import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { signupSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate Input
    const { email, password } = signupSchema.parse(body);

    // 2. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // SECURITY TIP: Don't reveal if the email exists.
      // Say "Registration failed" or generic message to prevent User Enumeration attacks.
      // But for dev/UX balance, we often return 409 Conflict.
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await hashPassword(password);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
      // Select only safe fields to return (never return the password hash!)
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
