import sys
import json
import faiss
import numpy as np
import os
import requests
from sentence_transformers import SentenceTransformer

# Load input from stdin
input_data = sys.stdin.read()
params = json.loads(input_data)

resume_text = params.get('resumeText')
query = params.get('query')
location = params.get('location')

# Adzuna API credentials from environment
ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY')

# Load embedding model
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Error loading model: {str(e)}", file=sys.stderr)
    sys.exit(1)

# Validate input
if not resume_text or not query or not location:
    print(json.dumps({'error': 'Missing required parameters (resumeText, query, or location)'}))
    sys.exit(0)

print(f"Received parameters: resumeText={resume_text[:50]}... query={query}, location={location}", file=sys.stderr)

# Fetch jobs from Adzuna API
def fetch_jobs(query, location, pages=1):
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
            res.raise_for_status()
            response_data = res.json()
            if 'results' in response_data:
                jobs.extend(response_data['results'])
        except Exception as err:
            print(f"Error fetching jobs: {err}", file=sys.stderr)
            break
    return jobs

jobs_data = fetch_jobs(query, location)

if not jobs_data:
    print(json.dumps({'error': 'No jobs found for the given search criteria'}))
    sys.exit(0)

job_texts = []
job_infos = []

for job in jobs_data:
    full_text = f"{job.get('title', '')} {job.get('description', '')}"
    job_texts.append(full_text[:2048])  # Truncate to avoid memory overload
    job_infos.append({
        'id': job.get('id'),
        'title': job.get('title'),
        'description': job.get('description'),
        'company': job.get('company', {}).get('display_name'),
        'location': job.get('location', {}).get('display_name'),
        'url': job.get('redirect_url')
    })

print(f"Embedding {len(job_texts)} job descriptions...", file=sys.stderr)
try:
    job_embeddings = model.encode(job_texts, normalize_embeddings=True, batch_size=8)
except Exception as e:
    print(f"Error during job embedding: {str(e)}", file=sys.stderr)
    sys.exit(1)

print("Embedding resume text...", file=sys.stderr)
try:
    resume_embedding = model.encode([resume_text], normalize_embeddings=True)
except Exception as e:
    print(f"Error during resume embedding: {str(e)}", file=sys.stderr)
    sys.exit(1)

# Log shapes
print(f"Job Embeddings Shape: {job_embeddings.shape}", file=sys.stderr)
print(f"Resume Embedding Shape: {resume_embedding.shape}", file=sys.stderr)

# Build FAISS index
dimension = job_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(np.array(job_embeddings))

# Similarity search
print("Performing similarity search...", file=sys.stderr)
D, I = index.search(np.array(resume_embedding), 100)

# Top matches
top_matches = []
for idx, score in zip(I[0], D[0]):
    similarity_percent = float(score * 100)
    if idx < len(job_infos) and similarity_percent > 10:
        job_info = job_infos[idx]
        job_info['similarity'] = similarity_percent
        top_matches.append(job_info)

# Output
if top_matches:
    print(json.dumps(top_matches))
else:
    print(json.dumps({'error': 'No top matches found with sufficient similarity'}))
