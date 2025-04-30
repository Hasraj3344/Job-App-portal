import React from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";

const RewrittenResumePage = () => {
    const location = useLocation();
    const { rewrittenResume } = location.state || { rewrittenResume: "No rewritten resume available." };

    return (
        <ResumeContainer>
            <h1>Your Rewritten Resume</h1>
            <ResumeContent>{rewrittenResume}</ResumeContent>
        </ResumeContainer>
    );
};

const ResumeContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f9f9f9;
    text-align: center;
`;

const ResumeContent = styled.div`
    margin-top: 20px;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    color: #333;
    max-width: 600px;
    width: 90%;
`;

export default RewrittenResumePage;