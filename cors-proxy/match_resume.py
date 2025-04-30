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

# Constants
ADZUNA_APP_ID = '7b9a6cb9'
ADZUNA_APP_KEY = '18458069195f3cc48420cdb436febdf3'

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Function to fetch Adzuna jobs with error handling
def fetch_jobs(query, location, pages=10):
    jobs = []
    for page in range(1, pages):
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
        except requests.exceptions.RequestException as e:
            print(f"Error fetching jobs from Adzuna: {e}", file=sys.stderr)
            break  # Exit early if there's an issue with the API call
    return jobs

# Validate input parameters
if not resume_text or not query or not location:
    print(json.dumps({'error': 'Missing required parameters (resumeText, query, or location)'}))
    sys.exit(0)

# Fetch jobs
jobs_data = fetch_jobs(query, location)

# Prepare job descriptions
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

if not job_texts:
    print(json.dumps({'error': 'No jobs found for the given search criteria'}))
    sys.exit(0)

# Embed all job descriptions
job_embeddings = model.encode(job_texts, normalize_embeddings=True)

# Embed resume
resume_embedding = model.encode([resume_text], normalize_embeddings=True)

# Build FAISS index
dimension = job_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)  # Inner Product for cosine similarity
index.add(np.array(job_embeddings))

# Search top 10 jobs
D, I = index.search(np.array(resume_embedding), 100)  # Search for top 100 matches

# Prepare response
# Prepare response - only include jobs with similarity > 10%
top_matches = []
for idx, score in zip(I[0], D[0]):
    similarity_percent = float(score * 100)
    if idx < len(job_infos) and similarity_percent > 10:
        job_info = job_infos[idx]
        job_info['similarity'] = similarity_percent
        top_matches.append(job_info)


# Output JSON
if top_matches:
    print(json.dumps(top_matches))
else:
    print(json.dumps({'error': 'No top matches found'}))
