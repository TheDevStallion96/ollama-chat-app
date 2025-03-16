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