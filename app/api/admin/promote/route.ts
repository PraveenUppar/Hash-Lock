import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/db";
import { z } from "zod";

const promoteSchema = z.object({
  targetUserId: z.string(),
});

export async function POST(request: Request) {
  // 1. Auth Check
  const { user } = await validateRequest();

  // 2. Role Check (The Gatekeeper)
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { targetUserId } = promoteSchema.parse(body);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
