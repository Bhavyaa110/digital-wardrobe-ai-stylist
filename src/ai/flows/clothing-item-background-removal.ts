'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClothingItemBackgroundRemovalInputSchema = z.object({
  photoDataUri: z.string().describe(
    "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
  ),
});
export type ClothingItemBackgroundRemovalInput = z.infer<typeof ClothingItemBackgroundRemovalInputSchema>;

const ClothingItemBackgroundRemovalOutputSchema = z.object({
  processedPhotoDataUri: z.string().describe(
    'A photo of the clothing item with the background removed, as a data URI.'
  ),
});
export type ClothingItemBackgroundRemovalOutput = z.infer<typeof ClothingItemBackgroundRemovalOutputSchema>;

export async function clothingItemBackgroundRemoval(
  input: ClothingItemBackgroundRemovalInput
): Promise<ClothingItemBackgroundRemovalOutput> {
  return clothingItemBackgroundRemovalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clothingItemBackgroundRemovalPrompt',
  input: { schema: ClothingItemBackgroundRemovalInputSchema },
  output: { schema: ClothingItemBackgroundRemovalOutputSchema },
  prompt: [
    { media: { url: '{{{photoDataUri}}}' } },
    {
      text: 'Please remove the background from this image of a clothing item and return the image as a data URI.',
    },
  ],
  model: 'googleai/gemini-2.0-flash-preview-image-generation',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const clothingItemBackgroundRemovalFlow = ai.defineFlow(
  {
    name: 'clothingItemBackgroundRemovalFlow',
    inputSchema: ClothingItemBackgroundRemovalInputSchema,
    outputSchema: ClothingItemBackgroundRemovalOutputSchema,
  },
  async (input) => {
    const result = await ai.generate(prompt(input));

    if (!result?.output?.processedPhotoDataUri) {
      throw new Error('AI response did not contain processedPhotoDataUri');
    }

    return {
      processedPhotoDataUri: result.output.processedPhotoDataUri,
    };
  }
);
