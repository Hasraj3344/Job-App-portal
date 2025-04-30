import React, { useState, useEffect } from 'react';
import axios from 'axios'; // <-- this line was missing
import useStyles from './homestyle.js';
import { supabase } from "../Database/supabaseClient"; // ✅ Make sure this path is correct
import { useNavigate } from 'react-router-dom'; // <-- Add this


const Home = () => {
    const classes = useStyles();
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [file, setFile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // <-- initialize it


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
      if (sessionError || !session?.user) {
        alert("You need to be signed in to upload a resume!");
        window.location.href = "/register";
        return;
      }
    
      // ✅ Fetch the user's custom ID from the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single();
    
      if (userError || !userData?.id) {
        console.error("Error fetching user ID:", userError);
        alert("Failed to retrieve user information.");
        return;
      }
    
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const userFolder = `resumes/${userData.id}`;
        const filePath = `${userFolder}/${fileName}`;
    
        // ✅ Upload resume to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
    
        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          alert("Failed to upload resume. Please try again.");
          return;
        }
    
        // ✅ Retrieve the public URL of the uploaded resume
        const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
        const resumeUrl = publicUrlData?.publicUrl;
    
        if (!resumeUrl) {
          console.error("Error retrieving public URL.");
          alert("Failed to retrieve resume URL.");
          return;
        }
    
        // ✅ Insert resume URL into the Supabase database
        const { error: updateError } = await supabase
      .from('users')
      .update({ resume_url: resumeUrl })  // ✅ Adds resume URL field in users table
      .eq('id', userData.id);

    if (updateError) {
      console.error("Error updating resume URL in users table:", updateError.message);
      alert("Failed to update resume URL in profile.");
      return;
    }
    
        console.log("Resume successfully uploaded:", resumeUrl);
        alert(`File "${file.name}" uploaded successfully!`);
        navigate("/processing", { state: { query, location } });
      } else {
        alert("Please select a file to upload.");
      }
    };
    
    useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await axios.get('https://<your-render-backend-url>/api/jobs', { // Update with your backend URL
            params: {
              what: query,
              where: location || 'us',
            },
          });
          setJobs(response.data.results.slice(0, 6));
        } catch (err) {
          setError('Error fetching job listings. Please try again later.');
        }
      };
    
      fetchJobs();
    }, []);
    

    return (
      <div className={classes.container}>
      <section className={classes.section1}>
        <div className={classes.column}>
        <h3 className={classes.s1H2}>New Platform for Jobs</h3>
        <h1 className={classes.s1H1}>New Offers are Waiting for You</h1>
        <p className={classes.s1p}>Searching and finding your dream job is made easier than ever. Just upload your current resume and relax we got it from there. </p>
        <div className={classes.uploadSection} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title (e.g., Software Engineer)"
          className={classes.fileInput} // Updated to match file input styling
          />
          <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g., New York)"
          className={classes.fileInput} // Updated to match file input styling
          />
          <input
          type="file"
          onChange={handleFileChange}
          className={classes.fileInput}
          placeholder='Upload your resume'
          accept=".pdf, .doc, .docx"
          />
          <button onClick={handleUpload} className={classes.uploadButton}>
          Upload Resume
          </button>
        </div>
        </div>
      </section>
      <section className={classes.section2}>
        <h2 className={classes.s2h2}>
        Some of the best job offers.....
        </h2>
        <div className={classes.jobsection}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
          <div key={job.id} className={classes.jobCard}>
            <h3 className={classes.jobTitle}>{job.title}</h3>
            <p className={classes.companyName}>{job.company.display_name}</p>
            <p className={classes.jobDetails}>
            {job.contract_time || 'Full-time'} • {job.location.display_name} • ${job.salary_min || 'N/A'}/year
            </p>
            <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
            <button className={classes.applyButton}>Apply Now</button>
            </a>
          </div>
          ))
        ) : (
          <p>No jobs available.</p>
        )}
        </div>
      </section>
      </div>
    );
};

export default Home;