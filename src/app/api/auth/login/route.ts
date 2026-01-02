import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { connectToDatabase } from "../../database/db";

type LoginRequest = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body: LoginRequest = await req.json().catch(() => ({} as LoginRequest));
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    let pool;
    try {
      pool = await connectToDatabase();
    } catch (err: any) {
      console.error("DB connect (login):", err);
      return NextResponse.json({ message: "Database connection error." }, { status: 500 });
    }

    // inspect columns
    let columns: string[] = [];
    try {
      const [colsRes]: any = await (pool as any).execute("SHOW COLUMNS FROM users");
      columns = Array.isArray(colsRes) ? colsRes.map((c: any) => c.Field) : [];
    } catch (err: any) {
      console.error("Failed to read users columns (login):", err);
      return NextResponse.json({ message: "Unable to inspect users table schema.", error: String(err?.message ?? err) }, { status: 500 });
    }

    const hashCol = columns.includes("password_hash")
      ? "password_hash"
      : columns.includes("password")
      ? "password"
      : null;
    const nameCol = columns.includes("name") ? "name" : columns.includes("full_name") ? "full_name" : null;

    if (!columns.includes("email") || !hashCol) {
      return NextResponse.json({ message: "users table missing required columns." }, { status: 500 });
    }

    try {
      // select relevant columns; alias hash column as password_hash_alias for uniform handling
      const selCols = ["id", "email", ...(nameCol ? [nameCol] : []), `${hashCol} AS password_hash_alias`].join(", ");
      const sql = `SELECT ${selCols} FROM users WHERE email = ? LIMIT 1`;
      const [rows]: any = await (pool as any).execute(sql, [email]);
      const user = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (!user) {
        return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
      }

      const storedHash = user.password_hash_alias;
      if (!storedHash) {
        return NextResponse.json({ message: "User record has no password hash." }, { status: 500 });
      }

      const match = await bcrypt.compare(password, storedHash);
      if (!match) {
        return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
      }

      const jwtSecret = process.env.JWT_SECRET || "dev-secret";
      const token = createHmac("sha256", jwtSecret).update(`${user.id}:${Date.now()}`).digest("hex");

      const userName = nameCol ? user[nameCol] : null;
      return NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email, name: userName }, token }, { status: 200 });
    } catch (err: any) {
      console.error("Login DB error:", err);
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({ message: "Database error during login.", error: String(err?.message ?? err), code: err?.code, sqlMessage: err?.sqlMessage, columns }, { status: 500 });
      }
      return NextResponse.json({ message: "Database error during login." }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Login unexpected:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
