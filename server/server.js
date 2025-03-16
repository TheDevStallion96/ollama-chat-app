// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint for generating completions
app.post('/api/generate', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Ollama:', error);
    res.status(500).json({ error: 'Failed to generate response from Ollama' });
  }
});

// Proxy endpoint for getting available models
app.get('/api/tags', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models from Ollama:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

app.post('/api/generate-stream', async (req, res) => {
  try {
    // Set headers for event stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Make a streaming request to Ollama
    const response = await axios({
      method: 'post',
      url: 'http://localhost:11434/api/generate',
      data: { ...req.body, stream: true },
      responseType: 'stream'
    });

    // Forward the stream to the client
    response.data.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      res.write(`data: ${chunkStr}\n\n`);
    });

    response.data.on('end', () => {
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      response.data.destroy();
    });
  } catch (error) {
    console.error('Error streaming from Ollama:', error);
    res.status(500).json({ error: 'Failed to stream response from Ollama' });
  }
});