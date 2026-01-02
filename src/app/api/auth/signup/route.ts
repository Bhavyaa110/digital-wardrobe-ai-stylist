import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHmac, randomBytes } from "crypto";
import { connectToDatabase } from "../../database/db";

type SignupRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body: SignupRequest = await req.json().catch(() => ({} as SignupRequest));
    const name = (body.name || "").trim() || null;
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    let pool;
    try {
      pool = await connectToDatabase();
    } catch (err: any) {
      console.error("DB connect (signup):", err);
      return NextResponse.json({ message: "Database connection error." }, { status: 500 });
    }

    // Inspect users table columns to adapt to existing schema
    let columns: string[] = [];
    try {
      const [colsRes]: any = await (pool as any).execute("SHOW COLUMNS FROM users");
      columns = Array.isArray(colsRes) ? colsRes.map((c: any) => c.Field) : [];
    } catch (err: any) {
      console.error("Failed to read users columns:", err);
      // If SHOW COLUMNS fails, bail with helpful message
      return NextResponse.json({ message: "Unable to inspect users table schema.", error: String(err?.message ?? err) }, { status: 500 });
    }

    // Determine password/hash column and optional columns
    const hashCol = columns.includes("password_hash")
      ? "password_hash"
      : columns.includes("password")
      ? "password"
      : null;
    const saltCol = columns.includes("salt") ? "salt" : null;
    const nameCol = columns.includes("name") ? "name" : columns.includes("full_name") ? "full_name" : null;

    if (!columns.includes("email")) {
      return NextResponse.json({ message: "users table missing 'email' column." }, { status: 500 });
    }
    if (!hashCol) {
      return NextResponse.json({ message: "users table missing a password column (password_hash or password)." }, { status: 500 });
    }

    try {
      // Check existing user
      const [rows]: any = await (pool as any).execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
      if (Array.isArray(rows) && rows.length) {
        return NextResponse.json({ message: "Email already registered." }, { status: 409 });
      }

      // Hash password
      const saltRounds = 12;
      const hashed = await bcrypt.hash(password, saltRounds);
      const legacySalt = randomBytes(16).toString("hex");

      // Build insert dynamically based on available columns
      const insertCols = ["email", hashCol];
      const values: any[] = [email, hashed];

      if (saltCol) {
        insertCols.push(saltCol);
        values.push(legacySalt);
      }
      if (nameCol) {
        insertCols.push(nameCol);
        values.push(name);
      }

      const placeholders = insertCols.map(() => "?").join(", ");
      const insertSql = `INSERT INTO users (${insertCols.join(", ")}) VALUES (${placeholders})`;

      const [insertResult]: any = await (pool as any).execute(insertSql, values);
      let userId = insertResult?.insertId ?? null;

      // fallback: select id by email
      if (!userId) {
        try {
          const [res]: any = await (pool as any).execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
          if (Array.isArray(res) && res.length) userId = res[0].id;
        } catch (fallbackErr) {
          console.warn("Fallback fetch id failed:", fallbackErr);
        }
      }

      const jwtSecret = process.env.JWT_SECRET || "dev-secret";
      const token = createHmac("sha256", jwtSecret).update(`${userId ?? "unknown"}:${Date.now()}`).digest("hex");

      return NextResponse.json({ message: "User created", user: { id: userId, email, name }, token }, { status: 201 });
    } catch (err: any) {
      console.error("Signup DB insert error:", err);
      // In dev return columns + sql error for debugging
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            message: "Database error inserting user.",
            error: String(err?.message ?? err),
            code: err?.code,
            sqlMessage: err?.sqlMessage,
            columns,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ message: "Database error inserting user." }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Signup unexpected:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
