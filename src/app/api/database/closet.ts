import pool from './db';

export async function getClothingItemsFromDb(userId: string) {
  const [rows] = await pool.execute(
    'SELECT * FROM clothing_items WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  ) as any;

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    color: r.color,
    brand: r.brand,
    season: r.season,
    fabric: r.fabric,
    occasion: r.occasion,
    imageUrl: r.image_url,
    'data-ai-hint': r.data_ai_hint,
    createdAt: r.created_at,
    pinned: !!r.pinned,
  }));
}

export async function createClothingItemInDb(userId: string, payload: any) {
  await pool.execute(
    `INSERT INTO clothing_items
      (user_id, name, category, color, brand, season, fabric, occasion, image_url, data_ai_hint)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      payload.name,
      payload.category,
      payload.color || null,
      payload.brand || null,
      payload.season || null,
      payload.fabric || null,
      payload.occasion || null,
      payload.imageUrl || null,
      payload['data-ai-hint'] || payload.dataAiHint || null,
    ]
  );

  const [rows] = await pool.execute(
    'SELECT id FROM clothing_items WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  ) as any;

  return rows[0].id;
}

export async function deleteClothingItemFromDb(userId: string, itemId: string) {
  await pool.execute(
    'DELETE FROM clothing_items WHERE id = ? AND user_id = ?',
    [itemId, userId]
  );
}

export async function getOutfitsFromDb(userId: string) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, name, occasion, items, pinned, created_at FROM outfits WHERE user_id = ?',
    [userId]
  ) as any;

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    occasion: r.occasion,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
    pinned: !!r.pinned,
    createdAt: r.created_at,
  }));
}

export async function createOutfitInDb(userId: string, payload: any) {
  await pool.execute(
    `INSERT INTO outfits (user_id, name, occasion, items, pinned)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      payload.name,
      payload.occasion || null,
      JSON.stringify(payload.items || []),
      payload.pinned ? 1 : 0,
    ]
  );

  const [rows] = await pool.execute(
    'SELECT id FROM outfits WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  ) as any;

  return rows[0].id;
}

export async function updateOutfitInDb(userId: string, outfitId: string, payload: any) {
  await pool.execute(
    `UPDATE outfits SET name = ?, occasion = ?, items = ?, pinned = ?
     WHERE id = ? AND user_id = ?`,
    [
      payload.name,
      payload.occasion || null,
      JSON.stringify(payload.items || []),
      payload.pinned ? 1 : 0,
      outfitId,
      userId,
    ]
  );
}

export async function deleteOutfitFromDb(userId: string, outfitId: string) {
  await pool.execute(
    'DELETE FROM outfits WHERE id = ? AND user_id = ?',
    [outfitId, userId]
  );
}