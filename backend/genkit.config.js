// genkit.config.js
import { genkit } from 'genkit';
import { googleAI, gemini15Pro, textEmbeddingGecko } from '@genkit-ai/googleai';
import dotenv from 'dotenv';

dotenv.config();

const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: gemini15Pro, // Set default model
});

export default ai;
