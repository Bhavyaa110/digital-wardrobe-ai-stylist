import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getOutfitsFromDb,
  createOutfitInDb,
  deleteOutfitFromDb,
  updateOutfitInDb,
} from '../database/closet';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

function getUserId(request: NextRequest): string | null {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json([], { status: 200 });

  try {
    const outfits = await getOutfitsFromDb(userId);
    return NextResponse.json(outfits);
  } catch (err) {
    console.error('/api/outfits GET error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.name || !Array.isArray(body.items))
      return NextResponse.json({ error: 'name and items[] are required' }, { status: 400 });

    const id = await createOutfitInDb(userId, body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('/api/outfits POST error:', err);
    return NextResponse.json({ error: 'Failed to create outfit' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Outfit id is required' }, { status: 400 });

    const body = await request.json();
    await updateOutfitInDb(userId, id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('/api/outfits PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update outfit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Outfit id is required' }, { status: 400 });

    await deleteOutfitFromDb(userId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('/api/outfits DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete outfit' }, { status: 500 });
  }
}