import { NextRequest, NextResponse } from 'next/server';

function smartFallback(clothingItems: any[], occasion: string) {
  const tops = clothingItems.filter((i: any) => i.category === 'Tops');
  const bottoms = clothingItems.filter((i: any) => i.category === 'Bottoms');
  const outerwear = clothingItems.filter((i: any) => i.category === 'Outerwear');
  const footwear = clothingItems.filter((i: any) => i.category === 'Footwear');
  const accessories = clothingItems.filter((i: any) => i.category === 'Accessories');

  if (tops.length === 0 || bottoms.length === 0) {
    return NextResponse.json(
      { error: 'You need at least 1 top and 1 bottom to generate an outfit.' },
      { status: 400 }
    );
  }

  const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
  const pick = (arr: any[], n = 1) => shuffle(arr).slice(0, n);

  const outfits = [];
  const numOutfits = Math.min(3, tops.length * bottoms.length);

  const usedPairs = new Set<string>();
  const shuffledTops = shuffle(tops);
  const shuffledBottoms = shuffle(bottoms);

  for (let i = 0; i < shuffledTops.length && outfits.length < numOutfits; i++) {
    for (let j = 0; j < shuffledBottoms.length && outfits.length < numOutfits; j++) {
      const key = `${shuffledTops[i].id}-${shuffledBottoms[j].id}`;
      if (usedPairs.has(key)) continue;
      usedPairs.add(key);

      const outfit: any[] = [shuffledTops[i], shuffledBottoms[j]];
      if (outerwear.length > 0) outfit.push(pick(outerwear)[0]);
      if (footwear.length > 0) outfit.push(pick(footwear)[0]);
      outfits.push(outfit);
    }
  }

  return NextResponse.json({
    outfits,
    message: `Generated ${outfits.length} outfit suggestion(s) for ${occasion}`,
  });
}

export async function POST(request: NextRequest) {
  let clothingItems: any[], occasion: string, weather: any;

  try {
    const body = await request.json();
    clothingItems = body.clothingItems;
    occasion = body.occasion;
    weather = body.weather;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!clothingItems || clothingItems.length < 2) {
    return NextResponse.json({ error: 'You need at least 2 clothing items.' }, { status: 400 });
  }

  // Filter by occasion
  const occasionItems = clothingItems.filter((item: any) => {
    if (!item.occasion) return true;
    return item.occasion.toLowerCase() === occasion.toLowerCase();
  });

  const tops = occasionItems.filter((i: any) => i.category === 'Tops');
  const bottoms = occasionItems.filter((i: any) => i.category === 'Bottoms');

  if (tops.length === 0 || bottoms.length === 0) {
    const missing = tops.length === 0 && bottoms.length === 0
      ? 'tops or bottoms'
      : tops.length === 0 ? 'tops' : 'bottoms';
    return NextResponse.json(
      {
        error: `No ${occasion} outfits possible — you have no ${missing} for this occasion. Add some ${occasion.toLowerCase()} ${missing} to your closet first.`,
        noItems: true,
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return smartFallback(occasionItems, occasion);

  try {
    const itemList = occasionItems
      .map((item: any, i: number) =>
        `${i + 1}. ${item.name} (${item.category}, ${item.color || ''}, ${item.occasion || ''})`
      )
      .join('\n');

    const prompt = `You are a fashion stylist. Create 3 outfit combinations, each with exactly 1 top + 1 bottom. Optionally add outerwear, footwear, or accessories if available.

Occasion: ${occasion}
Weather: ${weather?.weather || 'mild'}, ${weather?.temperature || 20}°C

Available items:
${itemList}

Rules:
- EVERY outfit must have exactly 1 Top and 1 Bottom
- Optionally include 1 Outerwear, 1 Footwear, or 1 Accessories item
- Use item numbers from the list
- No repeating the same top+bottom pair

Respond ONLY with valid JSON (no markdown):
{"outfits":[{"items":[1,3],"reason":"brief"},{"items":[2,4],"reason":"brief"},{"items":[1,5],"reason":"brief"}]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (response.status === 429) {
      console.warn('Gemini rate limited, using smart fallback');
      return smartFallback(occasionItems, occasion);
    }

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const outfits = parsed.outfits
      .map((o: { items: number[] }) =>
        o.items.map((idx: number) => occasionItems[idx - 1]).filter(Boolean)
      )
      .filter((o: any[]) => {
        // Enforce: must have at least 1 top and 1 bottom
        const hasTop = o.some((i: any) => i.category === 'Tops');
        const hasBottom = o.some((i: any) => i.category === 'Bottoms');
        return hasTop && hasBottom;
      });

    if (outfits.length === 0) return smartFallback(occasionItems, occasion);

    return NextResponse.json({
      outfits,
      message: `Generated ${outfits.length} AI outfit suggestion(s) for ${occasion}`,
    });
  } catch (error: any) {
    console.error('Generate outfit error:', error);
    return smartFallback(occasionItems, occasion);
  }
}