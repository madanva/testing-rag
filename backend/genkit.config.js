// genkit.config.js

import dotenv from 'dotenv';
dotenv.config();

import { genkit } from 'genkit';
import { googleAI, gemini15Pro } from '@genkit-ai/googleai'; // Removed textEmbedding004

const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Pro, // Set default model
});

export default ai;