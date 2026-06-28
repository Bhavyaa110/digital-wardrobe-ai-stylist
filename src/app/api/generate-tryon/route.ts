import { NextRequest, NextResponse } from 'next/server';

function dataUriToPart(dataUri: string) {
  const mimeType = dataUri.match(/data:([^;]+);/)?.[1] ?? 'image/jpeg';
  const base64 = dataUri.split(',')[1];
  return { inline_data: { mime_type: mimeType, data: base64 } };
}

async function urlToPart(url: string) {
  if (url.startsWith('data:')) return dataUriToPart(url);
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = res.headers.get('content-type') || 'image/jpeg';
  return { inline_data: { mime_type: mimeType, data: base64 } };
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const {
      topName, bottomName,
      topImage, bottomImage,
      topColor, bottomColor,
      topFabric, bottomFabric,
    } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const parts: any[] = [];

        if (topImage) {
          parts.push({ text: 'Top clothing item — replicate exact color, pattern, design:' });
          parts.push(await urlToPart(topImage));
        }
        if (bottomImage) {
          parts.push({ text: 'Bottom clothing item — replicate exact color, pattern, design:' });
          parts.push(await urlToPart(bottomImage));
        }

        const topDesc = [topColor, topFabric, topName].filter(Boolean).join(' ');
        const bottomDesc = [bottomColor, bottomFabric, bottomName].filter(Boolean).join(' ');

        parts.push({
          text: `Generate a realistic full-body fashion photograph of a model wearing:
- TOP: ${topDesc} — match the EXACT color, pattern, and design from the reference image
- BOTTOM: ${bottomDesc} — match the EXACT color, pattern, and design from the reference image

Requirements:
- Professional studio photography, white/light grey background
- Full body shot, centered, standing pose
- Clothing must exactly match the colors and designs from reference images
- Photorealistic, high quality
- Natural fit and draping
- No text, no watermarks, no extra people`,
        });

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
          if (imagePart?.inlineData) {
            const { mime_type, data: imgData } = imagePart.inlineData;
            return NextResponse.json({
              imageUrl: `data:${mime_type};base64,${imgData}`,
              message: 'AI try-on generated with color & design matching',
            });
          }
        }
        console.warn('Gemini image gen failed, status:', response.status);
      } catch (err) {
        console.error('Gemini try-on error:', err);
      }
    }

    // HuggingFace fallback
    if (!process.env.HUGGINGFACE_API_TOKEN) {
      return NextResponse.json({ error: 'No AI generation configured.' }, { status: 503 });
    }

    const { HfInference } = await import('@huggingface/inference');
    const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

    const topDesc = [topColor, topFabric, topName].filter(Boolean).join(' ');
    const bottomDesc = [bottomColor, bottomFabric, bottomName].filter(Boolean).join(' ');

    const imageBlob = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: `full body professional fashion model, wearing a ${topDesc} top and ${bottomDesc} bottom, exact colors as described, studio white background, photorealistic, 8k`,
      parameters: {
        negative_prompt: 'wrong colors, blurry, low quality, cartoon, watermark, text',
        width: 768,
        height: 1024,
        num_inference_steps: 50,
        guidance_scale: 9.0,
      },
    });

    const base64 = await blobToBase64(imageBlob as unknown as Blob);

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64}`,
      message: 'AI try-on generated',
    });

  } catch (error: any) {
    console.error('Try-on generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI try-on' }, { status: 500 });
  }
}