import { config } from 'dotenv';
config();
// src/ai/dev.ts
import 'genkit'; // Import to ensure runtime is loaded
import '../genkit.config'; // Import your genkit config (adjust path if needed)

import '@/ai/flows/clothing-item-background-removal.ts';
import '@/ai/flows/generate-outfit-suggestions.ts';
import '@/ai/flows/tag-clothing-item.ts';
import '@/ai/flows/try-on-avatar-generation.ts';
import '@/ai/flows/remove-clothing-background.ts';
import '@/ai/flows/ai-avatar-try-on.ts';