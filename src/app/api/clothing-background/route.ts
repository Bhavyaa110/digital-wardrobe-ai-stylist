// src/app/api/clothing-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clothingItemBackgroundRemovalFlow } from '../../../ai/flows/clothing-item-background-removal';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await clothingItemBackgroundRemovalFlow(body);
  return NextResponse.json(result);
}
