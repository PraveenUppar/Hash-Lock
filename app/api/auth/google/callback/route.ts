import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { createSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // 1. Swap Code for Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("Failed to retrieve access token");
    }

    // 2. Get User Profile from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const googleUser = await userResponse.json();
    // googleUser has: id, email, name, picture

    // 3. Check if user exists in our DB
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    // 4. If user exists, link the account (if not already linked)
    // If user does not exist, create them
    if (user) {
      // Check if Google link exists
      const account = await prisma.account.findUnique({
        where: {
          provider_providerId: {
            provider: "google",
            providerId: googleUser.id,
          },
        },
      });

      if (!account) {
        await prisma.account.create({
          data: {
            userId: user.id,
            provider: "google",
            providerId: googleUser.id,
          },
        });
      }
    } else {
      // Create new User AND Account
      // Note: passwordHash is null because they used Google
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          isVerified: true, // Google verified this email for us
          accounts: {
            create: {
              provider: "google",
              providerId: googleUser.id,
            },
          },
        },
      });
    }

    // 5. Create Session (Log them in)
    await createSession(user.id);

    // 6. Redirect to Dashboard
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    );
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_failed`
    );
  }
}
