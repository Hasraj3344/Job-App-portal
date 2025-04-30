import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';

const ApplyPage = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const [rewrittenResume, setRewrittenResume] = useState('');
  const [editableResume, setEditableResume] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const { jobDescription, resume, jobtitle } = location.state || {};

  useEffect(() => {
    const fetchRewrittenResume = async () => {
      if (!jobDescription || !resume) {
        console.error("Missing job description or resume");
        return;
      }

      try {
        const response = await fetch('http://localhost:5050/api/rewrite-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobDescription, resume }),
        });

        const data = await response.json();
        setRewrittenResume(data.rewrittenResume);
        setEditableResume(data.rewrittenResume);
      } catch (err) {
        console.error('Error rewriting resume:', err);
        setRewrittenResume('❌ Failed to rewrite resume');
      } finally {
        setLoading(false);
      }
    };

    fetchRewrittenResume();
  }, [jobDescription, resume]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Rewritten Resume for Job ${jobId} - ${jobtitle}`, 10, 10);

    // Add rewritten resume content
    doc.setFontSize(12);
    doc.text(editableResume, 10, 20);

    // Save the PDF with a filename
    doc.save(`rewritten_resume_job_${jobId}.pdf`);
  };

  return (
    <PageContainer>
      <Header>Rewritten Resume for Job {jobId} - {jobtitle}</Header>

      {loading ? (
        <Loading>⏳ Rewriting your resume...</Loading>
      ) : (
        <>
          {isEditing ? (
            <StyledTextarea
              value={editableResume}
              onChange={(e) => setEditableResume(e.target.value)}
              rows={20}
            />
          ) : (
            <StyledPre>{editableResume}</StyledPre>
          )}

          <ButtonGroup>
            <ActionButton onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? '✅ Done Editing' : '✏️ Edit'}
            </ActionButton>
            <DownloadButton onClick={handleDownloadPDF}>
              ⬇️ Download Resume as PDF
            </DownloadButton>
          </ButtonGroup>
        </>
      )}
    </PageContainer>
  );
};

export default ApplyPage;

// ----------------------
// Styled Components
// ----------------------

const PageContainer = styled.div`
  max-width: 90%;
  margin: 4rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const Loading = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
`;

const StyledPre = styled.pre`
  white-space: pre-wrap;
  background-color: #f4f6f8;
  padding: 1.5rem;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #333;
`;

const StyledTextarea = styled.textarea`
  width: 90%;
  height: 100%;
  resize: none;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  line-height: 1.5;
  background: #fefefe;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ActionButton = styled.button`
  background-color: #0066ff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #0052cc;
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #28a745;

  &:hover {
    background-color: #1e7e34;
  }
`;
