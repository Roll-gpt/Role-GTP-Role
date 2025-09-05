const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { role, history, newUserParts } = req.body;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const resultStream = await ai.models.generateContentStream({
    model: 'gemma-3-27b-it',
    contents: [{ role: 'user', parts: newUserParts }],
    config: { temperature: 0.7 }
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  for await (const chunk of resultStream) {
    if (chunk.text) {
      res.write(`data: ${JSON.stringify(chunk.text)}\n\n`);
    }
  }
  res.end();
});

app.listen(process.env.PORT || 3000);
