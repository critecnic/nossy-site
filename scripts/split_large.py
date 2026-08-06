#!/usr/bin/env python3
"""Split large country files into chunks for faster loading"""
import json, os, math

PUBLIC = "/home/z/my-project/public/data"

def split_large(filepath, max_size_kb=2000):
    size = os.path.getsize(filepath)
    if size <= max_size_kb * 1024:
        return
    bn = os.path.basename(filepath)
    print(f"Splitting {bn} ({size//1024}KB)...")
    with open(filepath, 'r') as f:
        jobs = json.load(f)
    
    n = len(jobs)
    est_chunk_size = max_size_kb * 1024 / (size / n)  # how many jobs fit in max_size_kb
    chunk_size = max(500, int(est_chunk_size))
    num_chunks = math.ceil(n / chunk_size)
    
    # Write chunks
    chunks = []
    for i in range(num_chunks):
        start = i * chunk_size
        end = min(start + chunk_size, n)
        chunk_file = filepath.replace('.json', f'_{i}.json')
        with open(chunk_file, 'w') as f:
            json.dump(jobs[start:end], f, ensure_ascii=False, separators=(',', ':'))
        chunks.append(f"{i}")
        print(f"  Chunk {i}: jobs {start}-{end-1} ({os.path.getsize(chunk_file)//1024}KB)")
    
    # Write index
    idx_file = filepath.replace('.json', '_index.json')
    with open(idx_file, 'w') as f:
        json.dump({"total": n, "chunks": chunks, "chunkSize": chunk_size}, f)
    
    # Remove original
    os.remove(filepath)
    print(f"  Created {num_chunks} chunks. Removed original.")

def main():
    import glob
    for f in sorted(glob.glob(os.path.join(PUBLIC, "*.json"))):
        bn = os.path.basename(f)
        if bn in ("countries.json", "latest_20.json"):
            continue
        if "_index.json" in bn or "_0.json" in bn or "_1.json" in bn:
            continue
        split_large(f)

if __name__ == "__main__":
    main()