import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db"; // Ensure this path matches your project structure
import { z } from "zod";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/email"; // Import the new helper

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    // SECURITY TIP: Return 200 OK even if user missing to prevent enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // 2. Generate token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 Hour

    // 3. Store token in DB (Clean up old ones first)
    // Using transaction to ensure atomicity is a nice bonus but not strictly required here
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { email } }),
      prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      }),
    ]);

    // 4. Send Email via Resend
    // We don't await this if we want the UI to be fast, but for reliability, we usually await it.
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
