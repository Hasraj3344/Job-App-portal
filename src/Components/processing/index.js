import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { supabase } from "../Database/supabaseClient";
import { useNavigate } from 'react-router-dom'; 
import { GlobalWorkerOptions, getDocument, version } from 'pdfjs-dist';

// Update to point to the local worker
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdfjs-worker/pdf.worker.min.mjs`;


const Processing = () => {
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [isProcessing, setIsProcessing] = useState(true);
    const [similarityScore, setSimilarityScore] = useState(null);
    const [resumeText, setResumeText] = useState(""); 
    const [session, setSession] = useState(null);
    const [topSimilarityScore, setTopSimilarityScore] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const location = useLocation();
    const { query, location: jobLocation } = location.state || {};
    

    //Pagenation
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 10;
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const jobsArray = Array.from(matchedJobs);  // Coerce to a real array
    const currentJobs = jobsArray.slice(indexOfFirstJob, indexOfLastJob); 
    const totalPages = Math.ceil(matchedJobs.length / jobsPerPage);



    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    


    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    


    const extractTextFromPDF = async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(' ');
            text += pageText + '\n';
        }
        return text;
    };

    


    const fetchResumeText = async (bucket, path) => {
        const { data, error } = await supabase.storage.from(bucket).download(path);
        if (error) throw error;
    
        const blob = data;  // data is already a File object, which is a Blob
        return extractTextFromPDF(blob);
    };
    

    useEffect(() => {
        const analyzeResume = async () => {
            setIsProcessing(true);
            setErrorMessage(null);
        
            if (!session?.user) {
                setErrorMessage("No user session found. Please log in again.");
                setIsProcessing(false);
                return;
            }
        
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('resume_url')
                .eq('auth_id', session.user.id)
                .single();
        
            if (userError || !userData?.resume_url) {
                setErrorMessage("Resume not found. Please upload your resume first.");
                setIsProcessing(false);
                return;
            }
        
            try {
                // Extract bucket and path
                const urlParts = userData.resume_url.split('/');
                const path = urlParts.slice(-3).join('/'); // depends on your URL structure
                const bucket = urlParts.at(-4);
        
                const extractedText = await fetchResumeText(bucket, path);
                setResumeText(extractedText);
        
                const response = await axios.post('http://localhost:5050/api/match-resume', {
                    resumeText: extractedText,
                    query: query,
                    location: jobLocation || 'us'
                });
        
                const matched = response.data || [];
                setMatchedJobs(matched);
        
                if (matched.length > 0) {
                    setTopSimilarityScore(matched[0].similarity.toFixed(2));
                    setSimilarityScore(Math.round((matched.length / 100) * 100));
                } else {
                    setTopSimilarityScore(null);
                    setSimilarityScore(0);
                }
            } catch (err) {
                console.error("Error analyzing resume:", err);
                setErrorMessage("Something went wrong while analyzing your resume.");
            } finally {
                setIsProcessing(false);
            }
        };
        

        if (session) {
            analyzeResume();
        }
    }, [session, query, jobLocation]);

    const handleApply = (job) => {
        navigate(`/apply/${job.id}`, {
          state: {
            jobtitle: job.title,
            jobDescription: job.description, // make sure this field exists in your job object
            resume: resumeText,
          },
        });
      };
      
      

    

    return (
        <>
    <ProcessingContainer>
        {isProcessing ? (
            <>
                <h1>Processing Your Resume...</h1>
                <p>Please wait while we analyze your resume and find the best job matches.</p>
                <Loader />
            </>
        ) : errorMessage ? (
            <>
                <h1>Error</h1>
                <p>{errorMessage}</p>
            </>
        ) : (
            <>
                <h1>Processing Complete!</h1>
                <ScoreContainer>
                    <h2>Resume Match Summary</h2>
                    {topSimilarityScore && (
                        <TopScore>Top Match Similarity: {topSimilarityScore}%</TopScore>
                    )}
                </ScoreContainer>
            </>
        )}
    </ProcessingContainer>

    <div style={{ marginTop: '50px' }}>
        {!isProcessing && !errorMessage && matchedJobs.length > 0 && (
            <>
                <JobsList>
                    <h2>Matching Jobs:</h2>
                    {currentJobs.map((job, index) => (
                        <JobCard key={index}>
                            <h3>{job.title}</h3>
                            <p>{job.company} - {job.location}</p>
                            <a href={job.url} target="_blank" rel="noopener noreferrer">View Job</a>
                            <Similarity>Similarity: {job.similarity.toFixed(2)}%</Similarity>
                            <button className="apply-button" onClick={() => handleApply(job)}>Apply</button>
                        </JobCard>
                    ))}
                </JobsList>

                {totalPages > 1 && (
                    <PaginationContainer>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <PageButton
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                active={i + 1 === currentPage}
                            >
                                {i + 1}
                            </PageButton>
                        ))}
                    </PaginationContainer>
                )}
            </>
        )}

        {!isProcessing && !errorMessage && matchedJobs.length === 0 && (
            <NoJobsMessage>No matching jobs found for your resume.</NoJobsMessage>
        )}
    </div>
</>
    );
};

// Styled Components remain unchanged...


// Updated ProcessingContainer with a debug border
const ProcessingContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 30vh;
    width: 100vw;
    background-color: #f9f9f9;
    text-align: center;
`;

const Loader = styled.div`
    margin-top: 20px;
    border: 8px solid #f3f3f3;
    border-top: 8px solid #007bff;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const ScoreContainer = styled.div`
    margin-top: 20px;
    padding: 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 10px;
    width: 80%;
`;

const Score = styled.div`
    font-size: 3rem;
    font-weight: bold;
    color: #007bff;
    margin-top: 10px;
`;

const JobsList = styled.div`
    
    width: 80%;
    display: flex;
    padding: 5%;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    margin-left: 5%;
    max-height: 500px;
    overflow-y: auto;
`;

const JobCard = styled.div`
    background: #fff;
    padding: 20px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: left;

    h3 {
        margin-bottom: 10px;
        color: #333;
        font-size: 1.4rem;
    }

    p {
        margin-bottom: 10px;
        color: #666;
    }

    a {
        color: #007bff;
        font-weight: bold;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
`;

const Similarity = styled.div`
    margin-top: 10px;
    font-size: 0.9rem;
    color: #28a745;
    font-weight: bold;
`;

const TopScore = styled.div`
    margin-top: 10px;
    font-size: 1.2rem;
    color: #ff5722;
    font-weight: bold;
`;

const NoJobsMessage = styled.p`
    text-align: center;
    font-size: 1.2rem;
    color: #666;
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
`;

const PageButton = styled.button`
    padding: 8px 12px;
    border: 1px solid #007bff;
    background-color: ${({ active }) => (active ? '#007bff' : '#fff')};
    color: ${({ active }) => (active ? '#fff' : '#007bff')};
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
        background-color: #0056b3;
        color: #fff;
    }
`;
const ApplyButton = styled.button`
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background-color: #218838;
    }
`;
const ApplyButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

export default Processing;
