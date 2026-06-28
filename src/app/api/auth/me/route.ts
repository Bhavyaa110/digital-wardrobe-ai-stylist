import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserById } from '../../database/user';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer '))
      return NextResponse.json(null, { status: 401 });

    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await getUserById(payload.id);

    if (!user) return NextResponse.json(null, { status: 401 });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}