import sys
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import requests

# Load input from stdin
input_data = sys.stdin.read()
params = json.loads(input_data)

resume_text = params.get('resumeText')
query = params.get('query')
location = params.get('location')

# Constants for Adzuna API
import os

ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY')

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Function to fetch Adzuna jobs with error handling
def fetch_jobs(query, location, pages=10):
    jobs = []
    for page in range(1, pages + 1):
        url = f"https://api.adzuna.com/v1/api/jobs/us/search/{page}"
        params = {
            'app_id': ADZUNA_APP_ID,
            'app_key': ADZUNA_APP_KEY,
            'what': query,
            'where': location,
            'results_per_page': 50
        }
        try:
            res = requests.get(url, params=params)
            res.raise_for_status()  # Raise HTTPError for bad responses
            response_data = res.json()
            if 'results' in response_data:
                jobs.extend(response_data['results'])
        except requests.exceptions.HTTPError as errh:
            print(f"HTTP Error: {errh}", file=sys.stderr)
            break
        except requests.exceptions.ConnectionError as errc:
            print(f"Connection Error: {errc}", file=sys.stderr)
            break
        except requests.exceptions.Timeout as errt:
            print(f"Timeout Error: {errt}", file=sys.stderr)
            break
        except requests.exceptions.RequestException as err:
            print(f"General Error: {err}", file=sys.stderr)
            break
    return jobs

# Validate input parameters
if not resume_text or not query or not location:
    print(json.dumps({'error': 'Missing required parameters (resumeText, query, or location)'}))
    sys.exit(0)

# Log received data for debugging
print(f"Received parameters: resumeText={resume_text[:50]}... query={query}, location={location}", file=sys.stderr)

# Fetch jobs based on the query and location
jobs_data = fetch_jobs(query, location)

# Check if jobs are fetched
if not jobs_data:
    print(json.dumps({'error': 'No jobs found for the given search criteria'}))
    sys.exit(0)

# Prepare job descriptions and job information
job_texts = []
job_infos = []
for job in jobs_data:
    full_text = f"{job.get('title', '')} {job.get('description', '')}"
    job_texts.append(full_text)
    job_infos.append({
        'id': job.get('id'),
        'title': job.get('title'),
        'description': job.get('description'),
        'company': job.get('company', {}).get('display_name'),
        'location': job.get('location', {}).get('display_name'),
        'url': job.get('redirect_url')
    })

# Embed all job descriptions using the Sentence Transformer model
try:
    print("Embedding job descriptions...", file=sys.stderr)
    job_embeddings = model.encode(job_texts, normalize_embeddings=True)
except Exception as e:
    print(f"Error while embedding job descriptions: {e}", file=sys.stderr)
    sys.exit(1)


# Embed the resume text using the same model
print("Embedding resume text...", file=sys.stderr)
resume_embedding = model.encode([resume_text], normalize_embeddings=True)

# Log the shape of embeddings for debugging
print(f"Job Embeddings Shape: {job_embeddings.shape}", file=sys.stderr)
print(f"Resume Embedding Shape: {resume_embedding.shape}", file=sys.stderr)

# Build FAISS index for cosine similarity search
dimension = job_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)  # Inner Product (IP) for cosine similarity
index.add(np.array(job_embeddings))

# Perform the search for top 100 job matches based on resume embedding
print("Performing similarity search...", file=sys.stderr)
D, I = index.search(np.array(resume_embedding), 100)

# Prepare the response for the top matching jobs
top_matches = []
for idx, score in zip(I[0], D[0]):
    similarity_percent = float(score * 100)
    if idx < len(job_infos) and similarity_percent > 10:
        job_info = job_infos[idx]
        job_info['similarity'] = similarity_percent
        top_matches.append(job_info)

# Output the top matches or error if none found
if top_matches:
    print(json.dumps(top_matches))
else:
    print(json.dumps({'error': 'No top matches found with sufficient similarity'}))
