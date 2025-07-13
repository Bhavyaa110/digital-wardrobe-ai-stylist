import { config } from 'dotenv';
config();

import '@/ai/flows/clothing-item-background-removal.ts';
import '@/ai/flows/generate-outfit-suggestions.ts';
import '@/ai/flows/tag-clothing-item.ts';
import '@/ai/flows/try-on-avatar-generation.ts';
import '@/ai/flows/remove-clothing-background.ts';
import '@/ai/flows/ai-avatar-try-on.ts';