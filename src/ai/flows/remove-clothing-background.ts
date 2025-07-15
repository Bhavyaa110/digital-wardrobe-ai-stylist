'use server';

/**
 * @fileOverview AI agent to remove the background from a clothing item image.
 *
 * - removeClothingBackground - A function that handles the background removal process.
 * - RemoveClothingBackgroundInput - The input type for the removeClothingBackground function.
 * - RemoveClothingBackgroundOutput - The return type for the removeClothingBackground function.
 */
import { ai } from '../genkit'; // Adjust the path as needed
import { z } from 'genkit';

const RemoveClothingBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveClothingBackgroundInput = z.infer<
  typeof RemoveClothingBackgroundInputSchema
>;

const RemoveClothingBackgroundOutputSchema = z.object({
  processedPhotoDataUri: z
    .string()
    .describe(
      'A photo of the clothing item with the background removed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type RemoveClothingBackgroundOutput = z.infer<
  typeof RemoveClothingBackgroundOutputSchema
>;

export async function removeClothingBackground(
  input: RemoveClothingBackgroundInput
): Promise<RemoveClothingBackgroundOutput> {
  return removeClothingBackgroundFlow(input);
}

const prompt = ai.definePrompt({
  name: 'removeClothingBackgroundPrompt',
  input: {schema: RemoveClothingBackgroundInputSchema},
  output: {schema: RemoveClothingBackgroundOutputSchema},
  prompt: [
    {media: {url: '{{{photoDataUri}}}'}},
    {
      text:
        'Please remove the background from this image of a clothing item and return the image as a data URI.',
    },
  ],
  model: 'googleai/gemini-2.0-flash-preview-image-generation',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const removeClothingBackgroundFlow = ai.defineFlow(
  {
    name: 'removeClothingBackgroundFlow',
    inputSchema: RemoveClothingBackgroundInputSchema,
    outputSchema: RemoveClothingBackgroundOutputSchema,
  },
  async input => {
    const {media} = await prompt(input);
    return {processedPhotoDataUri: media!.url!};
  }
);
