import { connectToDatabase } from './db';
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export type ClothingItemRow = {
  id: number;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  fabric: string | null;
  occasion: string | null;
  image_url: string | null;
  data_ai_hint: string | null;
  style_tags: string | null; // JSON string in DB
  mood_tags: string | null;  // JSON string in DB
  pinned: number;
  created_at: string;
};

export async function getClothingItemsFromDb() {
  const pool = await connectToDatabase();
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM clothing_items ORDER BY created_at DESC');
  return (rows as ClothingItemRow[]).map(r => ({
    ...r,
    style_tags: r.style_tags ? JSON.parse(r.style_tags) : [],
    mood_tags: r.mood_tags ? JSON.parse(r.mood_tags) : [],
  }));
}

export async function createClothingItemInDb(payload: {
  name: string;
  category: string;
  color?: string;
  brand?: string;
  season?: string;
  fabric?: string;
  occasion?: string;
  imageUrl?: string;
  dataAiHint?: string;
  styleTags?: string[];
  moodTags?: string[];
}) {
  const pool = await connectToDatabase();
  const q = `INSERT INTO clothing_items 
    (name, category, color, brand, season, fabric, occasion, image_url, data_ai_hint, style_tags, mood_tags, pinned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const styleTagsJson = JSON.stringify(payload.styleTags || []);
  const moodTagsJson = JSON.stringify(payload.moodTags || []);
  const [result] = await pool.execute<OkPacket>(q, [
    payload.name,
    payload.category,
    payload.color || null,
    payload.brand || null,
    payload.season || null,
    payload.fabric || null,
    payload.occasion || null,
    payload.imageUrl || null,
    payload.dataAiHint || null,
    styleTagsJson,
    moodTagsJson,
    0,
  ]);
  return (result as OkPacket).insertId;
}

export type OutfitRow = {
  id: number;
  name: string;
  occasion: string | null;
  items: string; // JSON
  pinned: number;
  created_at: string;
};

export async function getOutfitsFromDb() {
  const pool = await connectToDatabase();
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM outfits ORDER BY created_at DESC');
  return (rows as OutfitRow[]).map(r => ({
    ...r,
    items: JSON.parse(r.items || '[]'),
  }));
}

export async function createOutfitInDb(payload: {
  name: string;
  occasion?: string;
  items: any[]; // array of item snapshots or ids
}) {
  const pool = await connectToDatabase();
  const q = `INSERT INTO outfits (name, occasion, items, pinned) VALUES (?, ?, ?, ?)`;
  const itemsJson = JSON.stringify(payload.items || []);
  const [result] = await pool.execute<OkPacket>(q, [payload.name, payload.occasion || null, itemsJson, 0]);
  return (result as OkPacket).insertId;
}
