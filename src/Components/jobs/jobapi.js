// src/jobapi.js

import axios from 'axios';

// Replace with your own Adzuna credentials
const APP_ID = '7b9a6cb9';
const APP_KEY = '18458069195f3cc48420cdb436febdf3';


const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search/1';




export const fetchJobs = async (query = 'developer', location = 'new york', limit = 6) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          app_id: APP_ID,
          app_key: APP_KEY,
          what: query,
          where: location,
          results_per_page: limit,
          content_type: 'application/json',
        },
      });
      console.log('Adzuna API response:', response.data); // <-- Add this
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      return [];
    }
  };
  
