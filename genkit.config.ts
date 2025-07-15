import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI()],
});
