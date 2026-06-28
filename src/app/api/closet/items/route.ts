import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  getClothingItemsFromDb,
  createClothingItemInDb,
  deleteClothingItemFromDb,
} from '../../database/closet';

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
    const items = await getClothingItemsFromDb(userId);
    return NextResponse.json(items);
  } catch (err) {
    console.error('/api/closet/items GET error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.name || !body.category)
      return NextResponse.json({ error: 'name and category are required' }, { status: 400 });

    const id = await createClothingItemInDb(userId, body);
    const items = await getClothingItemsFromDb(userId);
    const created = items.find((i: any) => i.id === id) || null;
    return NextResponse.json({ id, item: created }, { status: 201 });
  } catch (err) {
    console.error('/api/closet/items POST error:', err);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Item id is required' }, { status: 400 });

    await deleteClothingItemFromDb(userId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('/api/closet/items DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}