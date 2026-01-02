import { supabase } from '../../../lib/supabase';

export async function getClothingItemsFromDb() {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createClothingItemInDb(payload: any) {
  const { data, error } = await supabase
    .from('clothing_items')
    .insert([{
      name: payload.name,
      category: payload.category,
      color: payload.color,
      brand: payload.brand,
      season: payload.season,
      fabric: payload.fabric,
      occasion: payload.occasion,
      image_url: payload.imageUrl,
      data_ai_hint: payload.dataAiHint,
      style_tags: payload.styleTags || [],
      mood_tags: payload.moodTags || [],
      pinned: false
    }])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getOutfitsFromDb() {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOutfitInDb(payload: any) {
  const { data, error } = await supabase
    .from('outfits')
    .insert([{
      name: payload.name,
      occasion: payload.occasion,
      items: payload.items || [],
      pinned: false
    }])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}