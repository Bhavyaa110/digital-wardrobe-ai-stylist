import { ai } from '@genkit-ai/core';
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
    // Use ai.invoke (or ai.run) for AI model request
    const result = await ai.invoke({
      model: 'googleai/gemini-pro-vision',
      input: [
        { media: { url: input.photoDataUri } },
        { text: 'Please remove the background and return the image as a data URI.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!result?.output?.processedPhotoDataUri) {
      throw new Error('AI response did not contain processedPhotoDataUri');
    }

    return {
      processedPhotoDataUri: result.output.processedPhotoDataUri,
    };
  }
);

export async function clothingItemBackgroundRemoval(input: ClothingItemBackgroundRemovalInput) {
  return await clothingItemBackgroundRemovalFlow(input);
}
