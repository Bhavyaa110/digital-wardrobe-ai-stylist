import { NextResponse } from 'next/server';
import { createUser } from '../../database/user';
import bcrypt from 'bcryptjs'; // Recommended over 'bcrypt' for Vercel

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to Supabase
    const userId = await createUser(name, email, hashedPassword);

    return NextResponse.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Supabase/PostgreSQL duplicate key error code is '23505'
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
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