"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { ClothingItem, Outfit, WeatherInfo } from '../lib/types';

interface WardrobeContextType {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  weatherInfo: WeatherInfo | null;
  setWeatherInfo: (weather: WeatherInfo | null) => void;
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'pinned'>) => void;
  updateClothingItem: (item: ClothingItem) => void;
  removeClothingItem: (itemId: string) => void;
  createOutfit: (outfit: Omit<Outfit, 'id' | 'pinned'>) => void;
  updateOutfit: (outfit: Outfit) => void;
  getOutfitById: (id: string) => Outfit | undefined;
  getClothingItemById: (id: string) => ClothingItem | undefined;
  allStyleTags: string[];
  allMoodTags: string[];
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  // start with empty arrays; we'll load from DB
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);

  // Load from API on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [itemsRes, outfitsRes] = await Promise.all([
          fetch('/api/closet/items').then(r => r.json()),
          fetch('/api/outfits').then(r => r.json()),
        ]);

        if (!mounted) return;

        // itemsRes may be array or {error}
        if (Array.isArray(itemsRes)) {
          // map DB rows to app types
          const mappedItems: ClothingItem[] = itemsRes.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            category: r.category,
            color: r.color ?? '',
            brand: r.brand ?? '',
            season: r.season ?? 'All-Season',
            fabric: r.fabric ?? '',
            occasion: r.occasion ?? 'Casual',
            imageUrl: r.image_url || r.imageUrl || '',
            'data-ai-hint': r.data_ai_hint || r['data-ai-hint'] || '',
            styleTags: r.style_tags || [],
            moodTags: r.mood_tags || [],
            pinned: Boolean(r.pinned),
          }));
          setClothingItems(mappedItems);
        } else {
          console.error('Failed to load clothing items:', itemsRes);
        }

        if (Array.isArray(outfitsRes)) {
          const mappedOutfits: Outfit[] = outfitsRes.map((o: any) => ({
            id: String(o.id),
            name: o.name,
            occasion: o.occasion || 'Casual',
            items: (o.items || []).map((it: any) => ({
              id: String(it.id ?? it.itemId ?? it.id),
              name: it.name ?? '',
              category: it.category ?? 'Tops',
              color: it.color ?? '',
              brand: it.brand ?? '',
              season: it.season ?? 'All-Season',
              fabric: it.fabric ?? '',
              occasion: it.occasion ?? 'Casual',
              imageUrl: it.image_url ?? it.imageUrl ?? '',
              'data-ai-hint': it.data_ai_hint ?? it['data-ai-hint'] ?? '',
              styleTags: it.style_tags ?? it.styleTags ?? [],
              moodTags: it.mood_tags ?? it.moodTags ?? [],
              pinned: Boolean(it.pinned ?? false),
            })),
            pinned: Boolean(o.pinned),
          }));
          setOutfits(mappedOutfits);
        } else {
          console.error('Failed to load outfits:', outfitsRes);
        }
      } catch (err) {
        console.error('Error loading wardrobe data:', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Create item via API and update local state
  const addClothingItem = async (item: Omit<ClothingItem, 'id' | 'pinned'>) => {
    try {
      const body = {
        ...item,
        imageUrl: item.imageUrl,
        'data-ai-hint': (item as any)['data-ai-hint'] || undefined,
        styleTags: item.styleTags || [],
        moodTags: item.moodTags || [],
      };
      const res = await fetch('/api/closet/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data?.item) {
        // map created item to ClothingItem
        const created = data.item;
        const mapped: ClothingItem = {
          id: String(created.id),
          name: created.name,
          category: created.category,
          color: created.color ?? '',
          brand: created.brand ?? '',
          season: created.season ?? 'All-Season',
          fabric: created.fabric ?? '',
          occasion: created.occasion ?? 'Casual',
          imageUrl: created.image_url || created.imageUrl || '',
          'data-ai-hint': created.data_ai_hint || created['data-ai-hint'] || '',
          styleTags: created.style_tags || [],
          moodTags: created.mood_tags || [],
          pinned: Boolean(created.pinned),
        };
        setClothingItems(prev => [mapped, ...prev]);
      } else {
        console.error('Add item failed:', data);
      }
    } catch (err) {
      console.error('Add clothing item error:', err);
    }
  };

  // Create outfit via API
  const createOutfit = async (outfit: Omit<Outfit, 'id' | 'pinned'>) => {
    try {
      const body = {
        name: outfit.name,
        occasion: outfit.occasion,
        items: outfit.items, // send item snapshots (the UI uses full item objects)
      };
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data?.outfit) {
        const created = data.outfit;
        const mapped: Outfit = {
          id: String(created.id),
          name: created.name,
          occasion: created.occasion ?? 'Casual',
          items: (created.items || []).map((it: any) => ({
            id: String(it.id ?? it.itemId ?? it.id),
            name: it.name ?? '',
            category: it.category ?? 'Tops',
            color: it.color ?? '',
            brand: it.brand ?? '',
            season: it.season ?? 'All-Season',
            fabric: it.fabric ?? '',
            occasion: it.occasion ?? 'Casual',
            imageUrl: it.image_url ?? it.imageUrl ?? '',
            'data-ai-hint': it.data_ai_hint ?? it['data-ai-hint'] ?? '',
            styleTags: it.style_tags ?? it.styleTags ?? [],
            moodTags: it.mood_tags ?? it.moodTags ?? [],
            pinned: Boolean(it.pinned ?? false),
          })),
          pinned: Boolean(created.pinned),
        };
        setOutfits(prev => [mapped, ...prev]);
      } else {
        console.error('Create outfit failed:', data);
      }
    } catch (err) {
      console.error('Create outfit error:', err);
    }
  };

  // Local update/delete (TODO: wire to DB PUT/DELETE endpoints as needed)
  const updateClothingItem = (updatedItem: ClothingItem) => {
    setClothingItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeClothingItem = (itemId: string) => {
    setClothingItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateOutfit = (updatedOutfit: Outfit) => {
    setOutfits(prev => prev.map(o => o.id === updatedOutfit.id ? updatedOutfit : o));
  };

  const getOutfitById = (id: string) => outfits.find(o => o.id === id);

  const getClothingItemById = (id: string) => clothingItems.find(c => c.id === id);

  const allStyleTags = React.useMemo(() => {
    const tags = new Set<string>();
    clothingItems.forEach(item => (item.styleTags || []).forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [clothingItems]);

  const allMoodTags = React.useMemo(() => {
    const tags = new Set<string>();
    clothingItems.forEach(item => (item.moodTags || []).forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [clothingItems]);

  return (
    <WardrobeContext.Provider value={{
      clothingItems,
      outfits,
      weatherInfo,
      setWeatherInfo,
      addClothingItem,
      updateClothingItem,
      removeClothingItem,
      createOutfit,
      updateOutfit,
      getOutfitById,
      getClothingItemById,
      allStyleTags,
      allMoodTags
    }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
