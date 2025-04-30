# vector_utils.py
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load model (can be cached to avoid reloading)
model = SentenceTransformer('all-MiniLM-L6-v2')

def encode_text(texts):
    embeddings = model.encode(texts)
    return np.array(embeddings).astype("float32")

def create_faiss_index(vectors):
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    return index

def search_index(index, query_vector, top_k=3):
    D, I = index.search(np.array([query_vector]), top_k)
    return I[0], D[0]
