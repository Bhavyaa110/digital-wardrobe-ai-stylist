import { NextResponse } from 'next/server';
import { getOutfitsFromDb, createOutfitInDb } from '../database/closet';

export async function GET() {
  try {
    const rows = await getOutfitsFromDb();
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error('/api/outfits GET error', err);
    return NextResponse.json({ error: 'Failed to fetch outfits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.name || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Missing required fields: name, items(array)' }, { status: 400 });
    }
    const insertId = await createOutfitInDb({
      name: body.name,
      occasion: body.occasion,
      items: body.items,
    });
    const rows = await getOutfitsFromDb();
    const created = rows.find(r => r.id === insertId) || null;
    return NextResponse.json({ id: insertId, outfit: created }, { status: 201 });
  } catch (err) {
    console.error('/api/outfits POST error', err);
    return NextResponse.json({ error: 'Failed to create outfit' }, { status: 500 });
  }
}
