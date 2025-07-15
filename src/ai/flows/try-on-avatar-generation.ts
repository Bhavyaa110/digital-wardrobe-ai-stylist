'use server';
/**
 * @fileOverview Flow for generating an AI avatar wearing a specified outfit.
 *
 * - tryOnAvatarGeneration - A function that generates an AI avatar wearing a specified outfit.
 * - TryOnAvatarGenerationInput - The input type for the tryOnAvatarGeneration function.
 * - TryOnAvatarGenerationOutput - The return type for the tryOnAvatarGeneration function.
 */
import { ai } from '../genkit'; // Adjust the path as needed
import { z } from 'genkit';

const TryOnAvatarGenerationInputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      "A photo of the user's avatar, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  topDataUri: z
    .string()
    .describe(
      "A photo of the top clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  bottomDataUri: z
    .string()
    .describe(
      "A photo of the bottom clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TryOnAvatarGenerationInput = z.infer<typeof TryOnAvatarGenerationInputSchema>;

const TryOnAvatarGenerationOutputSchema = z.object({
  generatedAvatarDataUri: z
    .string()
    .describe('The generated avatar image with the outfit, as a data URI.'),
});
export type TryOnAvatarGenerationOutput = z.infer<typeof TryOnAvatarGenerationOutputSchema>;

export async function tryOnAvatarGeneration(input: TryOnAvatarGenerationInput): Promise<TryOnAvatarGenerationOutput> {
  return tryOnAvatarGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tryOnAvatarGenerationPrompt',
  input: {schema: TryOnAvatarGenerationInputSchema},
  output: {schema: TryOnAvatarGenerationOutputSchema},
  prompt: `Generate an image of the user's avatar wearing the following outfit.

Avatar: {{media url=avatarDataUri}}
Top: {{media url=topDataUri}}
Bottom: {{media url=bottomDataUri}}

Ensure the generated image realistically depicts the outfit on the avatar, maintaining the avatar's likeness and the clothing's details.`,
});

const tryOnAvatarGenerationFlow = ai.defineFlow(
  {
    name: 'tryOnAvatarGenerationFlow',
    inputSchema: TryOnAvatarGenerationInputSchema,
    outputSchema: TryOnAvatarGenerationOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.avatarDataUri}},
        {text: 'generate an image of this character wearing this top '},
        {media: {url: input.topDataUri}},
        {text: 'and these bottoms'},
        {media: {url: input.bottomDataUri}},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {generatedAvatarDataUri: media!.url!};
  }
);
