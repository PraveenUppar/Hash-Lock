import { cookies } from "next/headers";
import { prisma } from "@/lib/db/db";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // 1. Create session in database
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  // 2. Encrypt/Sign the session ID?
  // For a learning project, using the UUID from the DB is fine.
  // In high-security banking apps, we would sign this ID.
  const sessionId = session.id;

  // 3. Set the Cookie
  const cookieStore = await cookies();
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

export async function validateRequest() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    return { user: null, session: null };
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }, // Join user data
  });

  // Check if session exists and hasn't expired
  if (!session || session.expiresAt < new Date()) {
    return { user: null, session: null };
  }

  return { session, user: session.user };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    // Remove from DB
    await prisma.session.deleteMany({
      where: { id: sessionId },
    });
  }

  // Remove cookie
  cookieStore.delete("session_id");
}
