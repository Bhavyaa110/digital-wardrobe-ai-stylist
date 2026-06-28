import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '../../database/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const valid = await verifyPassword(password, user.password);
    if (!valid)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('/api/auth/login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}