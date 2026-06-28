import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '../../database/user';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const existing = await getUserByEmail(email);
    if (existing)
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const id = await createUser(name, email, password);

    return NextResponse.json(
      { message: 'Account created', user: { id, name, email } },
      { status: 201 }
    );
  } catch (err) {
    console.error('/api/auth/signup error:', err);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}