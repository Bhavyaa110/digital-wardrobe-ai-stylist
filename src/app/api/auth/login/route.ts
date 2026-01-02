// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { getUserByEmail } from "../../database/user";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    // 1. Fetch user from Supabase
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    // 2. Compare passwords using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    // 3. Generate token (using your original HMAC logic)
    const jwtSecret = process.env.JWT_SECRET || "dev-secret";
    const token = createHmac("sha256", jwtSecret)
      .update(`${user.id}:${Date.now()}`)
      .digest("hex");

    return NextResponse.json({ 
        message: "Login successful", 
        user: { 
            id: user.id, 
            email: user.email, 
            name: user.name 
        }, 
        token 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Login unexpected error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}