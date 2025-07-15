'use server';
/**
 * @fileOverview Flow for generating an AI avatar wearing a specified outfit.
 */
import { ai } from '@genkit-ai/core';
import { z } from 'genkit';

// Input schema
const AiAvatarTryOnInputSchema = z.object({
  avatarDataUri: z.string().describe(
    "A photo of the user's avatar, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  topDataUri: z.string().describe(
    "A photo of the top clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  bottomDataUri: z.string().describe(
    "A photo of the bottom clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});

export type AiAvatarTryOnInput = z.infer<typeof AiAvatarTryOnInputSchema>;

// Output schema
const AiAvatarTryOnOutputSchema = z.object({
  generatedAvatarDataUri: z
    .string()
    .describe('The generated avatar image with the outfit, as a data URI.'),
});

export type AiAvatarTryOnOutput = z.infer<typeof AiAvatarTryOnOutputSchema>;

// Public function
export async function aiAvatarTryOn(input: AiAvatarTryOnInput): Promise<AiAvatarTryOnOutput> {
  return aiAvatarTryOnFlow(input);
}

// Prompt template (optional but defined)
const prompt = ai.definePrompt({
  name: 'aiAvatarTryOnPrompt',
  input: { schema: AiAvatarTryOnInputSchema },
  output: { schema: AiAvatarTryOnOutputSchema },
  prompt: `Generate an image of the user's avatar wearing the following outfit.\n\nAvatar: {{media url=avatarDataUri}}\nTop: {{media url=topDataUri}}\nBottom: {{media url=bottomDataUri}}\n\nEnsure the generated image realistically depicts the outfit on the avatar, maintaining the avatar's likeness and the clothing's details.`,
});

// Flow definition
const aiAvatarTryOnFlow = ai.defineFlow(
  {
    name: 'aiAvatarTryOnFlow',
    inputSchema: AiAvatarTryOnInputSchema,
    outputSchema: AiAvatarTryOnOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.avatarDataUri } },
        { text: 'generate an image of this character wearing this top ' },
        { media: { url: input.topDataUri } },
        { text: 'and these bottoms' },
        { media: { url: input.bottomDataUri } },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // ✅ Fix: Return correct key expected by output schema
    return { generatedAvatarDataUri: media!.url! };
  }
);
