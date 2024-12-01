// index.js
import express from 'express';
import cors from 'cors';
import ai from './genkit.config.js';
import { csvIndexerFlow, csvQAFlow } from './flows.js';

const app = express();
app.use(cors());
app.use(express.json());

// Run the indexer flow at startup
(async () => {
  try {
    await ai.runFlow(csvIndexerFlow);
  } catch (error) {
    console.error('Error indexing documents:', error);
  }
})();

app.post('/query', async (req, res) => {
  const userQuery = req.body.query;
  try {
    const response = await ai.runFlow(csvQAFlow, userQuery);
    res.json({ response });
  } catch (error) {
    console.error('Error handling query:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
