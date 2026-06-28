import { NextRequest, NextResponse } from 'next/server';
import { clothingItemBackgroundRemoval } from '../../../ai/flows/clothing-item-background-removal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.photoDataUri) {
      return NextResponse.json({ error: 'photoDataUri is required' }, { status: 400 });
    }

    const result = await clothingItemBackgroundRemoval({ photoDataUri: body.photoDataUri });
    return NextResponse.json(result);
  } catch (error) {
    console.error('clothing-background route error:', error);
    return NextResponse.json({ error: 'Background removal failed' }, { status: 500 });
  }
}