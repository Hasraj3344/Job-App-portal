import axios from 'axios';

export default async function handler(req, res) {
  const { what, where } = req.query;

  if (!where) {
    return res.status(400).json({ error: 'Missing "where" parameter' });
  }

  const totalPages = 5;
  const results = [];

  const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
  const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

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

    res.status(200).json({ results });
  } catch (error) {
    console.error('❌ Error fetching jobs from Adzuna:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch jobs from Adzuna' });
  }
}
