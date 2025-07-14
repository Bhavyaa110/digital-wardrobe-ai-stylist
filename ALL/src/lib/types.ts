export type Category = 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'Accessories';
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All-Season';
export type Occasion = 'Casual' | 'Formal' | 'Sporty' | 'Work' | 'Party';


export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  brand: string;
  season: Season;
  fabric: string;
  occasion: Occasion;
  imageUrl: string;
  'data-ai-hint'?: string;
  styleTags: string[];
  moodTags: string[];
  pinned: boolean; 
}

export interface Outfit {
  id: string;
  name: string;
  occasion: Occasion;
  items: ClothingItem[];
  imageUrl?: string;
  pinned: boolean;
}

export interface WeatherInfo {
  location: string;
  weather: string;
  temperature: number;
}
