// flows.js
import ai from './genkit.config.js';
import { z } from 'genkit';
import fs from 'fs-extra';
import csvParser from 'csv-parser';
import { Document } from 'genkit/retriever';

const csvFilePath = './data/data.csv';

async function readCSV() {
  return new Promise((resolve, reject) => {
    const documents = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Combine relevant fields into a single string
        const docContent = `
ID: ${row.ID}
Name: ${row.NAME}
Organization: ${row.ORGANIZATION}
Category: ${row.CATEGORY}
Description: ${row.DESCRIPTION}
Address: ${row.ADDRESS}
City: ${row.CITY}
Zip Code: ${row.ZIP_CODE}
URL: ${row.URL}
Phone: ${row.PHONE}
Email: ${row.EMAIL}
Eligibility Criteria: ${row.ELIGIBILITY_CRITERIA}
Appointment Required: ${row.APPOINTMENT_REQUIRED}
Referral Required From: ${row.REFERRAL_REQUIRED_FROM}
Start Date: ${row.START_DATE}
End Date: ${row.END_DATE}
Is Always Open: ${row.IS_ALWAYS_OPEN}
Open Hours: ${row.OPEN_HOURS_USER_INPUT}
Internal Notes: ${row.INTERNAL_NOTES}
Last Modified: ${row.LAST_MODIFIED_DATETIME}
        `;
        documents.push(Document.fromText(docContent));
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve(documents);
      })
      .on('error', reject);
  });
}

export const csvIndexerFlow = ai.defineFlow(
  {
    name: 'csvIndexerFlow',
    inputSchema: z.void(),
    outputSchema: z.void(),
  },
  async () => {
    // Read CSV data
    const documents = await readCSV();

    // Index documents (we'll use a simple array as our index)
    ai.memory = documents; // Store documents in memory

    console.log('Documents indexed successfully.');
  }
);

export const csvQAFlow = ai.defineFlow(
  {
    name: 'csvQAFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (input) => {
    // Retrieve relevant documents
    const queryEmbedding = await ai.embed({
      embedder: textEmbeddingGecko,
      content: input,
    });

    // For simplicity, we'll calculate cosine similarity manually
    function cosineSimilarity(a, b) {
      const dotProduct = a.reduce((sum, val, idx) => sum + val * b[idx], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }

    const docs = [];
    for (const doc of ai.memory) {
      const docEmbedding = await ai.embed({
        embedder: textEmbeddingGecko,
        content: doc.content,
      });

      const similarity = cosineSimilarity(queryEmbedding.value, docEmbedding.value);
      docs.push({ doc, similarity });
    }

    // Sort by similarity and take top 3
    docs.sort((a, b) => b.similarity - a.similarity);
    const topDocs = docs.slice(0, 3).map((item) => item.doc.content);

    // Generate a response
    const { text } = await ai.generate({
      prompt: `
You are a helpful AI assistant that can answer questions based on the following context.

Use only the context provided to answer the question.
If you don't know, do not make up an answer.

Context:
${topDocs.join('\n\n')}

Question: ${input}
Answer:
      `,
    });

    return text.trim();
  }
);
