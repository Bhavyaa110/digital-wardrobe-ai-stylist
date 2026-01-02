import { NextResponse } from 'next/server';
import { getClothingItemsFromDb, createClothingItemInDb } from '../../database/closet';

export async function GET() {
  try {
    const rows = await getClothingItemsFromDb();
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error('/api/closet/items GET error', err);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Missing required fields: name, category' }, { status: 400 });
    }
    const insertId = await createClothingItemInDb({
      name: body.name,
      category: body.category,
      color: body.color,
      brand: body.brand,
      season: body.season,
      fabric: body.fabric,
      occasion: body.occasion,
      imageUrl: body.imageUrl,
      dataAiHint: body['data-ai-hint'] || body.dataAiHint,
      styleTags: body.styleTags || [],
      moodTags: body.moodTags || [],
    });
    const rows = await getClothingItemsFromDb();
    const created = rows.find(r => r.id === insertId) || null;
    return NextResponse.json({ id: insertId, item: created }, { status: 201 });
  } catch (err) {
    console.error('/api/closet/items POST error', err);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
