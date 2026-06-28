'use server';

// Style/mood tags removed from the app.
// This file is kept as a stub in case it's imported anywhere.

export type TagClothingItemInput = {
  photoDataUri: string;
  description: string;
};

export type TagClothingItemOutput = {
  styleTags: string[];
  moodTags: string[];
};

export async function tagClothingItem(_input: TagClothingItemInput): Promise<TagClothingItemOutput> {
  return { styleTags: [], moodTags: [] };
}