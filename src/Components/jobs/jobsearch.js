import React, { useState } from 'react';
import { useEffect } from 'react';
import './job.css';
import axios from 'axios';
import { supabase } from '../Database/supabaseClient'; // ✅ Make sure this path is correct

const JobSearchPage = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const jobsPerPage = 10;
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);  // Set loading to true while fetching data
      setError(null);  // Reset error state
  
      // Fetch job data from the Adzuna API
      const response = await axios.get('http://localhost:5050/api/jobs', {
        params: {
          what: query,
          where: location || 'us',
        },
      });
      
      
  
      // Extract job data from the response
      const fetchedJobs = response.data.results;
console.log("Fetched Jobs:", fetchedJobs); // ✅ Add this

  
      // Update the jobs state
      setJobs(fetchedJobs);
      setTotalJobs(fetchedJobs.length);  // Update the total job count
  
      // Iterate over each job and upsert into Supabase
      for (const job of fetchedJobs) {
        const { data, error } = await supabase
          .from('jobs')
          .upsert([
            {
              id: job.id,  // Ensures unique job ID constraint is respected
              title: job.title,
              company: job.company.display_name,
              location: job.location.display_name,
              description: job.description,
              redirect_url: job.redirect_url,
            }
          ], { onConflict: ['id'] });
  
        if (error) {
          console.error(`Error upserting job ${job.id}:`, error);
        }
      }
  
      console.log("Job data processed successfully!");
    } catch (err) {
      setError('Error fetching job listings');
      console.error("Error fetching job listings:", err);
    } finally {
      setLoading(false);  // Set loading to false after fetching
    }
  };
  
  
  

  return (
    <div className="job-search-page">
      <h1>Job Search</h1>
      <div className="search-inputs">
        <input
          type="text"
          placeholder="Job Title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="job-listings">
        {currentJobs.length > 0 && (
          <div>
            <h2>Showing {jobs.length} jobs </h2>
          </div>
        )}

        {currentJobs.length > 0 ? (
          currentJobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.company.display_name}</p> {/* Use .display_name */}
              <p>{job.location.display_name}</p> {/* Use .display_name */}
              <p>{job.description.substring(0, 200)}...</p>
              <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
                View job
              </a>
            </div>
          ))
        ) : (
          <p>No jobs found. Try another search.</p>
        )}

        {/* Pagination Controls */}
        <div className="pagination">
          {currentPage > 1 && <button onClick={() => handlePageChange(currentPage - 1)}>{"<"}</button>}
          {currentPage > 2 && <button onClick={() => handlePageChange(1)}>1</button>}
          <button className="active">{currentPage}</button>
          {currentPage < totalPages - 1 && <button onClick={() => handlePageChange(totalPages)}>{totalPages}</button>}
          {currentPage < totalPages && <button onClick={() => handlePageChange(currentPage + 1)}>{">"}</button>}
        </div>
      </div>
    </div>
  );
};

export default JobSearchPage;
