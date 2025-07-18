import { NextResponse } from 'next/server';
import { createUser } from '../../database/user';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to DB
    const userId = await createUser(name, email, hashedPassword);

    // ✅ Return success
    return NextResponse.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // ⚠️ Handle duplicate email (MySQL code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
