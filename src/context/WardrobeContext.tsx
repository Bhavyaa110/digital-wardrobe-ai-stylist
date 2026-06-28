"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ClothingItem, Outfit } from '../lib/types';

interface WeatherInfo {
  location: string;
  weather: string;
  temperature: number;
}

interface WardrobeContextType {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  weatherInfo: WeatherInfo | null;
  isLoading: boolean;
  setWeatherInfo: (info: WeatherInfo | null) => void;
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<void>;
  removeClothingItem: (id: string) => Promise<void>;
  updateClothingItem: (id: string, updates: Partial<ClothingItem>) => void;
  createOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => Promise<void>;
  updateOutfit: (outfit: Outfit) => Promise<void>;
  refreshItems: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fitzy_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshItems = useCallback(async () => {
    try {
      const res = await fetch('/api/closet/items', { headers: getAuthHeaders() });
      if (res.ok) setClothingItems(await res.json());
    } catch (err) {
      console.error('Failed to fetch clothing items:', err);
    }
  }, []);

  const refreshOutfits = useCallback(async () => {
    try {
      const res = await fetch('/api/outfits', { headers: getAuthHeaders() });
      if (res.ok) setOutfits(await res.json());
    } catch (err) {
      console.error('Failed to fetch outfits:', err);
    }
  }, []);

  useEffect(() => {
    refreshItems();
    refreshOutfits();

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) return;
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`);
        if (res.ok) {
          const data = await res.json();
          setWeatherInfo({
            location: `${data.location.name}, ${data.location.region}`,
            weather: data.current.condition.text,
            temperature: data.current.temp_c,
          });
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    };

    const fetchWeatherByIp = async () => {
  try {
    const res = await fetch('http://ip-api.com/json/');
    const data = await res.json();
    if (data.lat && data.lon) {
      await fetchWeather(data.lat, data.lon);
    } else {
      await fetchWeather(28.6139, 77.2090);
    }
  } catch {
    await fetchWeather(28.6139, 77.2090);
  }
};
    fetchWeatherByIp();
  }, [refreshItems, refreshOutfits]);

  const addClothingItem = async (itemData: Omit<ClothingItem, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/closet/items', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add item');
      await refreshItems();
    } finally {
      setIsLoading(false);
    }
  };

  const removeClothingItem = async (id: string) => {
    setClothingItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/closet/items?id=${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } catch (err) {
      console.error('Failed to delete item:', err);
      await refreshItems();
    }
  };

  const updateClothingItem = (id: string, updates: Partial<ClothingItem>) => {
    setClothingItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const createOutfit = async (outfitData: Omit<Outfit, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(outfitData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save outfit');
      await refreshOutfits();
    } finally {
      setIsLoading(false);
    }
  };

  const updateOutfit = async (outfit: Outfit) => {
    setOutfits((prev) => prev.map((o) => (o.id === outfit.id ? outfit : o)));
    try {
      await fetch(`/api/outfits?id=${outfit.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(outfit),
      });
    } catch (err) {
      console.error('Failed to update outfit:', err);
      await refreshOutfits();
    }
  };

  return (
    <WardrobeContext.Provider value={{
      clothingItems,
      outfits,
      weatherInfo,
      isLoading,
      setWeatherInfo,
      addClothingItem,
      removeClothingItem,
      updateClothingItem,
      createOutfit,
      updateOutfit,
      refreshItems,
      refreshOutfits,
    }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) throw new Error('useWardrobe must be used within WardrobeProvider');
  return context;
}
