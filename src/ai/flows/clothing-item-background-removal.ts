'use server';
import { ai } from '../genkit'; // Adjust the path if your project exposes ai elsewhere
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

// Define the flow directly
export const clothingItemBackgroundRemovalFlow = ai.defineFlow(
  {
    name: 'clothingItemBackgroundRemovalFlow',
    inputSchema: ClothingItemBackgroundRemovalInputSchema,
    outputSchema: ClothingItemBackgroundRemovalOutputSchema,
  },
  async (input) => {
    // Single AI invocation
    const { media } = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: 'Please remove the background and return the image as a data URI.' },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Extract the processed photo data URI from the response
    const processedPhotoDataUri = media?.url;

    if (!processedPhotoDataUri) {
      throw new Error('AI response did not contain a processed image data URI.');
    }

    return {
      processedPhotoDataUri,
    };
  }
);

export async function clothingItemBackgroundRemoval(input: ClothingItemBackgroundRemovalInput) {
  return await clothingItemBackgroundRemovalFlow(input);
}
