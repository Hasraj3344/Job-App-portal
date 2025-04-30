# main.py
from vector_utils import encode_text, create_faiss_index, search_index

jobs = [
    "Python backend developer with Flask experience",
    "Frontend React engineer",
    "Data scientist familiar with ML and NLP"
]

# Step 1: Encode job descriptions
job_vectors = encode_text(jobs)

# Step 2: Create FAISS index
index = create_faiss_index(job_vectors)

# Step 3: Encode a sample resume and search
query = "Skilled in Flask, APIs, and Python"
query_vector = encode_text([query])[0]

matches, distances = search_index(index, query_vector)
print("Top matches:")
for i in matches:
    print("-", jobs[i])
