const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 5050;

// Optional: use dotenv to manage API keys securely
require('dotenv').config();

const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

console.log(openaiKey); // safe use for debugging

// Middleware
app.use(cors());
app.use(express.json());

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("✅ Supabase URL:", process.env.REACT_APP_SUPABASE_URL);
console.log("✅ Supabase Key:", process.env.REACT_APP_SUPABASE_ANON_KEY);
  console.log("✅ OpenAI Key:", openaiKey);
  console.log("✅ Adzuna App ID:", ADZUNA_APP_ID);
  console.log("✅ Adzuna App Key:", ADZUNA_APP_KEY);
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


  const pathToScript = path.join(__dirname, 'match_resume.py');
const pyProcess = spawn('python3', [pathToScript]);


  let result = '';
  let errorOutput = '';

  pyProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pyProcess.on('close', (code) => {
    if (errorOutput) {
      console.error('❌ Python STDERR:', errorOutput);
    }

    if (code !== 0) {
      return res.status(500).json({ error: 'Python process exited with code ' + code });
    }

    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      console.error('❌ Failed to parse Python output:', result);
      res.status(500).json({ error: 'Failed to parse Python output' });
    }
  });

  pyProcess.stdin.write(JSON.stringify({ resumeText, query, location }));
  pyProcess.stdin.end();
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
