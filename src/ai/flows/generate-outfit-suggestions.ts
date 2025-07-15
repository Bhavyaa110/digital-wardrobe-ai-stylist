// 'use server';

/**
 * @fileOverview Outfit suggestion flow.
 *
 * - generateOutfitSuggestions - A function that generates outfit suggestions based on occasion and weather.
 * - GenerateOutfitSuggestionsInput - The input type for the generateOutfitSuggestions function.
 * - GenerateOutfitSuggestionsOutput - The return type for the generateOutfitSuggestions function.
 */

'use server';
import { ai } from '@genkit-ai/core';
import { z } from 'genkit';

const GenerateOutfitSuggestionsInputSchema = z.object({
  occasion: z.string().describe('The occasion for which an outfit is needed.'),
  weather: z.string().describe('The current weather conditions.'),
  closetItems: z.array(z.string()).describe('A list of available clothing items in the user\'s closet.'),
  userStyle: z.string().describe('The user\'s general style preferences.'),
  styleTags: z.array(z.string()).optional().describe('Specific style tags the user is interested in.'),
  moodTags: z.array(z.string()).optional().describe('Specific mood tags the user wants to embody.'),
});

export type GenerateOutfitSuggestionsInput = z.infer<
  typeof GenerateOutfitSuggestionsInputSchema
>;

const GenerateOutfitSuggestionsOutputSchema = z.object({
  outfitSuggestions: z
    .array(z.string())
    .describe('A list of suggested outfit combinations.'),
  reasoning: z.string().describe('The AI\'s reasoning for the outfit suggestions.'),
});

export type GenerateOutfitSuggestionsOutput = z.infer<
  typeof GenerateOutfitSuggestionsOutputSchema
>;

export async function generateOutfitSuggestions(
  input: GenerateOutfitSuggestionsInput
): Promise<GenerateOutfitSuggestionsOutput> {
  return generateOutfitSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutfitSuggestionsPrompt',
  input: {schema: GenerateOutfitSuggestionsInputSchema},
  output: {schema: GenerateOutfitSuggestionsOutputSchema},
  prompt: `You are a personal stylist helping users choose outfits from their closet.

  Given the following occasion: {{{occasion}}},
  and the following weather conditions: {{{weather}}},
  and the following items in the user's closet: {{#each closetItems}}{{{this}}}, {{/each}},
  and knowing that the user has the following style: {{{userStyle}}},
  {{#if styleTags}}and wants to incorporate these styles: {{#each styleTags}}{{{this}}}, {{/each}}{{/if}}
  {{#if moodTags}}and wants to feel these moods: {{#each moodTags}}{{{this}}}, {{/each}}{{/if}}

  Suggest several appropriate outfit combinations. Explain your reasoning for each suggestion.

  Format your output as a JSON object conforming to the schema.
  `,
});

const generateOutfitSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateOutfitSuggestionsFlow',
    inputSchema: GenerateOutfitSuggestionsInputSchema,
    outputSchema: GenerateOutfitSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
