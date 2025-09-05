const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { role, history, newUserParts } = req.body;
    
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemma-2-27b-it" });
    
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: newUserParts }]
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    for await (const chunk of result.stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify(chunk.text())}\n\n`);
      }
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000);
