'use server';
import { z } from 'zod';

const ClothingItemBackgroundRemovalInputSchema = z.object({
  photoDataUri: z.string().describe(
    "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding."
  ),
});

const ClothingItemBackgroundRemovalOutputSchema = z.object({
  processedPhotoDataUri: z.string().describe(
    'The background-removed image, as a data URI.'
  ),
});

export type ClothingItemBackgroundRemovalInput = z.infer<typeof ClothingItemBackgroundRemovalInputSchema>;
export type ClothingItemBackgroundRemovalOutput = z.infer<typeof ClothingItemBackgroundRemovalOutputSchema>;

export async function clothingItemBackgroundRemoval(input: ClothingItemBackgroundRemovalInput): Promise<ClothingItemBackgroundRemovalOutput> {
  try {
    console.log('Starting background removal...');
    
    // Convert data URI to base64 string
    const base64Data = input.photoDataUri.split(',')[1];
    const mimeType = input.photoDataUri.match(/data:([^;]+);/)?.[1] || 'image/png';
    
    // Create form data
    const formData = new FormData();
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    formData.append('image_file', blob);
    formData.append('size', 'auto');

    const apiKey = process.env.REMOVE_BG_API_KEY;
    
    if (!apiKey) {
      console.error('REMOVE_BG_API_KEY not found in environment variables');
      throw new Error('API key not configured');
    }

    console.log('Calling remove.bg API...');
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    console.log('Background removal successful');
    
    // Get the result as blob
    const resultBlob = await response.blob();
    
    // Convert blob to data URI
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    return {
      processedPhotoDataUri: dataUri,
    };
  } catch (error) {
    console.error('Background removal error:', error);
    // Return original image as fallback
    return {
      processedPhotoDataUri: input.photoDataUri,
    };
  }
}
