import zipfile
import os

BASE = '/home/z/my-project/download/nossy-github'
OUT = '/home/z/my-project/download/nossy-FULL-deploy.zip'

def should_include(path):
    """Decide which files to include in the ZIP."""
    # Exclude these
    excludes = [
        'node_modules', '.next', '.git', '.env', '.env.local',
        '.vercel', 'out', '.turbo',
    ]
    for ex in excludes:
        if ex in path:
            return False
    # Only include known file types
    ext = os.path.splitext(path)[1]
    allowed_exts = [
        '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css',
        '.png', '.ico', '.svg', '.woff', '.woff2', '.txt', '.lock',
        '.md',
    ]
    if ext and ext not in allowed_exts:
        return False
    return True

files_added = 0
total_size = 0

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(BASE):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', '.vercel', 'out', '.turbo']]
        
        for fname in files:
            fullpath = os.path.join(root, fname)
            if not should_include(fullpath):
                continue
            
            arcname = os.path.relpath(fullpath, BASE)
            zf.write(fullpath, arcname)
            size = os.path.getsize(fullpath)
            total_size += size
            files_added += 1
            if size > 50000 or 'page.tsx' in fname or 'layout.tsx' in fname:
                print(f'  {arcname} ({size:,} bytes)')

print(f'\nZIP: {OUT}')
print(f'Files: {files_added}')
print(f'Size: {total_size:,} bytes ({total_size/1024/1024:.1f} MB)')
