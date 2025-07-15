"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ClothingItem, Outfit, Category, Season, Occasion, WeatherInfo } from '../lib/types';

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

const initialClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: 'Classic White Tee',
    category: 'Tops',
    color: 'White',
    brand: 'Everlane',
    season: 'All-Season',
    fabric: 'Cotton',
    occasion: 'Casual',
    imageUrl: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'white t-shirt',
    styleTags: ['minimalist', 'classic'],
    moodTags: ['relaxed', 'comfortable'],
    pinned: false,
  },
  {
    id: '2',
    name: 'Blue Denim Jeans',
    category: 'Bottoms',
    color: 'Blue',
    brand: 'Levi\'s',
    season: 'All-Season',
    fabric: 'Denim',
    occasion: 'Casual',
    imageUrl: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'blue jeans',
    styleTags: ['streetwear', 'classic'],
    moodTags: ['confident', 'versatile'],
    pinned: false,
  },
  {
    id: '3',
    name: 'Black Leather Jacket',
    category: 'Outerwear',
    color: 'Black',
    brand: 'AllSaints',
    season: 'Autumn',
    fabric: 'Leather',
    occasion: 'Party',
    imageUrl: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'leather jacket',
    styleTags: ['edgy', 'cool'],
    moodTags: ['bold', 'adventurous'],
    pinned: true,
  },
  {
    id: '4',
    name: 'White Sneakers',
    category: 'Footwear',
    color: 'White',
    brand: 'Adidas',
    season: 'All-Season',
    fabric: 'Canvas',
    occasion: 'Casual',
    imageUrl: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'white sneakers',
    styleTags: ['sporty', 'minimalist'],
    moodTags: ['energetic', 'youthful'],
    pinned: false,
  },
];

const initialOutfits: Outfit[] = [
    {
        id: 'o1',
        name: 'Weekend Casual',
        occasion: 'Casual',
        items: [initialClothingItems[0], initialClothingItems[1], initialClothingItems[3]],
        pinned: true,
    },
    {
        id: 'o2',
        name: 'Night Out',
        occasion: 'Party',
        items: [initialClothingItems[2], initialClothingItems[1]],
        pinned: true,
    }
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>(initialClothingItems);
  const [outfits, setOutfits] = useState<Outfit[]>(initialOutfits);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);

  const addClothingItem = (item: Omit<ClothingItem, 'id' | 'pinned'>) => {
    setClothingItems(prev => [...prev, { ...item, id: Date.now().toString(), pinned: false }]);
  };

  const updateClothingItem = (updatedItem: ClothingItem) => {
    setClothingItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeClothingItem = (itemId: string) => {
    setClothingItems(prev => prev.filter(item => item.id !== itemId));
  };

  const createOutfit = (outfit: Omit<Outfit, 'id' | 'pinned'>) => {
    setOutfits(prev => [...prev, { ...outfit, id: Date.now().toString(), pinned: false }]);
  };

  const updateOutfit = (updatedOutfit: Outfit) => {
    setOutfits(prev => prev.map(outfit => outfit.id === updatedOutfit.id ? updatedOutfit : outfit));
  }

  const getOutfitById = (id: string) => outfits.find(o => o.id === id);

  const getClothingItemById = (id: string) => clothingItems.find(c => c.id === id);

  const allStyleTags = React.useMemo(() => {
    const tags = new Set<string>();
    clothingItems.forEach(item => item.styleTags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [clothingItems]);

  const allMoodTags = React.useMemo(() => {
    const tags = new Set<string>();
    clothingItems.forEach(item => item.moodTags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [clothingItems]);


  return (
    <WardrobeContext.Provider value={{ clothingItems, outfits, weatherInfo, setWeatherInfo, addClothingItem, updateClothingItem, removeClothingItem, createOutfit, updateOutfit, getOutfitById, getClothingItemById, allStyleTags, allMoodTags }}>
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
