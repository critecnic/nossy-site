import gzip, json, os, glob, sys

PUBLIC = "/home/z/my-project/public/data"

def main():
    gz_files = sorted(glob.glob(os.path.join(PUBLIC, "*.json.gz")))
    for gz in gz_files:
        out = gz.replace(".json.gz", ".json")
        if os.path.exists(out):
            sz = os.path.getsize(out)
            if sz > 100:
                print(f"SKIP (exists {sz//1024}KB): {os.path.basename(out)}")
                continue
        try:
            with gzip.open(gz, 'rb') as f:
                data = json.loads(f.read().decode('utf-8'))
            with open(out, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
            print(f"OK: {os.path.basename(out)} ({len(data)} items, {os.path.getsize(out)//1024}KB)")
        except Exception as e:
            print(f"ERR: {os.path.basename(gz)} -> {e}")

if __name__ == "__main__":
    main()
