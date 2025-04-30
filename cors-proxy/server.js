const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const PORT = 5050;

// Optional: use dotenv to manage API keys securely
// require('dotenv').config();

require('dotenv').config();

const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;

console.log(openaiKey); // safe use
;

// Adzuna API credentials
const ADZUNA_APP_ID = '7b9a6cb9';
const ADZUNA_APP_KEY = '18458069195f3cc48420cdb436febdf3';

// Middleware
app.use(cors());
app.use(express.json());

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// GET /api/jobs - Fetch jobs from Adzuna
app.get('/api/jobs', async (req, res) => {
  const { what, where } = req.query;

  if (!where) {
    return res.status(400).json({ error: 'Missing "where" parameter' });
  }

  const totalPages = 5;
  const results = [];

  try {
    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/${page}`, {
        params: {
          app_id: ADZUNA_APP_ID,
          app_key: ADZUNA_APP_KEY,
          what: what || undefined,
          where,
          results_per_page: 50,
        },
      });

      results.push(...response.data.results);
    }


    res.json({ results });
  } catch (error) {
    console.error('❌ Error fetching jobs from Adzuna:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch jobs from Adzuna' });
  }
});


// POST /api/match-resume - Match resume using Python + FAISS
app.post('/api/match-resume', async (req, res) => {
  const { resumeText, query, location } = req.body;

  if (!resumeText || !query || !location) {
    return res.status(400).json({ error: 'Missing resumeText, query, or location' });
  }

  try {
    const scriptPath = path.join(__dirname, 'match_resume.py');
    const python = spawn('python3', [scriptPath]);

    python.stdin.write(JSON.stringify({ resumeText, query, location }));
    python.stdin.end();

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('❌ Python error:', data.toString());
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Python script exited with code ${code}`);
        return res.status(500).json({ error: 'Python script failed' });
      }

      try {
        const parsed = JSON.parse(output);
        res.json(parsed);
      } catch (parseError) {
        console.error('❌ Failed to parse Python output:', parseError);
        res.status(500).json({ error: 'Invalid response from Python script' });
      }
    });
  } catch (err) {
    console.error('❌ Server error running Python script:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rewrite-resume - Rewrite resume using OpenAI
app.post('/api/rewrite-resume', async (req, res) => {
  const { jobDescription, resume } = req.body;

  if (!jobDescription || !resume) {
    return res.status(400).json({ error: 'Missing jobDescription or resume' });
  }

  const prompt = `Rewrite the following resume to better fit the following job description.\n\nJob Description:\n${jobDescription}\n\nResume:\n${resume}`;
  console.log("📝 Prompt:", prompt);

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume editor that rewrites resumes to align with job descriptions.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  };

  try {
    const response = await openai.chat.completions.create(payload);
    const rewrittenResume = response.choices[0].message.content.trim();
    res.json({ rewrittenResume });
  } catch (error) {
    console.error("❌ OpenAI error:", error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
});
