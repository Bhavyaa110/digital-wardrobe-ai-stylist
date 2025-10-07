'use server';

/**
 * @fileOverview AI flow to suggest style and mood tags for a clothing item.
 *
 * - tagClothingItem - A function that handles the clothing item tagging process.
 * - TagClothingItemInput - The input type for the tagClothingItem function.
 * - TagClothingItemOutput - The return type for the tagClothingItem function.
 */

import { ai } from '../genkit'; // Adjust the path as needed
import { z } from 'genkit';
const TagClothingItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the typo here
    ),
  description: z.string().describe('The description of the clothing item.'),
});
export type TagClothingItemInput = z.infer<typeof TagClothingItemInputSchema>;

const TagClothingItemOutputSchema = z.object({
  styleTags: z.array(z.string()).describe('Suggested style tags for the clothing item.'),
  moodTags: z.array(z.string()).describe('Suggested mood tags for the clothing item.'),
});
export type TagClothingItemOutput = z.infer<typeof TagClothingItemOutputSchema>;

export async function tagClothingItem(input: TagClothingItemInput): Promise<TagClothingItemOutput> {
  return tagClothingItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tagClothingItemPrompt',
  input: {schema: TagClothingItemInputSchema},
  output: {schema: TagClothingItemOutputSchema},
  prompt: `You are an AI fashion assistant. You will receive a description and a photo of a clothing item. Based on these, you will provide style and mood tags applicable to the item.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}

Provide the style and mood tags as arrays of strings.

Example:
{
  "styleTags": ["casual", "streetwear"],
  "moodTags": ["relaxed", "confident"]
}
`,
});

const tagClothingItemFlow = ai.defineFlow(
  {
    name: 'tagClothingItemFlow',
    inputSchema: TagClothingItemInputSchema,
    outputSchema: TagClothingItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
